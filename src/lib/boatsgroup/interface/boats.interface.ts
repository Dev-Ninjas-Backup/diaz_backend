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
  EngineCount?: number;
  PropellerMaterial?: string;
  PropellerBladeCountNumeric?: number;
}

export interface Image {
  Priority?: number;
  Caption?: string;
  Uri?: string;
  LastModifiedDateTime?: string;
  ThumbnailUri?: string;
}

export interface BoatFromBoatsGroup {
  // Basic Info
  Source?: string;
  DocumentID?: string;
  ListingTitle?: string;
  SalesStatus?: string;
  CoOpIndicator?: boolean;
  NumberOfEngines?: number;
  BoatName?: string;
  MakeString?: string;
  MakeStringExact?: string;
  Model?: string;
  ModelExact?: string;
  ModelYear?: number;
  BuilderName?: string;
  DesignerName?: string;
  StockNumber?: string;
  SaleClassCode?: string;
  BoatCategoryCode?: string;
  BoatClassCode?: string[];
  BoatType?: string;
  NormNominalLength?: number;

  // Price & Sales
  OriginalPrice?: string;
  Price?: string;
  NormPrice?: number;
  PriceHideInd?: boolean;
  OptionActiveIndicator?: boolean;
  CurrencyCode?: string;
  ForSaleIndicator?: boolean;
  SoldIndicator?: boolean;

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

  // Performance
  CruisingSpeedMeasure?: string;
  MaximumSpeedMeasure?: string;
  RangeMeasure?: string;
  MaxSpeedKnots?: number;
  CruisingSpeedKnots?: number;
  RangeMiles?: number;

  // Engine info
  TotalEnginePowerQuantity?: string;
  DriveTypeCode?: string;
  Engines?: Engine[];
  TotalEngineHoursNumeric?: number;
  FuelType?: string;

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
  SingleBerths?: number;
  DoubleBerths?: number;
  TwinBerths?: number;

  // Hull & Extras
  BoatHullMaterialCode?: string;
  BoatHullColorPrimary?: string;
  BoatHullID?: string;
  HasBoatHullID?: boolean;
  ConvertibleSaloonIndicator?: boolean;
  TrimTabsIndicator?: boolean;
  WindlassTypeCode?: string;
  ImmersiveTourPresent?: boolean;
  EmbeddedVideoPresent?: boolean;
  Image360PhotoPresent?: boolean;
  KeelTypeCode?: string;
  HullShapeCode?: string;
  SteeringTypeCode?: string;
  TrimTabsTypeCode?: string;
  NavigationLightsIndicator?: boolean;

  // Performance Equipment / Electrical
  GeneratorMake?: string;
  GeneratorPower?: string;
  ShorePowerIndicator?: boolean;
  BatteryCount?: number;

  // Location
  BoatLocation?: {
    BoatCityName?: string;
    BoatCountryID?: string;
    BoatStateCode?: string;
    Latitude?: number;
    Longitude?: number;
    MarinaName?: string;
    Slip?: string;
  };

  // Dealer / Owner
  Owner?: {
    PartyId?: string;
  };
  SalesRep?: {
    PartyId?: string;
    Name?: string;
    Message?: string;
    Phone?: string;
    Email?: string;
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
  Dealer?: {
    Name?: string;
    Website?: string;
  };

  // Media
  Images?: Image[];
  Videos?: {
    title?: string[];
    desc?: string[];
    thumbnailUrl?: string[];
    url?: string[];
  };
  EmbeddedVideo?: string[];
  VirtualTourUrl?: string;
  YouTubeUrl?: string;

  // Description / Marketing
  GeneralBoatDescription?: string[];
  AdditionalDetailDescription?: string[];
  EquipmentList?: string[];
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
  Tags?: string[];
  FeaturedListingIndicator?: boolean;

  // System / Meta
  ItemReceivedDate?: string;
  LastModificationDate?: string;
  IMTTimeStamp?: string;
  SourceSystemID?: string;
  Version?: string;

  // Service Flags
  PremiumListingIndicator?: boolean;
  SponsoredListingIndicator?: boolean;
  CallRecordingIndicator?: boolean;
  LeadTrackingIndicator?: boolean;
  HasVideoIndicator?: boolean;
}
