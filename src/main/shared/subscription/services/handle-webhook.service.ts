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
}
