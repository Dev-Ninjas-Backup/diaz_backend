import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanType } from '@prisma/client';
import Stripe from 'stripe';
import { PaymentMetadata } from './stripe.types';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.getOrThrow<string>(
      ENVEnum.STRIPE_SECRET_KEY,
    );
    this.stripe = new Stripe(secretKey);
  }

  // Product & Price Management
  async createProductWithPrice({
    title,
    description,
    price,
    planType,
  }: {
    title: string;
    description: string;
    price: number;
    planType: PlanType;
  }) {
    const product = await this.stripe.products.create({
      name: title,
      description,
    });

    const lookupKey = this.generateLookUpKey(planType);

    const stripePrice = await this.stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      lookup_key: lookupKey, // important for lookup
    });

    this.logger.log(
      `Created Stripe product ${product.id} with price ${stripePrice.id} and lookup_key ${lookupKey}`,
    );

    return { product, stripePrice };
  }

  async getActivePriceByPlanType(planType: PlanType) {
    const lookupKey = this.generateLookUpKey(planType);

    const prices = await this.stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      this.logger.log(`No Stripe price found for plan type ${planType}`);
      return null;
    }

    this.logger.log(
      `Found Stripe price ${prices.data[0].id} for plan type ${planType}`,
    );

    return prices.data[0] ?? null;
  }

  // Customer Management
  async createCustomer({
    email,
    name,
    userId,
  }: {
    email: string;
    name: string;
    userId: string;
  }) {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        email,
        name,
        createdAt: new Date().toISOString(),
      },
    });

    this.logger.log(`Created Stripe customer ${customer.id} for ${email}`);

    return customer;
  }

  async retrieveCustomer(customerId: string) {
    const customer = await this.stripe.customers.retrieve(customerId);

    this.logger.log(`Retrieved Stripe customer ${customer.id}`);

    return customer;
  }

  async getCustomerByEmail(email: string) {
    const customers = await this.stripe.customers.list({
      limit: 1,
      email,
    });

    if (customers.data.length === 0) {
      this.logger.log(`No Stripe customer found for email ${email}`);
      return null;
    }

    this.logger.log(
      `Found Stripe customer ${customers.data[0].id} for email ${email}`,
    );

    return customers.data[0];
  }

  // Coupons management
  async createStripeCoupon(
    discount: number,
    planType: PlanType,
    duration: 'forever' | 'repeating' | 'once' = 'forever',
  ) {
    const couponId = this.generateCouponId(planType);
    return await this.stripe.coupons.create({
      id: couponId,
      percent_off: discount,
      duration,
    });
  }

  async getCouponByPlanType(planType: PlanType) {
    const couponId = this.generateCouponId(planType);

    try {
      const coupon = await this.stripe.coupons.retrieve(couponId);

      this.logger.log(
        `Retrieved Stripe coupon ${coupon.id} for plan type ${planType}`,
      );

      return coupon;
    } catch (error) {
      this.logger.error(
        `Error retrieving Stripe coupon for plan type ${planType}: ${error}`,
      );
      return null;
    }
  }

  // Payment Intent Management
  async retrievePaymentIntent(paymentIntentId: string) {
    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    this.logger.log(`Retrieved PaymentIntent ${paymentIntentId}`);
    return pi;
  }

  async createPaymentIntent(metadata: PaymentMetadata) {
    const userId = metadata.userId;

    const customer = await this.stripe.customers.list({
      email: metadata.email,
    });

    let customerId: string;

    if (customer.data.length > 0) {
      customerId = customer.data[0].id;
      this.logger.log(
        `Found existing Stripe customer ${customerId} for user ${userId}`,
      );
    } else {
      const newCustomer = await this.createCustomer({
        email: metadata.email,
        name: metadata.name,
        userId,
      });
      customerId = newCustomer.id;
    }

    const intent = await this.stripe.paymentIntents.create(
      {
        amount: metadata.priceCents,
        currency: 'usd',
        customer: customerId,
        receipt_email: metadata.email,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      },
      {
        idempotencyKey: `pi_${metadata.userId}_${metadata.planId}`,
      },
    );

    this.logger.log(`Created payment intent ${intent.id}`);
    return intent;
  }

  // Subscription Management
  async retrieveSubscription(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    this.logger.log(`Retrieved Stripe subscription ${subscription.id}`);

    return subscription;
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    await this.stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    this.logger.log(
      `Canceled Stripe subscription ${subscription.id} for user ${subscription.metadata.userId}`,
    );
  }

  async createSubscription({
    customerId,
    priceId,
    metadata,
  }: {
    customerId: string;
    priceId: string;
    metadata: PaymentMetadata;
  }) {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      expand: ['latest_invoice.payment_intent'],
    });

    this.logger.log(
      `Created Stripe subscription ${subscription.id} for user ${metadata.userId}`,
    );

    return subscription;
  }

  // Webhook Utility
  constructWebhookEvent(rawBody: Buffer, signature: string) {
    const endpointSecret = this.configService.getOrThrow<string>(
      ENVEnum.STRIPE_WEBHOOK_SECRET,
    );
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err) {
      this.logger.error('Invalid webhook signature', err);
      throw new Error('Invalid webhook signature');
    }
  }

  public generateLookUpKey(planType: PlanType) {
    return `subscription:${planType.toLowerCase()}:usd:month`;
  }

  public generateCouponId(planType: PlanType) {
    return `coupon_${planType.toLowerCase()}`;
  }
}
