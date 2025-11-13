import { GetUser, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentRetryService } from './services/payment-retry.service';

@ApiTags('Seller -- Payment')
@ApiBearerAuth()
@ValidateAuth()
@Controller('payment/seller')
export class PaymentController {
  constructor(private readonly paymentRetryService: PaymentRetryService) {}

  @ApiOperation({ summary: 'Check if user needs to add payment method' })
  @Get('status')
  async getPaymentStatus(@GetUser('sub') userId: string) {
    return this.paymentRetryService.getPaymentStatus(userId);
  }

  @ApiOperation({
    summary: 'Get new SetupIntent client secret to retry payment',
  })
  @Post('setup-intent')
  async retrySetupIntent(@GetUser('sub') userId: string) {
    return this.paymentRetryService.retrySetupIntent(userId);
  }

  @ApiOperation({ summary: 'Cancel pending subscription' })
  @Delete('cancel-pending-subscription')
  async cancelPendingSubscription(@GetUser('sub') userId: string) {
    return this.paymentRetryService.cancelPendingSubscription(userId);
  }
}
