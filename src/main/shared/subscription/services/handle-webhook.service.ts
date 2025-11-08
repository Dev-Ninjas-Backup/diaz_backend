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
        await this.handleSetupIntentFailed(
          event.data.object as Stripe.SetupIntent,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleCustomerSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleCustomerSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.finalized':
        await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const transactionId = setupIntent.id;
    const metadata = setupIntent.metadata as unknown as PaymentMetadata;
    const customerId = setupIntent.customer as string;

    // Find pending subscription created during onboarding
    const subscription = await this.prisma.userSubscription.findUnique({
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

      const stripeSub = await this.stripeService.createSubscription({
        customerId,
        priceId: metadata.stripePriceId,
        metadata,
        paymentMethodId,
      });

      const now = new Date();
      const planEnd = this.utils.addMonthsToDate(
        now,
        subscription.plan.billingPeriodMonths,
      );

      await this.prisma.$transaction([
        this.prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            stripeSubscriptionId: stripeSub.id,
            status: 'ACTIVE',
            paidAt: now,
            planStartedAt: now,
            planEndedAt: planEnd,
          },
        }),
        this.prisma.user.update({
          where: { id: subscription.userId },
          data: {
            currentPlan: { connect: { id: subscription.planId } },
            currentPlanStatus: 'ACTIVE',
            stripeCustomerId: customerId,
          },
        }),
        this.prisma.boats.updateMany({
          where: {
            userId: subscription.userId,
            status: 'ONBOARDING_PENDING',
          },
          data: { status: 'ACTIVE' },
        }),
      ]);

      this.logger.log(
        `Subscription ${subscription.id} activated successfully via SetupIntent`,
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

    const subscription = await this.prisma.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription not found for failed SetupIntent ${transactionId}`,
      );
      return;
    }

    try {
      await this.prisma.userSubscription.update({
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

    const local = await this.prisma.userSubscription.findUnique({
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
      await this.prisma.userSubscription.update({
        where: { id: local.id },
        data: updates,
      });
    }
  }

  private async handleCustomerSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ) {
    const stripeSubId = subscription.id;
    this.logger.log(`customer.subscription.deleted: ${stripeSubId}`);

    const local = await this.prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: stripeSubId },
    });

    if (!local) {
      this.logger.warn(
        `No local subscription found for deleted stripe subscription ${stripeSubId}`,
      );
      return;
    }

    await this.prisma.userSubscription.update({
      where: { id: local.id },
      data: {
        status: 'CANCELED',
        planEndedAt: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : local.planEndedAt,
      },
    });
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice) {
    this.logger.log(`invoice.finalized: ${invoice.id}`);
    this.logger.log(invoice);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`invoice.paid: ${invoice.id}`);
    this.logger.log(invoice);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`invoice.payment_failed: ${invoice.id}`);
    this.logger.log(invoice);
  }
}
