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

    // 1. Find subscription by transaction ID
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { stripeTransactionId: transactionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      this.logger.error(
        `Subscription not found for paymentIntent ${transactionId}`,
      );
      return;
    }

    // 2. Idempotent check
    if (subscription.status === 'ACTIVE') {
      this.logger.log(`Subscription ${subscription.id} already active`);
      return;
    }

    this.logger.log(
      `Payment succeeded for subscription ${subscription.id} | metadata: ${JSON.stringify(metadata)}`,
    );

    try {
      await this.prisma.$transaction([
        // Update subscription
        this.prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            paidAt: new Date(),
            planStartedAt: new Date(),
            planEndedAt: this.utils.addMonthsToDate(
              new Date(),
              subscription.plan.billingPeriodMonths,
            ),
          },
        }),

        // Update user info
        this.prisma.user.update({
          where: { id: subscription.userId },
          data: {
            currentPlan: {
              connect: { id: subscription.planId },
            },
            currentPlanStatus: 'ACTIVE',
            stripeCustomerId: customerId,
          },
        }),
      ]);

      // 3. If this was part of onboarding — optionally create a Stripe Subscription for recurring billing
      if (metadata.type === 'onboarding_subscription') {
        this.logger.log(
          `Onboarding paymentIntent succeeded for user ${subscription.userId}`,
        );

        // create real Stripe subscription for future recurring payments
        try {
          const stripeSub = await this.stripeService.createSubscription({
            customerId,
            priceId: metadata.stripePriceId,
            metadata,
          });

          this.logger.log(`Created Stripe subscription ${stripeSub.id}`);

          // Save to DB
          await this.prisma.userSubscription.update({
            where: { id: subscription.id },
            data: {
              stripeSubscriptionId: stripeSub.id,
              status: 'ACTIVE',
              paidAt: new Date(),
            },
          });
        } catch (stripeErr) {
          this.logger.error(
            `Failed to create Stripe subscription for user ${subscription.userId}`,
            stripeErr,
          );
        }
      }

      this.logger.log(
        `Payment succeeded and updated DB for subscription ${subscription.id}`,
      );
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
