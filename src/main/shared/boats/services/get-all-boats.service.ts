import { HandleError } from '@/common/error/handle-error.decorator';
import { TPaginatedResponse } from '@/common/utils/response.util';
import { BoatFromBoatsGroup } from '@/lib/boatsgroup/interface/boats.interface';
import { BoatsGroupService } from '@/lib/boatsgroup/services/boats-group.service';
import { Injectable } from '@nestjs/common';
import { GetBoatsDto, GetSingleBoatDto } from '../dto/get-boats.dto';

@Injectable()
export class GetAllBoatsService {
  constructor(private readonly boatsGroupService: BoatsGroupService) {}

  @HandleError('Failed to get boats')
  async getBoats(
    query: GetBoatsDto,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const { source, page = 1, limit = 50, fields } = query;

    return await this.boatsGroupService.getBoats({
      source,
      page,
      limit,
      fields,
    });
  }

  @HandleError('Failed to get single boat')
  async getSingleBoat(boatId: string, query: GetSingleBoatDto) {
    return await this.boatsGroupService.getSingleBoat(boatId, query);
  }
}
