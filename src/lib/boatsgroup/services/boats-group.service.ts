import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ENVEnum } from '@/common/enum/env.enum';
import { AppError } from '@/common/error/handle-error.app';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'query-string';
import { getBoatFieldsByPreset } from '../helpers/boat-field-presets';
import { FieldPreset } from '../interface/boats-fields.interface';
import { BoatFromBoatsGroup } from '../interface/boats.interface';

@Injectable()
export class BoatsGroupService {
  private readonly apiBoatsKey: string;
  private readonly apiBoatsBaseUrl: string;
  private readonly serviceBoatsKey: string;
  private readonly serviceBoatsBaseUrl: string;

  constructor(private readonly config: ConfigService) {
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
  async getInventoryBoats(
    page: number,
    limit: number,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<
    TPaginatedResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>
  > {
    const query = this.buildFieldsQuery(fields);

    const start = (page - 1) * limit;

    const url = `${this.apiBoatsBaseUrl}&${query}&start=${start}&rows=${limit}`;

    const { data } = await axios.get(url);

    const boats = data.results?.map((boat: BoatFromBoatsGroup) => {
      return {
        Source: BoatsSourceEnum.inventory,
        ...boat,
      };
    });

    return successPaginatedResponse(
      boats ?? [],
      {
        page,
        limit,
        total: data.numResults ?? 0,
      },
      'Boats found successfully from Inventory API',
    );
  }

  async getSingleInventoryBoat(
    boatId: string,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>> {
    const query = this.buildFieldsQuery(fields);

    const url = `${this.apiBoatsBaseUrl}&${query}&DocumentID=${boatId}`;

    const { data } = await axios.get(url);

    const boat = data.results?.[0];

    if (!boat) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Boat not found');
    }

    return successResponse(
      {
        Source: BoatsSourceEnum.inventory,
        ...boat,
      },
      'Boat found successfully from Inventory API',
    );
  }

  // * Get boats from Service API
  async getServiceBoats(
    page: number = 1,
    limit: number = 20,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<
    TPaginatedResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>
  > {
    const query = this.buildFieldsQuery(fields);
    const start = (page - 1) * limit;

    const url = `${this.serviceBoatsBaseUrl}&${query}&start=${start}&rows=${limit}`;

    const { data } = await axios.get(url);

    const boatsData = data.data ?? data;

    const boats = boatsData.results?.map((boat: BoatFromBoatsGroup) => {
      return {
        Source: BoatsSourceEnum.service,
        ...boat,
      };
    });

    return successPaginatedResponse(
      boats ?? [],
      {
        page,
        limit,
        total: boatsData.numResults ?? 0,
      },
      'Boats found successfully from Service API',
    );
  }

  async getSingleServiceBoat(
    boatId: string,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>> {
    const query = this.buildFieldsQuery(fields);

    const url = `${this.serviceBoatsBaseUrl}&${query}&DocumentID=${boatId}`;

    const { data } = await axios.get(url);

    const boat = data?.data?.results?.[0];

    if (!boat) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Boat not found');
    }

    return successResponse(
      {
        Source: BoatsSourceEnum.service,
        ...boat,
      },
      'Boat found successfully from Service API',
    );
  }
}
