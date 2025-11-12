import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  AdoptBoatsFeatures,
  AdoptBoatsSpecification,
} from '@/lib/queue/interface/adopt-boats-data.payload';
import { ListingImageProcessPayload } from '@/lib/queue/interface/image-process.payload';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BoatImageType } from '@prisma/client';
import { BoatEngineDto } from '../dto/boats.dto';
import { SellerOnboardingBodyDto } from '../dto/seller-on-boarding.dto';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly stripe: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @HandleError('Failed to complete onboarding', 'Boats')
  async sellerOnBoarding(
    data: SellerOnboardingBodyDto,
    files: { path: string; type: BoatImageType; originalName: string }[],
  ): Promise<TResponse<any>> {
    if (!data.planId || !data.boatInfo || !data.sellerInfo) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Invalid request body');
    }

    //* Validate plan id
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Invalid subscription plan ID',
      );
    }

    this.logger.log(`Selected subscription plan: ${plan.title} (${plan.id})`);

    // * Validated total files number based on plan limit
    if (files.length > plan.picLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit for the selected plan (${plan.picLimit} images allowed)`,
      );
    }

    this.logger.log(
      `Total uploaded images: ${files.length} (Plan limit: ${plan.picLimit})`,
    );

    const parsePipe = new ParseJsonPipe();

    const boatInfo = parsePipe.transform(data.boatInfo);
    this.logger.log('Boat Info: ', boatInfo);
    const sellerInfo = parsePipe.transform(data.sellerInfo);
    this.logger.log('Seller Info: ', sellerInfo);

    // * Validate unique username
    const [existingUser, existingEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { username: sellerInfo.username } }),
      this.prisma.user.findUnique({ where: { email: sellerInfo.email } }),
    ]);

    if (existingUser) {
      throw new AppError(HttpStatus.CONFLICT, 'Username already exists');
    }

    if (existingEmail) {
      throw new AppError(HttpStatus.CONFLICT, 'Email already exists');
    }

    // * Begin transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // * Create user
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

      const {
        lengthFeet,
        lengthInches,
        beamFeet,
        beamInches,
        draftFeet,
        draftInches,
      } = boatInfo.boatDimensions;

      const decimalLength = this.utils.feetAndInchesToDecimal(
        lengthFeet,
        lengthInches,
      );
      const decimalBeam = this.utils.feetAndInchesToDecimal(
        beamFeet,
        beamInches,
      );
      const decimalDraft = this.utils.feetAndInchesToDecimal(
        draftFeet,
        draftInches,
      );

      // * Create listing
      const listing = await tx.boats.create({
        data: {
          name: boatInfo.name,
          price: boatInfo.price,
          description: boatInfo?.description?.trim() || '',
          buildYear: boatInfo.buildYear,
          make: boatInfo.make,
          model: boatInfo.model,
          fuelType: boatInfo.fuelType,
          class: boatInfo.boatClass,
          material: boatInfo.material,
          condition: boatInfo.condition,
          engineType: boatInfo?.engineType?.trim() || '',
          propType: boatInfo?.propType?.trim() || '',
          propMaterial: boatInfo?.propMaterial?.trim() || '',
          length: decimalLength,
          beam: decimalBeam,
          draft: decimalDraft,
          enginesNumber: boatInfo.enginesNumber,
          cabinsNumber: boatInfo.cabinsNumber,
          headsNumber: boatInfo.headsNumber,
          city: boatInfo.city,
          state: boatInfo.state,
          zip: boatInfo.zip,
          status: 'ONBOARDING_PENDING',
          electronics: boatInfo.electronics || [],
          insideEquipment: boatInfo.insideEquipment || [],
          outsideEquipment: boatInfo.outsideEquipment || [],
          electricalEquipment: boatInfo.electricalEquipment || [],
          covers: boatInfo.covers || [],
          additionalEquipment: boatInfo.additionalEquipment || [],
          videoURL: boatInfo?.videoURL?.trim() || '',
          user: { connect: { id: user.id } },
          engines: boatInfo.engines?.length
            ? {
                createMany: {
                  data: boatInfo.engines.map((engine: BoatEngineDto) => ({
                    ...engine,
                  })),
                },
              }
            : undefined,
          extraDetails: boatInfo.extraDetails ?? [],
        },
        include: {
          engines: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });

      return { user, listing };
    });

    const { user, listing } = result;

    // create a SetupIntent
    const setupIntent = await this.stripe.createSetupIntent({
      type: 'onboarding_subscription',
      userId: user.id,
      email: user.email,
      name: user.name,
      planId: plan.id,
      planTitle: plan.title,
      priceCents: plan.price * 100,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
    });

    // persist setup intent id so you can reconcile later
    const subscription = await this.prisma.userSubscription.create({
      data: {
        user: { connect: { id: user.id } },
        plan: { connect: { id: plan.id } },
        stripeTransactionId: setupIntent.id, // store the SetupIntent id
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Created pending subscription record for user ${user.id} with plan ${plan.id} and subscription ID ${subscription.id}`,
    );

    // * Emit event to process uploaded images
    if (files && files.length > 0) {
      const payload: ListingImageProcessPayload = {
        userId: user.id,
        listingId: listing.id,
        files,
      };

      await this.eventEmitter.emitAsync(
        QueueEventsEnum.LISTING_IMAGE_PROCESSING,
        payload,
      );
    }

    // * Emit events to adopt new data of specification and features
    const adoptBoatsSpecificationPayload: AdoptBoatsSpecification = {
      listingId: listing.id,
      make: boatInfo.make,
      model: boatInfo.model,
      fuelType: boatInfo.fuelType,
      class: boatInfo.boatClass,
      material: boatInfo.material,
      condition: boatInfo.condition,
      engineType: boatInfo.engineType,
      propType: boatInfo.propType,
      propMaterial: boatInfo.propMaterial,
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_SPECIFICATION,
      adoptBoatsSpecificationPayload,
    );

    const adoptBoatsFeaturesPayload: AdoptBoatsFeatures = {
      listingId: listing.id,
      electronics: boatInfo.electronics,
      insideEquipment: boatInfo.insideEquipment,
      outsideEquipment: boatInfo.outsideEquipment,
      electricalEquipment: boatInfo.electricalEquipment,
      covers: boatInfo.covers,
      additionalEquipment: boatInfo.additionalEquipment,
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_FEATURES,
      adoptBoatsFeaturesPayload,
    );

    return successResponse(
      {
        paymentIntentId: setupIntent.id,
        paymentIntentClientSecret: setupIntent.client_secret,
        listingPreview: listing,
        userId: user.id,
      },
      'Onboarding completed successfully',
    );
  }

  @HandleError('Failed to get subscription confirmation', 'Onboarding')
  async getSubscriptionConfirmation(userId: string) {
    // Fetch the latest subscription for this user
    const subscription = await this.prisma.userSubscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!subscription) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'No subscription found for this user',
      );
    }

    // Compute if subscription is active
    const isActive = subscription.status === 'ACTIVE';

    // Fetch associated boat listings (if any)
    const listing = await this.prisma.boats.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // Compose confirmation payload
    const result = {
      user: {
        id: subscription.user.id,
        name: subscription.user.name,
        email: subscription.user.email,
      },
      subscription: {
        id: subscription.id,
        planTitle: subscription.plan.title,
        status: subscription.status,
        startedAt: subscription.planStartedAt,
        endsAt: subscription.planEndedAt,
      },
      listing: listing
        ? {
            id: listing.id,
            name: listing.name,
            status: listing.status,
          }
        : null,
      message: isActive
        ? 'Your subscription is active. Welcome aboard!'
        : 'Your subscription is still pending. Please wait for confirmation.',
    };

    // Return final response
    return successResponse(
      result,
      'Subscription confirmation fetched successfully',
    );
  }
}
