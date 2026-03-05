import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BoatImageType } from 'generated/client';
import { SellerOnboardingBodyDto } from '../dto/seller-on-boarding.dto';
import { BoatListingHelperService } from './boat-listing-helper.service';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);
  private readonly parsePipe = new ParseJsonPipe();

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly stripe: StripeService,
    private readonly boatListingHelper: BoatListingHelperService,
  ) {}

  @HandleError('Failed to complete onboarding', 'Boats')
  async sellerOnBoarding(
    data: SellerOnboardingBodyDto,
    files: { path: string; type: BoatImageType; originalName: string }[],
  ): Promise<TResponse<any>> {
    if (!data.planId || !data.boatInfo || !data.sellerInfo) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Invalid request body');
    }

    // Validate plan
    const plan = await this.validatePlan(data.planId);
    this.boatListingHelper.validateImageLimit(files.length, plan.picLimit);

    // Parse data
    const boatInfo = this.boatListingHelper.parseBoatInfo(data.boatInfo);
    const sellerInfo = this.parsePipe.transform(data.sellerInfo);
    this.logger.log('Seller Info: ', sellerInfo);

    // Validate uniqueness
    await this.validateUserUniqueness(sellerInfo.username, sellerInfo.email);

    // Create user and listing
    const result = await this.createUserAndListing(sellerInfo, boatInfo);
    const { user, listing } = result;

    // Create subscription setup intent
    const setupIntent = await this.createSubscriptionSetupIntent(
      user,
      plan,
      data.promoCode,
    );

    // Persist subscription (returns whether a valid promo was applied)
    const { appliedPromo } = await this.createPendingSubscription(
      user.id,
      plan.id,
      setupIntent.id,
      data.promoCode,
    );

    // Emit all events
    await this.boatListingHelper.emitAllBoatEvents(
      user.id,
      listing.id,
      boatInfo,
      files,
    );

    // Always include promo fields when a promo code was sent; set promoApplied and freeTrialDays automatically
    const responsePayload: Record<string, unknown> = {
      paymentIntentId: setupIntent.id,
      paymentIntentClientSecret: setupIntent.client_secret,
      listingPreview: listing,
      userId: user.id,
      promoApplied: !!appliedPromo,
      freeTrialDays: appliedPromo?.freeDays ?? 0,
      totalPayable: appliedPromo ? 0 : plan.price,
    };
    if (appliedPromo) {
      responsePayload.promoCode = appliedPromo.code;
    }

    return successResponse(
      responsePayload,
      'Onboarding completed successfully',
    );
  }

  /**
   * Find a valid promo by code (case-insensitive).
   * Returns null if not found, expired, or over max redemptions.
   */
  private async findValidPromoByCode(code: string) {
    if (!code?.trim()) return null;
    const promo = await this.prisma.client.promoCode.findFirst({
      where: { code: { equals: code.trim(), mode: 'insensitive' } },
      include: { _count: { select: { usedBy: true } } },
    });
    if (!promo) return null;
    if (promo.expiresAt && new Date() > promo.expiresAt) return null;
    if (
      promo.maxRedemptions != null &&
      (promo._count?.usedBy ?? 0) >= promo.maxRedemptions
    )
      return null;
    return promo;
  }

  private async validatePlan(planId: string) {
    const plan = await this.prisma.client.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Invalid subscription plan ID',
      );
    }

    this.logger.log(`Selected subscription plan: ${plan.title} (${plan.id})`);
    return plan;
  }

  private async validateUserUniqueness(username: string, email: string) {
    const [existingUser, existingEmail] = await Promise.all([
      this.prisma.client.user.findUnique({ where: { username } }),
      this.prisma.client.user.findUnique({ where: { email } }),
    ]);

    if (existingUser) {
      throw new AppError(HttpStatus.CONFLICT, 'Username already exists');
    }

    if (existingEmail) {
      throw new AppError(HttpStatus.CONFLICT, 'Email already exists');
    }
  }

  private async createUserAndListing(sellerInfo: any, boatInfo: any) {
    return await this.prisma.client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: sellerInfo.username,
          password: await this.utils.hash(sellerInfo.password),
          role: 'SELLER',
          email: sellerInfo.email,
          phone: sellerInfo.phone,
          name: sellerInfo.name,
          country: sellerInfo.country,
          city: sellerInfo.city,
          state: sellerInfo.state,
          zip: sellerInfo.zip,
        },
      });

      const listing = await tx.boats.create({
        data: await this.boatListingHelper.buildBoatCreateData(
          boatInfo,
          user.id,
          'ONBOARDING_PENDING',
          tx,
        ),
        include: {
          engines: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });

      return { user, listing };
    });
  }

  private async createSubscriptionSetupIntent(
    user: any,
    plan: any,
    promoCode?: string,
  ) {
    return await this.stripe.createSetupIntent({
      type: 'onboarding_subscription',
      userId: user.id,
      email: user.email,
      name: user.name,
      planId: plan.id,
      planTitle: plan.title,
      priceCents: plan.price * 100,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
      promoCode,
    });
  }

  private async createPendingSubscription(
    userId: string,
    planId: string,
    setupIntentId: string,
    promoCode?: string,
  ) {
    // find promo code id if exists (case-insensitive, validate expiry & max redemptions)
    let promoCodeId: string | undefined;
    let appliedPromo: Awaited<ReturnType<typeof this.findValidPromoByCode>> =
      null;
    if (promoCode?.trim()) {
      const dbPromo = await this.findValidPromoByCode(promoCode.trim());
      if (dbPromo) {
        promoCodeId = dbPromo.id;
        appliedPromo = dbPromo;
      } else {
        this.logger.warn(
          `Promo code "${promoCode}" not found, expired, or max redemptions reached`,
        );
      }
    }

    const subscription = await this.prisma.client.userSubscription.create({
      data: {
        user: { connect: { id: userId } },
        plan: { connect: { id: planId } },
        stripeTransactionId: setupIntentId,
        status: 'PENDING',
        promoCode: promoCodeId ? { connect: { id: promoCodeId } } : undefined,
      },
    });

    this.logger.log(
      `Created pending subscription record for user ${userId} with plan ${planId} and subscription ID ${subscription.id}`,
    );

    return { subscription, appliedPromo };
  }
}
