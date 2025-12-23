import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { GetContactsDto } from '../dto/get-contacts.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get contacts', 'Contact')
  async getContacts(query: GetContactsDto): Promise<TPaginatedResponse<any>> {
    const page = Math.max(Number(query?.page) || 1, 1);
    const requestedLimit = Number(query?.limit);
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100;
    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? requestedLimit
          : DEFAULT_LIMIT,
        1,
      ),
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ContactWhereInput = {};

    if (query.source) {
      where.source = query.source;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [total, contacts] = await this.prisma.client.$transaction([
      this.prisma.client.contact.count({ where }),
      this.prisma.client.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          floridaLeads: {
            include: {
              boat: {
                select: {
                  id: true,
                  name: true,
                  listingId: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return successPaginatedResponse(
      contacts,
      { page, limit, total },
      'Contacts retrieved successfully',
    );
  }
}
