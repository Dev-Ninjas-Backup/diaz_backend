import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ENVEnum } from '@/common/enum/env.enum';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { GetBoatsService } from '@/main/shared/boats/services/get-boats.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'query-string';
import { Boat } from './interface/boats.interface';

@Injectable()
export class BoatsGroupService {
  private readonly logger = new Logger(BoatsGroupService.name);
  private readonly apiBoatsKey: string;
  private readonly apiBoatsBaseUrl: string;
  private readonly serviceBoatsKey: string;
  private readonly serviceBoatsBaseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly getBoatsService: GetBoatsService,
  ) {
    this.apiBoatsKey = this.config.getOrThrow<string>(ENVEnum.API_BOATS_KEY);
    this.apiBoatsBaseUrl = `https://api.boats.com/inventory/search?key=${this.apiBoatsKey}&sort=LastModificationDate|desc`;
    this.serviceBoatsKey = this.config.getOrThrow<string>(
      ENVEnum.SERVICE_BOATS_KEY,
    );
    this.serviceBoatsBaseUrl = `https://services.boats.com/pls/boats/search?key=${this.serviceBoatsKey}&sort=LastModificationDate|desc`;
  }

  // * Get boats from Inventory API
  private getFieldsQuery(): string {
    const fields = [
      'Source',
      'DocumentID',
      'SalesStatus',
      'CoOpIndicator',
      'NumberOfEngines',
      'Owner',
      'SalesRep',
      'CompanyName',
      'Office',
      'LastModificationDate',
      'ItemReceivedDate',
      'OriginalPrice',
      'Price',
      'PriceHideInd',
      'EmbeddedVideoPresent',
      'Image360PhotoPresent',
      'ImmersiveTourPresent',
      'BoatLocation',
      'BoatCityNameNoCaseAlnumOnly',
      'MakeString',
      'MakeStringExact',
      'MakeStringNoCaseAlnumOnly',
      'ModelYear',
      'SaleClassCode',
      'Model',
      'ModelExact',
      'ModelNoCaseAlnumOnly',
      'BoatCategoryCode',
      'BoatName',
      'BoatNameNoCaseAlnumOnly',
      'BuilderName',
      'DesignerName',
      'CruisingSpeedMeasure',
      'PropellerCruisingSpeed',
      'MaximumSpeedMeasure',
      'RangeMeasure',
      'BridgeClearanceMeasure',
      'BeamMeasure',
      'FreeBoardMeasure',
      'CabinHeadroomMeasure',
      'WaterTankCountNumeric',
      'WaterTankCapacityMeasure',
      'WaterTankMaterialCode',
      'FuelTankCountNumeric',
      'FuelTankCapacityMeasure',
      'FuelTankMaterialCode',
      'HoldingTankCountNumeric',
      'HoldingTankCapacityMeasure',
      'HoldingTankMaterialCode',
      'DryWeightMeasure',
      'BallastWeightMeasure',
      'DisplacementMeasure',
      'DisplacementTypeCode',
      'TotalEnginePowerQuantity',
      'DriveTypeCode',
      'BoatKeelCode',
      'ConvertibleSaloonIndicator',
      'WindlassTypeCode',
      'DeadriseMeasure',
      'ElectricalCircuitMeasure',
      'TrimTabsIndicator',
      'HeadsCountNumeric',
      'CabinsCountNumeric',
      'BoatHullMaterialCode',
      'BoatHullID',
      'StockNumber',
      'NominalLength',
      'LengthOverall',
      'ListingTitle',
      'MaxDraft',
      'TaxStatusCode',
      'IMTTimeStamp',
      'HasBoatHullID',
      'IsAvailableForPls',
      'NormNominalLength',
      'NormPrice',
      'OptionActiveIndicator',
      'Engines',
      'Service',
      'GeneralBoatDescription',
      'Videos',
      'BoatClassCode',
      'EmbeddedVideo',
      'BoatClassCodeNoCaseAlnumOnly',
      'AdditionalDetailDescription',
      'ExternalLink',
      'Images',
      'Marketing',
      'TotalEngineHoursNumeric',
    ];

    return qs.stringify({ fields }, { arrayFormat: 'comma' });
  }

  // * Get boats from Inventory API
  private async getInventoryBoats(
    page: number,
    limit: number,
  ): Promise<TPaginatedResponse<Boat>> {
    const query = this.getFieldsQuery();
    const url = `${this.apiBoatsBaseUrl}&${query}&page=${page}&limit=${limit}`;

    const { data } = await axios.get(url);
    this.logger.log(`Boats found successfully from Inventory API: ${data}`);

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

  private async getBoatsFromDatabase(
    page: number,
    limit: number,
  ): Promise<TPaginatedResponse<Boat>> {
    // return await this.getBoatsService.getAllBoats({ page, limit });
    return successPaginatedResponse([], { page, limit, total: 0 });
  }

  // * Get boats from Service API
  private async getServiceBoats(
    page: number = 1,
    limit: number = 20,
  ): Promise<TPaginatedResponse<Boat>> {
    const query = this.getFieldsQuery();
    const url = `${this.serviceBoatsBaseUrl}&${query}&page=${page}&limit=${limit}`;

    const { data } = await axios.get(url);

    const boatsData = data.data ?? [];

    this.logger.log(`Boats found successfully from Service API: ${boatsData}`);

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
  public async getBoats(
    source: BoatsSourceEnum = BoatsSourceEnum.inventory,
    page: number = 1,
    limit: number = 20,
  ) {
    switch (source) {
      case BoatsSourceEnum.inventory:
        return this.getInventoryBoats(page, limit);

      case BoatsSourceEnum.service:
        return this.getServiceBoats(page, limit);

      case BoatsSourceEnum.custom:
        return this.getBoatsFromDatabase(page, limit);

      default:
        this.logger.warn(
          `Unknown boats source "${source}". Falling back to database source.`,
        );
        return this.getBoatsFromDatabase(page, limit);
    }
  }
}
