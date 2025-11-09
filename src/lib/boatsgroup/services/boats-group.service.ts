import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ENVEnum } from '@/common/enum/env.enum';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { GetBoatsDto } from '@/main/shared/boats/dto/get-boats.dto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'query-string';
import {
  BOAT_FIELD_KEYS,
  BoatFieldKey,
  FieldPreset,
} from '../interface/boats-fields.interface';
import { Boat } from '../interface/boats.interface';
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

  // * Get minimal fields
  private getMinimalFields(): BoatFieldKey[] {
    return [
      'DocumentID',
      'ListingTitle',
      'Price',
      'BoatLocation',
      'BoatCityNameNoCaseAlnumOnly',
      'FuelTankCapacityMeasure',
      'FuelTankCountNumeric',
      'MakeString',
      'ModelYear',
      'Model',
      'BeamMeasure',
      'TotalEngineHoursNumeric',
      'TotalEnginePowerQuantity',
      'NominalLength',
      'LengthOverall',
      'LastModificationDate',
      'GeneralBoatDescription',
      'AdditionalDetailDescription',
      'Engines',
    ];
  }

  private getSearchFields(): BoatFieldKey[] {
    return [
      ...this.getMinimalFields(),
      'Owner',
      'SalesRep',
      'CompanyName',
      'Office',
      'NumberOfEngines',
      'MaxDraft',
    ];
  }

  // * Build fields query
  private buildFieldsQuery(fields?: FieldPreset): string {
    let fieldsToUse: BoatFieldKey[];

    switch (fields) {
      case 'all':
        fieldsToUse = [...BOAT_FIELD_KEYS];
        break;

      case 'minimal':
        fieldsToUse = this.getMinimalFields();
        break;

      case 'search':
        fieldsToUse = this.getSearchFields();
        break;

      default:
        this.logger.log(
          `Unknown fields preset: ${fields}, using default fields preset`,
        );
        fieldsToUse = this.getSearchFields();
        break;
    }

    return qs.stringify({ fields: fieldsToUse }, { arrayFormat: 'comma' });
  }

  // * Get boats from Inventory API
  private async getInventoryBoats(
    page: number,
    limit: number,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TPaginatedResponse<Boat>> {
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

  // * Get boats from Service API
  private async getServiceBoats(
    page: number = 1,
    limit: number = 20,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TPaginatedResponse<Boat>> {
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

  // * Get boats from Database
  private async getBoatsFromDatabase(
    page: number,
    limit: number,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TPaginatedResponse<Boat>> {
    return await this.getAllCustomBoatsService.getAllBoats({
      page,
      limit,
      fields,
    });
  }

  // * Public unified helper to fetch boats from all sources
  public async getBoats({
    source = BoatsSourceEnum.inventory,
    page = 1,
    limit = 20,
    fields = FieldPreset.minimal,
  }: GetBoatsDto): Promise<TPaginatedResponse<Boat>> {
    switch (source) {
      case BoatsSourceEnum.inventory:
        return this.getInventoryBoats(page, limit, fields);

      case BoatsSourceEnum.service:
        return this.getServiceBoats(page, limit, fields);

      case BoatsSourceEnum.custom:
        return this.getBoatsFromDatabase(page, limit, fields);

      default:
        this.logger.warn(
          `Unknown boats source "${source}". Falling back to database source.`,
        );
        return this.getBoatsFromDatabase(page, limit, fields);
    }
  }
}
