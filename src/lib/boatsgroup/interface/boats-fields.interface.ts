import { BoatFromBoatsGroup } from './boats.interface';

// 👇 helper to make sure all listed keys are valid
const makeFieldKeys = <T extends readonly (keyof BoatFromBoatsGroup)[]>(
  arr: T,
) => arr;

export const BOAT_FIELD_KEYS = makeFieldKeys([
  // Basic Info
  'Source',
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
  'BoatType',
  'NormNominalLength',

  // Price & Sales
  'OriginalPrice',
  'Price',
  'NormPrice',
  'CurrencyCode',
  'PriceHideInd',
  'OptionActiveIndicator',
  'ForSaleIndicator',
  'SoldIndicator',

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
  'CruisingSpeedKnots',
  'MaxSpeedKnots',
  'RangeMiles',

  // Engine info
  'TotalEnginePowerQuantity',
  'DriveTypeCode',
  'Engines',
  'TotalEngineHoursNumeric',
  'FuelType',

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
  'SingleBerths',
  'DoubleBerths',
  'TwinBerths',

  // Hull & Extras
  'BoatHullMaterialCode',
  'BoatHullColorPrimary',
  'BoatHullID',
  'HasBoatHullID',
  'ConvertibleSaloonIndicator',
  'TrimTabsIndicator',
  'WindlassTypeCode',
  'KeelTypeCode',
  'HullShapeCode',
  'SteeringTypeCode',
  'TrimTabsTypeCode',
  'NavigationLightsIndicator',
  'PremiumListingIndicator',
  'SponsoredListingIndicator',
  'FeaturedListingIndicator',

  // Generator / Electrical
  'GeneratorMake',
  'GeneratorPower',
  'BatteryCount',
  'ShorePowerIndicator',

  // Location
  'BoatLocation',

  // Dealer / Owner
  'Owner',
  'SalesRep',
  'CompanyName',
  'Office',
  'Dealer',

  // Media
  'Images',
  'Videos',
  'EmbeddedVideo',
  'VirtualTourUrl',
  'YouTubeUrl',
  'EmbeddedVideoPresent',
  'Image360PhotoPresent',
  'ImmersiveTourPresent',

  // Description / Marketing
  'GeneralBoatDescription',
  'AdditionalDetailDescription',
  'EquipmentList',
  'ExternalLink',
  'Marketing',
  'Tags',

  // System / Meta
  'ItemReceivedDate',
  'LastModificationDate',
  'IMTTimeStamp',
  'SourceSystemID',
  'Version',

  // Service Flags
  'LeadTrackingIndicator',
  'CallRecordingIndicator',
  'HasVideoIndicator',
] as const);

export type BoatFieldKey = (typeof BOAT_FIELD_KEYS)[number];

export enum FieldPreset {
  all = 'all',
  minimal = 'minimal',
  search = 'search',
}
