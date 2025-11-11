import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import { TPaginatedResponse, TResponse } from '@/common/utils/response.util';
import { BoatFromBoatsGroup } from '@/lib/boatsgroup/interface/boats.interface';
import { BoatsGroupService } from '@/lib/boatsgroup/services/boats-group.service';
import { GetAllCustomBoatsService } from '@/lib/boatsgroup/services/get-all-custom-boats.service';
import { Injectable, Logger } from '@nestjs/common';
import { GetBoatsDto, GetSingleBoatDto } from '../dto/get-boats.dto';

@Injectable()
export class GetAllBoatsService {
  private readonly logger = new Logger(GetAllBoatsService.name);

  constructor(
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
    private readonly boatsGroupService: BoatsGroupService,
  ) {}

  @HandleError('Failed to get boats')
  async getBoats(
    query: GetBoatsDto,
  ): Promise<
    TPaginatedResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>
  > {
    const { source, page = 1, limit = 50, fields } = query;

    switch (source) {
      case BoatsSourceEnum.inventory:
        return this.boatsGroupService.getInventoryBoats(page, limit, fields);

      case BoatsSourceEnum.service:
        return this.boatsGroupService.getServiceBoats(page, limit, fields);

      case BoatsSourceEnum.custom:
        return this.getAllCustomBoatsService.getAllBoats({
          page,
          limit,
          fields,
        });

      default:
        this.logger.warn(
          `Unknown boats source "${source}". Falling back to database source.`,
        );
        return this.getAllCustomBoatsService.getAllBoats({
          page,
          limit,
          fields,
        });
    }
  }

  @HandleError('Failed to get single boat')
  async getSingleBoat(
    boatId: string,
    query: GetSingleBoatDto,
  ): Promise<TResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>> {
    switch (query.source) {
      case BoatsSourceEnum.inventory:
        return await this.boatsGroupService.getSingleInventoryBoat(
          boatId,
          query.fields,
        );

      case BoatsSourceEnum.service:
        return await this.boatsGroupService.getSingleServiceBoat(
          boatId,
          query.fields,
        );

      case BoatsSourceEnum.custom:
        return await this.getAllCustomBoatsService.getSingleBoat(boatId);

      default:
        this.logger.warn(
          `Unknown boats source "${query.source}". Falling back to database source.`,
        );
        return await this.getAllCustomBoatsService.getSingleBoat(
          boatId,
          query.fields,
        );
    }
  }
}
