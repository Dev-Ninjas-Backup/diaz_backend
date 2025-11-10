import { BoatFromBoatsGroup } from './boats.interface';

// 👇 helper to make sure all listed keys are valid
const makeFieldKeys = <T extends readonly (keyof BoatFromBoatsGroup)[]>(
  arr: T,
) => arr;

export const BOAT_FIELD_KEYS = makeFieldKeys([
  // Basic Info
  'DocumentID',
  'ListingTitle',
  'SalesStatus',
  'CoOpIndicator',
  'NumberOfEngines',
  'BoatName',
  'MakeString',
  'MakeStringExact',
  'Model',
  'ModelExact',
  'ModelYear',
  'BuilderName',
  'DesignerName',
  'StockNumber',
  'SaleClassCode',
  'BoatCategoryCode',
  'BoatClassCode',
  'NormNominalLength',

  // Price & Sales
  'OriginalPrice',
  'Price',
  'NormPrice',
  'PriceHideInd',
  'OptionActiveIndicator',

  // Dimensions
  'NominalLength',
  'LengthOverall',
  'MaxDraft',
  'BeamMeasure',
  'BridgeClearanceMeasure',
  'FreeBoardMeasure',
  'CabinHeadroomMeasure',
  'DisplacementMeasure',
  'DisplacementTypeCode',
  'DryWeightMeasure',
  'DeadriseMeasure',

  // Performance
  'CruisingSpeedMeasure',
  'MaximumSpeedMeasure',
  'RangeMeasure',

  // Engine info
  'TotalEnginePowerQuantity',
  'DriveTypeCode',
  'Engines',

  // Tanks
  'WaterTankCountNumeric',
  'WaterTankCapacityMeasure',
  'WaterTankMaterialCode',
  'FuelTankCountNumeric',
  'FuelTankCapacityMeasure',
  'FuelTankMaterialCode',
  'HoldingTankCountNumeric',
  'HoldingTankCapacityMeasure',
  'HoldingTankMaterialCode',

  // Cabins & Heads
  'HeadsCountNumeric',
  'CabinsCountNumeric',

  // Hull & Extras
  'BoatHullMaterialCode',
  'BoatHullID',
  'HasBoatHullID',
  'ConvertibleSaloonIndicator',
  'TrimTabsIndicator',
  'WindlassTypeCode',

  // Location
  'BoatLocation',

  // Dealer / Owner
  'Owner',
  'SalesRep',
  'CompanyName',
  'Office',

  // Media
  'Images',
  'Videos',
  'EmbeddedVideo',
  'EmbeddedVideoPresent',
  'Image360PhotoPresent',
  'ImmersiveTourPresent',

  // Description / Marketing
  'GeneralBoatDescription',
  'AdditionalDetailDescription',
  'ExternalLink',

  // System / Meta
  'ItemReceivedDate',
  'LastModificationDate',
  'IMTTimeStamp',
] as const);

export type BoatFieldKey = (typeof BOAT_FIELD_KEYS)[number];

export enum FieldPreset {
  all = 'all',
  minimal = 'minimal',
  search = 'search',
}
