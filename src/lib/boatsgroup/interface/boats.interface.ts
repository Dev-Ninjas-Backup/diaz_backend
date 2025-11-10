export interface Engine {
  Make?: string;
  Model?: string;
  DriveTransmissionDescription?: string;
  Fuel?: string;
  EnginePower?: string;
  Type?: string;
  PropellerType?: string;
  Year?: number;
  Hours?: number;
  BoatEngineLocationCode?: string;
}

export interface Image {
  Priority?: number;
  Caption?: string;
  Uri?: string;
  LastModifiedDateTime?: string;
}

export interface BoatFromBoatsGroup {
  // Basic Info
  DocumentID?: string;
  SalesStatus?: string;
  CoOpIndicator?: boolean;
  NumberOfEngines?: number;
  Owner?: { PartyId?: string };
  SalesRep?: { PartyId?: string; Name?: string; Message?: string };
  CompanyName?: string;
  Office?: {
    PostalAddress?: string;
    City?: string;
    State?: string;
    PostCode?: string;
    Country?: string;
    Email?: string;
    Phone?: string;
    Name?: string;
  };
  LastModificationDate?: string;
  ItemReceivedDate?: string;

  // Price & Status
  OriginalPrice?: string;
  Price?: string;
  PriceHideInd?: boolean;

  // Media Presence
  EmbeddedVideoPresent?: boolean;
  Image360PhotoPresent?: boolean;
  ImmersiveTourPresent?: boolean;

  // Location
  BoatLocation?: {
    BoatCityName?: string;
    BoatCountryID?: string;
    BoatStateCode?: string;
  };
  BoatCityNameNoCaseAlnumOnly?: string;

  // Make / Model
  MakeString?: string;
  MakeStringExact?: string;
  MakeStringNoCaseAlnumOnly?: string;
  ModelYear?: number;
  SaleClassCode?: string;
  Model?: string;
  ModelExact?: string;
  ModelNoCaseAlnumOnly?: string;
  BoatCategoryCode?: string;
  BoatName?: string;
  BoatNameNoCaseAlnumOnly?: string;
  BuilderName?: string;
  DesignerName?: string;

  // Measurements
  CruisingSpeedMeasure?: string;
  PropellerCruisingSpeed?: string;
  MaximumSpeedMeasure?: string;
  RangeMeasure?: string;
  BridgeClearanceMeasure?: string;
  BeamMeasure?: string;
  FreeBoardMeasure?: string | null;
  CabinHeadroomMeasure?: string | null;
  WaterTankCountNumeric?: number;
  WaterTankCapacityMeasure?: string;
  WaterTankMaterialCode?: string;
  FuelTankCountNumeric?: number;
  FuelTankCapacityMeasure?: string;
  FuelTankMaterialCode?: string;
  HoldingTankCountNumeric?: number;
  HoldingTankCapacityMeasure?: string;
  HoldingTankMaterialCode?: string;
  DryWeightMeasure?: string;
  BallastWeightMeasure?: string;
  DisplacementMeasure?: string;
  DisplacementTypeCode?: string;
  TotalEnginePowerQuantity?: string;
  DriveTypeCode?: string;
  BoatKeelCode?: string;
  ConvertibleSaloonIndicator?: boolean;
  WindlassTypeCode?: string;
  DeadriseMeasure?: string;
  ElectricalCircuitMeasure?: string;
  TrimTabsIndicator?: boolean;
  HeadsCountNumeric?: number;
  CabinsCountNumeric?: number;
  BoatHullMaterialCode?: string;
  BoatHullID?: string;
  StockNumber?: string;
  NominalLength?: string;
  LengthOverall?: string;
  ListingTitle?: string;
  MaxDraft?: string;
  TaxStatusCode?: string;
  IMTTimeStamp?: string;
  HasBoatHullID?: boolean;
  IsAvailableForPls?: boolean;
  NormNominalLength?: number;
  NormPrice?: number;
  OptionActiveIndicator?: boolean;

  // Engine
  Engines?: Engine[];

  // Descriptions
  GeneralBoatDescription?: string[];
  AdditionalDetailDescription?: string[];
  ExternalLink?: {
    Uri?: string;
    Text?: string;
    Type?: string;
  }[];

  // Media
  Videos?: {
    title?: string[];
    desc?: string[];
    thumbnailUrl?: string[];
    url?: string[];
  };
  EmbeddedVideo?: string[];
  Images?: Image[];

  // Classification
  BoatClassCode?: string[];
  BoatClassCodeNoCaseAlnumOnly?: string;
}
