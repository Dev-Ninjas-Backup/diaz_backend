import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Boats, Contact, ContactSource } from '@prisma/client';

// interface GetSellerLeadsDto {
//   page?: number;
//   limit?: number;
//   search?: string;
//   listingId?: string; // optional filter by listing
// }

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  // @HandleError("Failed to get seller's leads")
  // async getSellerLeads(
  //   userId: string,
  //   query: GetSellerLeadsDto,
  // ): Promise<TPaginatedResponse<any>> {
  //   const page = query.page && query.page > 0 ? query.page : 1;
  //   const limit = query.limit && query.limit > 0 ? query.limit : 10;
  //   const skip = (page - 1) * limit;

  //   // 1️⃣ Fetch all boats owned by seller
  //   const sellerBoats = await this.prisma.boats.findMany({
  //     where: { userId },
  //     select: { id: true, name: true, price: true, city: true },
  //   });

  //   if (!sellerBoats.length) {
  //     return successPaginatedResponse(
  //       [],
  //       { page, limit, total: 0 },
  //       'Leads fetched successfully',
  //     );
  //   }

  //   const boatMap = new Map<string, any>();
  //   for (const b of sellerBoats) {
  //     boatMap.set(b.id, b); // original ID
  //   }

  //   // 2️⃣ Base where: only FLORIDA leads for seller's boats
  //   const contactWhere: any = {
  //     source: ContactSource.FLORIDA,
  //     type: ContactType.INDIVIDUAL_LISTING,
  //     listingId: { in: Array.from(boatMap.keys()) }, // original boat IDs only
  //   };

  //   // 3️⃣ Optional search (on contact fields and original listingId)
  //   const [total, contacts] = await this.prisma.$transaction([
  //     this.prisma.contact.count({ where: contactWhere }),
  //     this.prisma.contact.findMany({
  //       where: contactWhere,
  //       skip,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' },
  //     }),
  //   ]);

  //   let filteredContacts = contacts;
  //   if (query.search && query.search.trim()) {
  //     const s = query.search.trim().toLowerCase();
  //     filteredContacts = contacts.filter((c) => {
  //       const boat = boatMap.get(c.listingId);
  //       return (
  //         c.listingId.toLowerCase().includes(s) ||
  //         c.name?.toLowerCase().includes(s) ||
  //         c.email?.toLowerCase().includes(s) ||
  //         c.phone?.toLowerCase().includes(s) ||
  //         c.message?.toLowerCase().includes(s) ||
  //         boat?.id?.toLowerCase().includes(s)
  //       );
  //     });
  //   }

  //   // 4️⃣ Format for response
  //   const formatted = filteredContacts.map((c) =>
  //     this.formatLead(c, boatMap.get(c.listingId)),
  //   );

  //   return successPaginatedResponse(
  //     formatted,
  //     { page, limit, total },
  //     'Leads fetched successfully',
  //   );
  // }

  @HandleError('Failed to get seller lead')
  async getSellerLeadById(
    userId: string,
    leadId: string,
  ): Promise<TResponse<any>> {
    // Fetch contact
    const contact = await this.prisma.contact.findUnique({
      where: { id: leadId },
    });
    if (!contact) throw new AppError(HttpStatus.NOT_FOUND, 'Lead not found');

    // Only FLORIDA leads allowed
    if (contact.source !== ContactSource.FLORIDA) {
      throw new AppError(HttpStatus.FORBIDDEN, 'Lead is not a Florida lead');
    }

    // Must have listingId
    if (!contact.listingId) {
      throw new AppError(HttpStatus.FORBIDDEN, 'Lead is not a Florida lead');
    }

    // Fetch the boat
    const boat = await this.prisma.boats.findFirst({
      where: { userId, id: contact.listingId },
    });

    if (!boat) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this lead',
      );
    }

    return successResponse(
      this.formatLead(contact, boat),
      'Lead fetched successfully',
    );
  }

  private formatLead(contact: Contact, boatSummary: Boats) {
    return {
      id: contact.id,
      boatId: boatSummary.id,
      listingId: contact.listingId,
      listingSummary: {
        listingId: boatSummary.listingId,
        name: boatSummary.name,
        price: boatSummary.price,
        city: boatSummary.city,
      },
      source: contact.source,
      listingSource: contact.listingSource,
      type: contact.type,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
