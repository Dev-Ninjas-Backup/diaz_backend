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

export interface Boat {
  // Basic Info
  Source?: string;
  DocumentID?: string;
  SalesStatus?: string;
  CoOpIndicator?: boolean;
  NumberOfEngines?: number;
  BoatName?: string;
  MakeString?: string;
  MakeStringExact?: string;
  Model?: string;
  ModelExact?: string;
  ModelYear?: number;
  SaleClassCode?: string;
  BoatCategoryCode?: string;
  BoatClassCode?: string[];
  BuilderName?: string;
  DesignerName?: string;
  ListingTitle?: string;
  StockNumber?: string;

  // Price & Sales
  OriginalPrice?: string;
  Price?: string;
  NormPrice?: number;
  PriceHideInd?: boolean;
  OptionActiveIndicator?: boolean;

  // Dimensions
  NominalLength?: string;
  LengthOverall?: string;
  MaxDraft?: string;
  BeamMeasure?: string;
  BridgeClearanceMeasure?: string;
  FreeBoardMeasure?: string | null;
  CabinHeadroomMeasure?: string | null;
  DisplacementMeasure?: string | null;
  DisplacementTypeCode?: string;
  DryWeightMeasure?: string;
  DeadriseMeasure?: string;

  // Engine info
  TotalEnginePowerQuantity?: string;
  DriveTypeCode?: string;
  Engines?: Engine[];
  TotalEngineHoursNumeric?: number;

  // Tanks
  WaterTankCountNumeric?: number;
  WaterTankCapacityMeasure?: string;
  WaterTankMaterialCode?: string;
  FuelTankCountNumeric?: number;
  FuelTankCapacityMeasure?: string;
  FuelTankMaterialCode?: string;
  HoldingTankCountNumeric?: number;
  HoldingTankCapacityMeasure?: string;
  HoldingTankMaterialCode?: string;

  // Cabins & Heads
  HeadsCountNumeric?: number;
  CabinsCountNumeric?: number;

  // Hull & Extras
  BoatHullMaterialCode?: string;
  BoatHullID?: string;
  HasBoatHullID?: boolean;
  ConvertibleSaloonIndicator?: boolean;
  TrimTabsIndicator?: boolean;
  WindlassTypeCode?: string;
  ImmersiveTourPresent?: boolean;
  EmbeddedVideoPresent?: boolean;
  Image360PhotoPresent?: boolean;

  // Location
  BoatLocation?: {
    BoatCityName?: string;
    BoatCountryID?: string;
    BoatStateCode?: string;
  };

  // Dealer / Owner
  Owner?: {
    PartyId?: string;
  };
  SalesRep?: {
    PartyId?: string;
    Name?: string;
    Message?: string;
  };
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

  // Media
  Images?: {
    Priority?: number;
    Caption?: string;
    Uri?: string;
    LastModifiedDateTime?: string;
  }[];
  Videos?: {
    title?: string[];
    desc?: string[];
    thumbnailUrl?: string[];
    url?: string[];
  };
  EmbeddedVideo?: string[];

  // Description / Marketing
  GeneralBoatDescription?: string[];
  AdditionalDetailDescription?: string[];
  ExternalLink?: {
    Uri?: string;
    Text?: string;
    Type?: string;
  }[];
  Marketing?: {
    OpportunityType?: string;
    OpportunityMethod?: string;
    ProgramID?: string;
    ProgramDescription?: string;
    ProgramOffer?: string;
    PublicationID?: string;
    MarketingID?: string;
  }[];

  // Dates
  ItemReceivedDate?: string;
  LastModificationDate?: string;
  IMTTimeStamp?: string;
}
