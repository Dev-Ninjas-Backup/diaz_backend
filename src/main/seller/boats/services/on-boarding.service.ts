import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BoatImageType } from '@prisma/client';
import { BoatEngineDto } from '../dto/boats.dto';
import {
  SellerOnboardingBodyDto,
  SellerOnboardingFilesDto,
} from '../dto/seller-on-boarding.dto';

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
  async completeOnBoarding(
    data: SellerOnboardingBodyDto,
    files: SellerOnboardingFilesDto,
  ): Promise<TResponse<any>> {
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
    const totalFiles =
      (files.covers ? files.covers.length : 0) +
      (files.galleries ? files.galleries.length : 0);
    if (totalFiles > plan.picLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit for the selected plan (${plan.picLimit} images allowed)`,
      );
    }

    this.logger.log(
      `Total uploaded images: ${totalFiles} (Plan limit: ${plan.picLimit})`,
    );

    const parsePipe = new ParseJsonPipe();

    const boatInfo = parsePipe.transform(data.boatInfo);
    const sellerInfo = parsePipe.transform(data.sellerInfo);

    // * Validate unique username
    const existingUser = await this.prisma.user.findUnique({
      where: { username: sellerInfo.username },
    });
    if (existingUser) {
      throw new AppError(HttpStatus.CONFLICT, 'Username already exists');
    }

    // * Validate unique email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: sellerInfo.email },
    });
    if (existingEmail) {
      throw new AppError(HttpStatus.CONFLICT, 'Email already exists');
    }

    // * Create user in the database
    const user = await this.prisma.user.create({
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
    const decimalBeam = this.utils.feetAndInchesToDecimal(beamFeet, beamInches);
    const decimalDraft = this.utils.feetAndInchesToDecimal(
      draftFeet,
      draftInches,
    );

    // * Create listing in the database
    const listing = await this.prisma.boats.create({
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
        length: decimalLength,
        beam: decimalBeam,
        draft: decimalDraft,
        enginesNumber: boatInfo.enginesNumber,
        cabinsNumber: boatInfo.cabinsNumber,
        headsNumber: boatInfo.headsNumber,
        city: boatInfo.city,
        state: boatInfo.state,
        zip: boatInfo.zip,
        user: {
          connect: { id: user.id },
        },
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
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    this.logger.log(
      `Created new seller user ${user.id} and boat listing ${listing.id}`,
    );

    // * create Stripe payment intent
    const paymentIntent = await this.stripe.createPaymentIntent({
      type: 'onboarding_subscription', // * onboarding subscription
      userId: user.id,
      email: user.email,
      name: user.name,
      planId: plan.id,
      planTitle: plan.title,
      priceCents: plan.price * 100, // * convert dollars to cents
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
    });

    this.logger.log(
      `Created Stripe payment intent ${paymentIntent.id} for user ${user.id} and listing ${listing.id}`,
    );

    if (files.covers && files.covers.length > 0) {
      // * Emit event to process cover image
      await this.eventEmitter.emitAsync(
        QueueEventsEnum.COVER_IMAGE_PROCESSING,
        {
          listingId: listing.id,
          imageType: BoatImageType.COVER,
          imageFile: files.covers,
        },
      );
    }

    if (files.galleries && files.galleries.length > 0) {
      // * Emit event to process gallery images
      await this.eventEmitter.emitAsync(
        QueueEventsEnum.GALLERY_IMAGE_PROCESSING,
        {
          listingId: listing.id,
          imageType: BoatImageType.GALLERY,
          imageFiles: files.galleries,
        },
      );
    }

    return successResponse(
      {
        paymentIntentId: paymentIntent.id,
        paymentIntentClientSecret: paymentIntent.client_secret,
        listingPreview: listing,
      },
      'Onboarding completed successfully',
    );
  }
}
