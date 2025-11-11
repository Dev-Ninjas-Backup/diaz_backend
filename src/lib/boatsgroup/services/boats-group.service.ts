import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ENVEnum } from '@/common/enum/env.enum';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import {
  GetBoatsDto,
  GetSingleBoatDto,
} from '@/main/shared/boats/dto/get-boats.dto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'query-string';
import { getBoatFieldsByPreset } from '../helpers/boat-field-presets';
import { FieldPreset } from '../interface/boats-fields.interface';
import { BoatFromBoatsGroup } from '../interface/boats.interface';
import { GetAllCustomBoatsService } from './get-all-custom-boats.service';

@Injectable()
export class BoatsGroupService {
  private readonly logger = new Logger(BoatsGroupService.name);
  private readonly apiBoatsKey: string;
  private readonly apiBoatsBaseUrl: string;
  private readonly serviceBoatsKey: string;
  private readonly serviceBoatsBaseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
  ) {
    this.apiBoatsKey = this.config.getOrThrow<string>(ENVEnum.API_BOATS_KEY);
    this.apiBoatsBaseUrl = `https://api.boats.com/inventory/search?key=${this.apiBoatsKey}&sort=LastModificationDate|desc`;
    this.serviceBoatsKey = this.config.getOrThrow<string>(
      ENVEnum.SERVICE_BOATS_KEY,
    );
    this.serviceBoatsBaseUrl = `https://services.boats.com/pls/boats/search?key=${this.serviceBoatsKey}&sort=LastModificationDate|desc`;
  }

  // * Build fields query
  private buildFieldsQuery(fields?: FieldPreset): string {
    const fieldsToUse = getBoatFieldsByPreset(fields);

    return qs.stringify({ fields: fieldsToUse }, { arrayFormat: 'comma' });
  }

  // * Get boats from Inventory API
  private async getInventoryBoats(
    page: number,
    limit: number,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const query = this.buildFieldsQuery(fields);

    const start = (page - 1) * limit;

    const url = `${this.apiBoatsBaseUrl}&${query}&start=${start}&rows=${limit}`;

    const { data } = await axios.get(url);
    this.logger.log(`Boats found successfully from Inventory API`);

    return successPaginatedResponse(
      data.results ?? [],
      {
        page,
        limit,
        total: data.numResults ?? 0,
      },
      'Boats found successfully from Inventory API',
    );
  }

  private async getSingleInventoryBoat(
    boatId: string,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TResponse<BoatFromBoatsGroup>> {
    const query = this.buildFieldsQuery(fields);

    const url = `${this.apiBoatsBaseUrl}&${query}&DocumentID=${boatId}`;

    const { data } = await axios.get(url);

    const boat = data.results?.[0];

    this.logger.log(`Boat found successfully from Inventory API`);

    return successResponse(boat, 'Boat found successfully from Inventory API');
  }

  // * Get boats from Service API
  private async getServiceBoats(
    page: number = 1,
    limit: number = 20,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const query = this.buildFieldsQuery(fields);
    const start = (page - 1) * limit;

    const url = `${this.serviceBoatsBaseUrl}&${query}&start=${start}&rows=${limit}`;

    const { data } = await axios.get(url);

    const boatsData = data.data ?? data;

    this.logger.log(`Boats found successfully from Service API`);

    return successPaginatedResponse(
      boatsData.results ?? [],
      {
        page,
        limit,
        total: boatsData.numResults ?? 0,
      },
      'Boats found successfully from Service API',
    );
  }

  // * Public unified helper to fetch boats from all sources
  public async getBoats({
    source = BoatsSourceEnum.inventory,
    page = 1,
    limit = 20,
    fields = FieldPreset.minimal,
  }: GetBoatsDto): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    switch (source) {
      case BoatsSourceEnum.inventory:
        return this.getInventoryBoats(page, limit, fields);

      case BoatsSourceEnum.service:
        return this.getServiceBoats(page, limit, fields);

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

  public async getSingleBoat(
    boatId: string,
    query: GetSingleBoatDto,
  ): Promise<TResponse<BoatFromBoatsGroup>> {
    switch (query.source) {
      case BoatsSourceEnum.inventory:
        return await this.getSingleInventoryBoat(boatId, query.fields);

      // case BoatsSourceEnum.service:
      //   return await this.getServiceBoats(1, 1, query.fields).then(
      //     (response) => response.data[0],
      //   );

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
