import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { BoatFromBoatsGroup } from '@/lib/boatsgroup/interface/boats.interface';
import { BoatsGroupService } from '@/lib/boatsgroup/services/boats-group.service';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { GetMergedBoatsDto } from '../dto/get-boats.dto';

@Injectable()
export class GetAllBoatsMergedService {
  constructor(private readonly boatsGroupService: BoatsGroupService) {}

  private parseDateMillis(dateStr?: string) {
    if (!dateStr) return 0;
    let dt = DateTime.fromISO(dateStr, { zone: 'utc' });
    if (!dt.isValid) {
      dt = DateTime.fromFormat(dateStr, 'yyyy-MM-dd', { zone: 'utc' });
    }
    return dt.isValid ? dt.toMillis() : 0;
  }

  @HandleError('Failed to get boats')
  async getMergedBoats(
    query: GetMergedBoatsDto,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const { page = 1, limit = 50, fields } = query;

    // Config: how many items to fetch per source when refilling a buffer
    const BATCH_SIZE = Math.max(5, Math.ceil(limit / 3)); // you can tune this

    // Create fetcher functions for each source
    const fetchers: {
      fetchPage: (
        p: number,
        l: number,
      ) => Promise<{ data: BoatFromBoatsGroup[]; metadata: { total: number } }>;
      page: number;
      buffer: BoatFromBoatsGroup[];
      exhausted: boolean;
      total: number;
    }[] = [
      {
        fetchPage: (p, l) =>
          this.boatsGroupService.getInventoryBoats(p, l, fields),
        page: 1,
        buffer: [],
        exhausted: false,
        total: 0,
      },
      {
        fetchPage: (p, l) =>
          this.boatsGroupService.getServiceBoats(p, l, fields),
        page: 1,
        buffer: [],
        exhausted: false,
        total: 0,
      },
    ];

    // helper to fetch and refill buffer for a source index
    const refill = async (idx: number) => {
      const src = fetchers[idx];
      if (src.exhausted) return;
      const res = await src.fetchPage(src.page, BATCH_SIZE);
      src.page += 1;
      src.buffer.push(...res.data);
      src.total = res.metadata?.total ?? src.total;
      if (!res.data || res.data.length < BATCH_SIZE) {
        src.exhausted = true; // no more data
      }
    };

    // initially refill each source once
    await Promise.all(fetchers.map((_, i) => refill(i)));

    const merged: BoatFromBoatsGroup[] = [];
    // Merge until we have enough or all sources exhausted
    while (merged.length < limit) {
      // ensure each buffer has at least one item if possible
      const refillPromises = fetchers.map((s, i) =>
        s.buffer.length === 0 && !s.exhausted ? refill(i) : Promise.resolve(),
      );
      await Promise.all(refillPromises);

      // pick the best head across buffers
      let bestIdx = -1;
      let bestDate = -1;
      for (let i = 0; i < fetchers.length; i++) {
        const head = fetchers[i].buffer[0];
        if (!head) continue;
        const ts = this.parseDateMillis(head.LastModificationDate);
        if (ts > bestDate) {
          bestDate = ts;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) {
        // nothing left in any source
        break;
      }

      // take the head from best source
      const item = fetchers[bestIdx].buffer.shift()!;
      merged.push(item);
    }

    // compute total as sum of totals from sources
    const total = fetchers.reduce((acc, s) => acc + (s.total ?? 0), 0);

    const offset = (page - 1) * limit;
    let dataToReturn: BoatFromBoatsGroup[];

    if (offset === 0) {
      dataToReturn = merged.slice(0, limit);
    } else {
      // naive: if user requested later pages, we need to fetch more until we cover offset+limit
      const needed = offset + limit;
      while (merged.length < needed) {
        // try to refill and continue merging
        const refillPromises2 = fetchers.map((s, i) =>
          s.buffer.length === 0 && !s.exhausted ? refill(i) : Promise.resolve(),
        );
        await Promise.all(refillPromises2);

        let bestIdx = -1;
        let bestDate = -1;
        for (let i = 0; i < fetchers.length; i++) {
          const head = fetchers[i].buffer[0];
          if (!head) continue;
          const ts = this.parseDateMillis(head.LastModificationDate);
          if (ts > bestDate) {
            bestDate = ts;
            bestIdx = i;
          }
        }
        if (bestIdx === -1) break;
        merged.push(fetchers[bestIdx].buffer.shift()!);
      }
      dataToReturn = merged.slice(offset, offset + limit);
    }

    return successPaginatedResponse(
      dataToReturn,
      {
        page,
        limit: dataToReturn.length,
        total,
      },
      'Boats merged successfully.',
    );
  }
}
