import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { BoatFromBoatsGroup } from '@/lib/boatsgroup/interface/boats.interface';
import { BoatsGroupService } from '@/lib/boatsgroup/services/boats-group.service';
import { GetAllCustomBoatsService } from '@/lib/boatsgroup/services/get-all-custom-boats.service';
import { DateTime } from 'luxon';
import { GetMergedBoatsDto } from '../dto/get-boats.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAllBoatsMergedService {
  constructor(
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
    private readonly boatsGroupService: BoatsGroupService,
  ) {}

  @HandleError('Failed to get boats')
  async getMergedBoats(
    query: GetMergedBoatsDto,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const { page = 1, limit = 50, fields } = query;

    // Merged fetch (all sources)
    const [inventoryRes, serviceRes, customRes] = await Promise.all([
      this.boatsGroupService.getInventoryBoats(page, limit, fields),
      this.boatsGroupService.getServiceBoats(page, limit, fields),
      this.getAllCustomBoatsService.getAllBoats({ page, limit, fields }),
    ]);

    // Combine all boats
    const allBoats = [
      ...inventoryRes.data,
      ...serviceRes.data,
      ...customRes.data,
    ];

    const total =
      inventoryRes.metadata.total +
      serviceRes.metadata.total +
      customRes.metadata.total;

    // Sort by last modification date
    const sortedBoats = allBoats.sort((a, b) => {
      const parseDate = (dateStr?: string) => {
        if (!dateStr) return 0;

        // Try parsing as ISO (full timestamp)
        let dt = DateTime.fromISO(dateStr, { zone: 'utc' });
        if (!dt.isValid) {
          // fallback: parse as plain date
          dt = DateTime.fromFormat(dateStr, 'yyyy-MM-dd', { zone: 'utc' });
        }

        return dt.isValid ? dt.toMillis() : 0;
      };

      const aDate = parseDate(a?.LastModificationDate);
      const bDate = parseDate(b?.LastModificationDate);

      return bDate - aDate; // newest first
    });

    return successPaginatedResponse(
      sortedBoats,
      {
        page,
        limit: sortedBoats.length,
        total,
      },
      'Request Success',
    );
  }
}
