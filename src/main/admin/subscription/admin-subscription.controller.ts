import { ValidateSuperAdmin } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from './dto/promo-code.dto';
import { AdminPromoCodeService } from './services/admin-promo-code.service';
import { AdminSubscriptionService } from './services/admin-subscription.service';

@ApiTags('Admin -- Subscription Management')
@Controller('admin/subscriptions')
@ValidateSuperAdmin()
export class AdminSubscriptionController {
  constructor(
    private readonly subscriptionService: AdminSubscriptionService,
    private readonly promoCodeService: AdminPromoCodeService,
  ) {}

  // --- Subscription Endpoints ---

  @Get()
  @ApiOperation({ summary: 'Get all user subscriptions' })
  getAllSubscriptions(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.subscriptionService.getAllSubscriptions({ status, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details by ID' })
  getSubscriptionById(@Param('id') id: string) {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Get('plans/all')
  @ApiOperation({ summary: 'Get all subscription plans' })
  getAllPlans() {
    return this.subscriptionService.getAllPlans();
  }

  // --- Promo Code Endpoints ---

  @Get('promo-codes/all')
  @ApiOperation({ summary: 'Get all promo codes' })
  getAllPromoCodes() {
    return this.promoCodeService.getAllPromoCodes();
  }

  @Post('promo-codes')
  @ApiOperation({ summary: 'Create a new promo code' })
  createPromoCode(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.createPromoCode(dto);
  }

  @Get('promo-codes/:id')
  @ApiOperation({ summary: 'Get promo code by ID' })
  getPromoCodeById(@Param('id') id: string) {
    return this.promoCodeService.getPromoCodeById(id);
  }

  @Patch('promo-codes/:id')
  @ApiOperation({ summary: 'Update a promo code' })
  updatePromoCode(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promoCodeService.updatePromoCode(id, dto);
  }

  @Delete('promo-codes/:id')
  @ApiOperation({ summary: 'Delete a promo code' })
  deletePromoCode(@Param('id') id: string) {
    return this.promoCodeService.deletePromoCode(id);
  }
}
