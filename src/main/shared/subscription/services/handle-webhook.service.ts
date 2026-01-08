import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { PaymentMetadata } from '@/lib/stripe/stripe.types';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class HandleWebhookService {
  private readonly logger = new Logger(HandleWebhookService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

  @HandleError('Failed to handle Stripe webhook', 'Subscription')
  async handleWebhook(signature: string, rawBody: Buffer) {
    // 1. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);

      this.logger.log(`Received Stripe event: ${event.type}`);

      // 2. Process the event
      await this.handleEvent(event);
    } catch (error) {
      this.logger.error('Webhook  failed', error);
      throw new AppError(400, 'Invalid webhook signature');
    }
  }

  private async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'setup_intent.succeeded':
        await this.handleSetupIntentSucceeded(
          event.data.object as Stripe.SetupIntent,
        );
        break;

      case 'setup_intent.setup_failed':
      case 'setup_intent.canceled':
        await this.handleSetupIntentFailed(
          event.data.object as Stripe.SetupIntent,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleCustomerSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        this.logger.log(
          `Handled invoice.paid for invoice ${event.data.object.id}`,
          JSON.stringify(event.data.object, null, 2),
        );
        break;

      default:
        this.logger.log(
          `Unhandled Stripe event type: ${event.type}`,
          // JSON.stringify(event, null, 2),
        );
    }
  }

  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const transactionId = setupIntent.id;
    const metadata = setupIntent.metadata as unknown as PaymentMetadata;
    const customerId = setupIntent.customer as string;

    // Find pending subscription created during onboarding
    const subscription = await this.prisma.client.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
      include: { user: true, plan: true },
    });

    if (!subscription) {
      this.logger.error(
        `No subscription found for SetupIntent ${transactionId}`,
      );
      return;
    }

    this.logger.log(
      `SetupIntent succeeded for subscription ${subscription.id}`,
    );

    try {
      const paymentMethodId = setupIntent.payment_method as string;

      // Check for promo code in metadata or local DB
      const promoCodeCode = metadata.promoCode;
      let coupon: string | undefined;
      let trialPeriodDays: number | undefined;

      if (promoCodeCode) {
        const promo = await this.prisma.client.promoCode.findUnique({
          where: { code: promoCodeCode },
        });

        if (promo) {
          if (
            promo.stripeCouponId &&
            !promo.stripeCouponId.startsWith('trial_')
          ) {
            coupon = promo.stripeCouponId;
          }

          // Apply trial days from DB
          if (promo.freeDays) {
            trialPeriodDays = promo.freeDays;
          }
        }
      }

      const stripeSub = await this.stripeService.createSubscription({
        customerId,
        priceId: metadata.stripePriceId,
        metadata,
        paymentMethodId,
        coupon,
        trialPeriodDays,
      });

      await this.prisma.client.$transaction([
        this.prisma.client.user.update({
          where: { id: subscription.userId },
          data: {
            currentPlan: { connect: { id: subscription.planId } },
            currentPlanStatus: 'ACTIVE',
            stripeCustomerId: customerId,
          },
        }),
        this.prisma.client.boats.updateMany({
          where: {
            userId: subscription.userId,
            status: 'ONBOARDING_PENDING',
          },
          data: { status: 'ACTIVE' },
        }),
      ]);

      this.logger.log(
        `Subscription ${subscription.id} activated successfully via SetupIntent for stripe subscription ${stripeSub.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to create subscription for SetupIntent ${transactionId}`,
        err,
      );
      throw err;
    }
  }

  private async handleSetupIntentFailed(setupIntent: Stripe.SetupIntent) {
    const transactionId = setupIntent.id;

    const subscription = await this.prisma.client.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription not found for failed SetupIntent ${transactionId}`,
      );
      return;
    }

    try {
      await this.prisma.client.userSubscription.update({
        where: { id: subscription.id },
        data: { status: 'FAILED', failedAt: new Date() },
      });
      this.logger.warn(
        `SetupIntent failed for subscription ${subscription.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to update failed subscription ${subscription.id}`,
        err,
      );
      throw err;
    }
  }

  private async handleCustomerSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ) {
    const stripeSubId = subscription.id;
    this.logger.log(
      `customer.subscription.updated: ${stripeSubId} status=${subscription.status}`,
    );

    const local = await this.prisma.client.userSubscription.findUnique({
      where: { stripeSubscriptionId: stripeSubId },
      include: { plan: true },
    });

    if (!local) {
      this.logger.warn(
        `No local subscription found for stripe subscription ${stripeSubId}`,
      );
      return;
    }

    const updates: any = {};

    // Map stripe->local status
    if (subscription.status === 'active') updates.status = 'ACTIVE';
    else if (subscription.status === 'past_due') updates.status = 'PAST_DUE';
    else if (
      subscription.status === 'canceled' ||
      subscription.status === 'incomplete_expired' ||
      subscription.status === 'unpaid' ||
      subscription.status === 'incomplete'
    )
      updates.status = 'CANCELED';

    // Update cancel_at or planEndedAt if present
    if (subscription.cancel_at)
      updates.planEndedAt = new Date(subscription.cancel_at * 1000);
    if (subscription.ended_at)
      updates.planEndedAt = new Date(subscription.ended_at * 1000);

    if (Object.keys(updates).length) {
      await this.prisma.client.userSubscription.update({
        where: { id: local.id },
        data: updates,
      });
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`invoice.${invoice.status}: ${invoice.id}`);

    // Extract subscription info safely
    const subDetails = invoice.parent?.subscription_details;
    const subscriptionId = subDetails?.subscription as string | undefined;
    const metadata = subDetails?.metadata as PaymentMetadata | undefined;

    if (!subscriptionId || !metadata) {
      this.logger.warn(
        `Invoice ${invoice.id} has no subscription details — skipping.`,
      );
      return;
    }

    const { userId, planId } = metadata;

    // Fetch local subscription
    const localSubscription =
      await this.prisma.client.userSubscription.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: subscriptionId },
            { userId: userId, planId: planId },
          ],
        },
        include: { plan: true },
      });

    if (!localSubscription) {
      this.logger.error(
        `No matching local subscription found for Stripe subscription ${subscriptionId}`,
      );
      return;
    }

    const now = new Date();
    const planEnd = this.utils.addMonthsToDate(
      now,
      localSubscription.plan.billingPeriodMonths || 1,
    );

    // Run updates in transaction
    await this.prisma.client.$transaction([
      this.prisma.client.userSubscription.update({
        where: { id: localSubscription.id },
        data: {
          status: 'ACTIVE',
          paidAt: now,
          planStartedAt: now,
          planEndedAt: planEnd,
          stripeSubscriptionId: subscriptionId,
        },
      }),

      this.prisma.client.invoice.create({
        data: {
          stripeInvoiceId: invoice.id,
          userId: userId,
          subscriptionId: localSubscription.id,
          amount: invoice.total,
          currency: invoice.currency,
          status: 'PAID',
          paidAt: now,
        },
      }),
    ]);

    this.logger.log(
      `Subscription ${localSubscription.id} activated via invoice ${invoice.id} (Stripe subscription ${subscriptionId})`,
    );
  }
}
