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
      this.logger.error('Webhook signature verification failed', error);
      throw new AppError(400, 'Invalid webhook signature');
    }
  }

  private async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      // Handle other event types for future continuous subscription management

      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const transactionId = paymentIntent.id;
    const metadata = paymentIntent.metadata as unknown as PaymentMetadata;
    const customerId = paymentIntent.customer as string;

    const subscription = await this.prisma.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
      include: { user: true, plan: true },
    });

    if (!subscription) {
      this.logger.error(
        `No subscription found for paymentIntent ${transactionId}`,
      );
      return;
    }

    if (subscription.status === 'ACTIVE') {
      this.logger.log(`Subscription ${subscription.id} already active`);
      return;
    }

    this.logger.log(`Payment succeeded for subscription ${subscription.id}`);

    try {
      const now = new Date();
      const planEnd = this.utils.addMonthsToDate(
        now,
        subscription.plan.billingPeriodMonths,
      );

      await this.prisma.$transaction([
        this.prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
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
      ]);

      // Handle onboarding case
      if (metadata.type === 'onboarding_subscription') {
        this.logger.log(
          `Handling onboarding payment for user ${subscription.userId}`,
        );

        try {
          const stripeSub = await this.stripeService.createSubscription({
            customerId,
            priceId: metadata.stripePriceId,
            metadata,
          });

          await this.prisma.userSubscription.update({
            where: { id: subscription.id },
            data: {
              stripeSubscriptionId: stripeSub.id,
              status: 'ACTIVE',
              paidAt: now,
            },
          });

          await this.prisma.boats.updateMany({
            where: {
              userId: subscription.userId,
              status: 'ONBOARDING_PENDING',
            },
            data: { status: 'ACTIVE' },
          });

          this.logger.log(
            `Created recurring Stripe subscription ${stripeSub.id}`,
          );
        } catch (stripeErr) {
          this.logger.error(`Stripe subscription creation failed`, stripeErr);
        }
      }

      this.logger.log(`Subscription ${subscription.id} activated successfully`);
    } catch (err) {
      this.logger.error(
        `Failed to update subscription ${subscription.id}`,
        err,
      );
      throw err;
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const transactionId = paymentIntent.id;

    const subscription = await this.prisma.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription not found for failed paymentIntent ${transactionId}`,
      );
      return;
    }

    try {
      await this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { status: 'FAILED', failedAt: new Date() },
      });
      this.logger.warn(`Payment failed for subscription ${subscription.id}`);
    } catch (err) {
      this.logger.error(
        `Failed to update failed subscription ${subscription.id}`,
        err,
      );
      throw err;
    }
  }
}
