import { HandleError } from '@/common/error/handle-error.decorator';
import { TPaginatedResponse } from '@/common/utils/response.util';
import { BoatsGroupService } from '@/lib/boatsgroup/boats-group.service';
import { Boat } from '@/lib/boatsgroup/interface/boats.interface';
import { Injectable } from '@nestjs/common';
import { GetBoatsDto } from '../dto/get-boats.dto';

@Injectable()
export class GetAllBoatsService {
  constructor(private readonly boatsGroupService: BoatsGroupService) {}

  @HandleError('Failed to get boats')
  async getBoats(query: GetBoatsDto): Promise<TPaginatedResponse<Boat>> {
    const { source, page = 1, limit = 50, fields } = query;

    return await this.boatsGroupService.getBoats({
      source,
      page,
      limit,
      fields,
    });
  }
}
