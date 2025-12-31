import { PaginationDto } from '@/common/dto/pagination.dto';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetContactUsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get contact us submissions', 'ContactUs')
  async getContactUs(query: PaginationDto): Promise<TPaginatedResponse<any>> {
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

    const [total, contactUsSubmissions] = await this.prisma.client.$transaction(
      [
        this.prisma.client.contactUs.count(),
        this.prisma.client.contactUs.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ],
    );

    return successPaginatedResponse(
      contactUsSubmissions,
      { page, limit, total },
      'Contact us submissions retrieved successfully',
    );
  }
}
