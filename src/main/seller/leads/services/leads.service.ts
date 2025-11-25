import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { FloridaLead, Prisma } from 'generated/client';
import { GetSellerLeadsDto } from '../dto/get-own-leads.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError("Failed to get seller's stats")
  async getSellerStats(userId: string): Promise<TResponse<any>> {
    // 1. Fetch seller basic profile info
    const seller = await this.prisma.client.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        avatarUrl: true,
        country: true,
        city: true,
        state: true,
        zip: true,
      },
    });

    // 2. Fetch seller boats (for stats)
    const [totalListing, activeListing] = await this.prisma.client.$transaction(
      [
        this.prisma.client.boats.count({ where: { userId } }),
        this.prisma.client.boats.count({
          where: { userId, status: 'ACTIVE' },
        }),
      ],
    );

    // 3. Count all Florida leads for seller
    const totalFloridaLeads = await this.prisma.client.floridaLead.count({
      where: { boat: { userId } },
    });

    return successResponse(
      {
        name: seller.name,
        avatarUrl: seller.avatarUrl,

        country: seller.country,
        city: seller.city,
        state: seller.state,
        zip: seller.zip,

        totalListing,
        activeListing,

        totalLeads: totalFloridaLeads,
      },
      'Stats fetched successfully',
    );
  }

  @HandleError("Failed to get seller's leads")
  async getSellerLeads(
    userId: string,
    query: GetSellerLeadsDto,
  ): Promise<TPaginatedResponse<any>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    // Build base where clause: only Florida leads for boats owned by seller
    const where: Prisma.FloridaLeadWhereInput = {
      boat: { userId },
      contact: { source: 'FLORIDA', type: 'INDIVIDUAL_LISTING' },
    };

    // Optional search on contact fields or boat listingId
    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      where.OR = [
        { contact: { listingId: { contains: s, mode: 'insensitive' } } },
        { contact: { name: { contains: s, mode: 'insensitive' } } },
        { contact: { email: { contains: s, mode: 'insensitive' } } },
        { contact: { phone: { contains: s, mode: 'insensitive' } } },
        { contact: { message: { contains: s, mode: 'insensitive' } } },
      ];
    }

    // Fetch total + paginated leads
    const [total, leads] = await this.prisma.client.$transaction([
      this.prisma.client.floridaLead.count({ where }),
      this.prisma.client.floridaLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: true,
          boat: true,
        },
      }),
    ]);

    // Format for response
    const formatted = leads.map((lead) => this.formatLead(lead));

    return successPaginatedResponse(
      formatted,
      { page, limit, total },
      'Leads fetched successfully',
    );
  }

  @HandleError('Failed to get seller lead')
  async getSellerLeadById(
    userId: string,
    leadId: string,
  ): Promise<TResponse<any>> {
    const lead = await this.prisma.client.floridaLead.findFirst({
      where: {
        id: leadId,
        boat: { userId },
      },
      include: {
        contact: true,
        boat: true,
      },
    });

    if (!lead) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'Lead not found or access denied',
      );
    }

    return successResponse(this.formatLead(lead), 'Lead fetched successfully');
  }

  private formatLead(lead: FloridaLead & { contact: any; boat: any }) {
    return {
      id: lead.id,
      boatId: lead.boat.id,
      listingId: lead.contact.listingId,
      listingSummary: {
        listingId: lead.boat.listingId,
        name: lead.boat.name,
        price: lead.boat.price,
        city: lead.boat.city,
      },
      source: lead.contact.source,
      listingSource: lead.contact.listingSource,
      type: lead.contact.type,
      name: lead.contact.name,
      email: lead.contact.email,
      phone: lead.contact.phone,
      message: lead.contact.message,
      createdAt: lead.contact.createdAt,
      updatedAt: lead.contact.updatedAt,
    };
  }
}
