import { GetUser, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSellerInvoicesDto } from './dto/get-own-invoices.dto';
import { InvoicesService } from './services/invoices.service';
import { PaymentRetryService } from './services/payment-retry.service';

@ApiTags('Seller -- Payment')
@ApiBearerAuth()
@ValidateAuth()
@Controller('payment/seller')
export class PaymentController {
  constructor(
    private readonly paymentRetryService: PaymentRetryService,
    private readonly invoicesService: InvoicesService,
  ) {}

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

  @ApiOperation({ summary: 'Get seller invoices' })
  @Get('invoices')
  async getSellerInvoices(
    @GetUser('sub') userId: string,
    @Query() query: GetSellerInvoicesDto,
  ) {
    return this.invoicesService.getSellerInvoices(userId, query);
  }

  @ApiOperation({ summary: 'Get invoice by id' })
  @Get('invoices/:invoiceId')
  async getInvoiceById(
    @GetUser('sub') userId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.invoicesService.getInvoiceById(invoiceId, userId);
  }
}
