import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetSellerInvoicesDto } from '../dto/get-own-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError("Failed to get seller's invoices")
  async getSellerInvoices(
    userId: string,
    query: GetSellerInvoicesDto,
  ): Promise<TPaginatedResponse<any>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { userId };

    if (query.search) {
      where.OR = [
        { stripeInvoiceId: { contains: query.search, mode: 'insensitive' } },
        {
          subscription: {
            stripeSubscriptionId: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, invoices] = await this.prisma.$transaction([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: { include: { plan: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedInvoices = this.formatInvoices(invoices);

    return successPaginatedResponse(
      formattedInvoices,
      { page, limit, total },
      'Invoices fetched successfully',
    );
  }

  @HandleError('Failed to fetch invoice by ID')
  async getInvoiceById(
    invoiceId: string,
    userId: string,
  ): Promise<TResponse<any>> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        subscription: { include: { plan: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invoice) return successResponse(null, 'Invoice not found');

    return successResponse(
      this.formatInvoice(invoice),
      'Invoice fetched successfully',
    );
  }

  private formatInvoice(invoice: any) {
    return {
      id: invoice.id,
      stripeInvoiceId: invoice.stripeInvoiceId,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency,
      paidAt: invoice.paidAt,
      dueAt: invoice.dueAt,
      failedAt: invoice.failedAt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      subscription: {
        id: invoice.subscription.id,
        stripeSubscriptionId: invoice.subscription.stripeSubscriptionId,
        status: invoice.subscription.status,
        plan: {
          id: invoice.subscription.plan.id,
          title: invoice.subscription.plan.title,
          planType: invoice.subscription.plan.planType,
          price: invoice.subscription.plan.price,
          currency: invoice.subscription.plan.currency,
          billingPeriodMonths: invoice.subscription.plan.billingPeriodMonths,
        },
      },
      user: {
        id: invoice.user.id,
        name: invoice.user.name,
        email: invoice.user.email,
      },
    };
  }

  private formatInvoices(invoices: any[]) {
    return invoices.map((inv) => this.formatInvoice(inv));
  }
}
