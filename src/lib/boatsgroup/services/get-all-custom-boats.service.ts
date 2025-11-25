import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { GetBoatsDto } from '@/main/shared/boats/dto/get-boats.dto';
import { Injectable } from '@nestjs/common';
import { BoatEngine, BoatImage, Boats, FileInstance } from 'generated/client';
import { getBoatFieldsByPreset } from '../helpers/boat-field-presets';
import { FieldPreset } from '../interface/boats-fields.interface';
import {
  BoatFromBoatsGroup,
  Engine,
  Image,
} from '../interface/boats.interface';

@Injectable()
export class GetAllCustomBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats(
    options?: GetBoatsDto,
  ): Promise<
    TPaginatedResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>
  > {
    const page = Math.max(Number(options?.page ?? 1), 1);
    // sensible default when limit omitted or <= 0
    const limit = Math.max(Number(options?.limit ?? 20), 1);

    const skip = (page - 1) * limit;

    const [total, boats] = await this.prisma.client.$transaction([
      this.prisma.client.boats.count(),
      this.prisma.client.boats.findMany({
        take: limit,
        skip,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
            },
          },
          engines: true,
          images: {
            include: {
              file: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const transformed = boats.map((boat) =>
      this.transformBoat(boat, options?.fields),
    );

    const boatsWithSource = transformed.map((boat) => {
      return {
        Source: BoatsSourceEnum.custom,
        ...boat,
      };
    });

    return successPaginatedResponse(
      boatsWithSource,
      {
        page,
        limit,
        total,
      },
      'Boats found successfully',
    );
  }

  @HandleError('Failed to get boat', 'Boats')
  async getSingleBoat(
    boatId: string,
    fields: FieldPreset = FieldPreset.minimal,
  ): Promise<TResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>> {
    const boat = await this.prisma.client.boats.findUniqueOrThrow({
      where: { id: boatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
        engines: true,
        images: {
          include: {
            file: true,
          },
        },
      },
    });

    const transformed = this.transformBoat(boat, fields);

    return successResponse(
      {
        Source: BoatsSourceEnum.custom,
        ...transformed,
      },
      'Boat found successfully',
    );
  }

  private formatFeet(value: number | null | undefined): string | null {
    if (value === null || value === undefined || Number.isNaN(value))
      return null;
    const fixed =
      Math.round(value) === value ? `${value}` : `${+value.toFixed(2)}`;
    return `${fixed} ft`;
  }

  private parseExtraDetails(extraDetails: any): any {
    if (!extraDetails) return null;
    try {
      if (typeof extraDetails === 'string') return JSON.parse(extraDetails);
      return extraDetails;
    } catch {
      return extraDetails;
    }
  }

  private mapEngineToOutput(engine: BoatEngine): Engine {
    const mappedEngine: Engine = {
      Make: engine.make ?? undefined,
      Model: engine.model ?? undefined,
      DriveTransmissionDescription: undefined,
      Fuel: engine.fuelType ?? undefined,
      EnginePower:
        engine.horsepower != null ? String(engine.horsepower) : undefined,
      Type: engine.fuelType ?? undefined,
      PropellerType: engine.propellerType ?? undefined,
      Year: undefined,
      Hours: engine.hours ?? undefined,
      BoatEngineLocationCode: undefined,
    };
    return mappedEngine;
  }

  private extractDescriptions(boat: any) {
    const general: string[] = [];
    const additional: string[] = [];

    if (boat.description) {
      const lines = String(boat.description)
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      general.push(...lines);
    }

    const parsed = this.parseExtraDetails(boat.extraDetails);

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === 'string') additional.push(item.trim());
        else if (item && typeof item === 'object') {
          if ('value' in item && item.value)
            additional.push(String(item.value).trim());
          else {
            const kv = Object.entries(item)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' — ');
            additional.push(kv);
          }
        }
      }
    } else if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        additional.push(`${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`);
      }
    } else if (typeof parsed === 'string') {
      additional.push(parsed);
    }

    const normalize = (arr: string[]) =>
      Array.from(new Set(arr.map((s) => s.replace(/\s+/g, ' ').trim()))).filter(
        Boolean,
      );

    return {
      general: normalize(general),
      additional: normalize(additional),
    };
  }

  private formatImages(images: BoatImage & { file: FileInstance }): Image {
    const mappedImages: Image = {
      Priority: images.imageType === 'GALLERY' ? 1 : 2,
      Caption: undefined,
      Uri: images.file?.url ?? null,
      LastModifiedDateTime: images?.file
        ? new Date(images.file.updatedAt).toISOString()
        : undefined,
    };

    return mappedImages;
  }

  private applyFieldPreset(
    obj: BoatFromBoatsGroup,
    fields: FieldPreset = FieldPreset.minimal,
  ): BoatFromBoatsGroup {
    if (fields === FieldPreset.all) return obj;

    const allowed = getBoatFieldsByPreset(fields);
    const filtered: Record<string, unknown> = {};

    for (const key of allowed) {
      filtered[key] = obj[key];
    }

    return filtered as BoatFromBoatsGroup;
  }

  public transformBoat(
    boat: Boats & {
      user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatarUrl?: string | null;
      };
      engines: BoatEngine[];
      images: (BoatImage & { file: FileInstance })[];
    },
    fields: FieldPreset = FieldPreset.minimal,
  ): BoatFromBoatsGroup {
    const mappedEngines: Engine[] = Array.isArray(boat.engines)
      ? boat.engines.map((e: any) => this.mapEngineToOutput(e))
      : [];

    const mappedImages: Image[] = Array.isArray(boat.images)
      ? boat.images.map((i: any) => this.formatImages(i))
      : [];

    const totalHp =
      Array.isArray(boat.engines) && boat.engines.length > 0
        ? boat.engines.reduce(
            (s: number, en: any) => s + (Number(en.horsepower) || 0),
            0,
          )
        : null;

    const { general, additional } = this.extractDescriptions(boat);

    // parsed extra details helper
    const parsedExtra = this.parseExtraDetails(boat.extraDetails) ?? {};

    // sanitize boat.city to alnum-only lowercase for BoatCityNameNoCaseAlnumOnly
    const cityAlnum =
      boat.city && typeof boat.city === 'string'
        ? boat.city.replace(/[^a-z0-9]/gi, '').toLowerCase()
        : undefined;

    // class codes array
    const classCodes =
      typeof boat.class === 'string'
        ? boat.class
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    // Office object: prefer explicit office info in extraDetails, fallback to user/contact data
    const office = parsedExtra.office ?? {
      PostalAddress:
        parsedExtra.postalAddress ??
        (boat.city || boat.state || boat.zip
          ? `${boat.city ?? ''}${boat.state ? ', ' + boat.state : ''}${
              boat.zip ? ' ' + boat.zip : ''
            }`
          : undefined),
      City: parsedExtra.city ?? boat.city ?? undefined,
      State: parsedExtra.state ?? boat.state ?? undefined,
      PostCode: parsedExtra.postCode ?? boat.zip ?? undefined,
      Country: parsedExtra.country ?? 'US',
      Email: parsedExtra.email ?? boat.user?.email ?? undefined,
      Phone: parsedExtra.phone ?? boat.user?.phone ?? undefined,
      Name: parsedExtra.officeName ?? boat.user?.name ?? undefined,
    };

    const result: BoatFromBoatsGroup = {
      // basic mapping
      DocumentID: boat.id,
      SalesStatus: boat.status ?? undefined,
      CoOpIndicator: parsedExtra.coOpIndicator ?? false,
      NumberOfEngines: boat.engines?.length ?? undefined,
      Owner: { PartyId: boat.userId ?? undefined },
      SalesRep: parsedExtra.salesRep
        ? {
            PartyId: parsedExtra.salesRep.partyId ?? undefined,
            Name: parsedExtra.salesRep.name ?? undefined,
            Message: parsedExtra.salesRep.message ?? undefined,
          }
        : undefined,
      CompanyName: parsedExtra.companyName ?? boat.user?.name ?? undefined,
      Office: office,
      LastModificationDate: boat.updatedAt?.toISOString() ?? undefined,
      ItemReceivedDate:
        parsedExtra.itemReceivedDate ??
        (boat.createdAt ? boat.createdAt.toISOString() : undefined),

      // Pricing
      OriginalPrice: boat.price != null ? `${boat.price} USD` : undefined,
      Price:
        boat.price != null ? `${Number(boat.price).toFixed(2)} USD` : undefined,
      PriceHideInd: parsedExtra.priceHideInd ?? undefined,
      NormPrice: boat.price ?? undefined,

      // Media presence flags
      EmbeddedVideoPresent: Boolean(boat.videoURL),
      Image360PhotoPresent: parsedExtra.image360Present ?? false,
      ImmersiveTourPresent: parsedExtra.immersiveTourPresent ?? false,
      Videos: boat.videoURL ? { url: [boat.videoURL] } : undefined,

      // Location
      BoatLocation: {
        BoatCityName: boat.city ?? undefined,
        BoatCountryID: parsedExtra.country ?? 'US',
        BoatStateCode: boat.state ?? undefined,
      },
      BoatCityNameNoCaseAlnumOnly: cityAlnum,

      // Make / Model
      MakeString: boat.make ?? undefined,
      MakeStringExact: boat.make ?? undefined,
      MakeStringNoCaseAlnumOnly: boat.make
        ? String(boat.make)
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase()
        : undefined,
      ModelYear: boat.buildYear ?? undefined,
      SaleClassCode: boat.condition ?? undefined,
      Model: boat.model ?? undefined,
      ModelExact: boat.model ?? undefined,
      ModelNoCaseAlnumOnly: boat.model
        ? String(boat.model)
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase()
        : undefined,
      BoatName: boat.name ?? undefined,
      BoatNameNoCaseAlnumOnly: boat.name
        ? String(boat.name)
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase()
        : undefined,
      BuilderName: boat.make ?? undefined,
      DesignerName: parsedExtra.designerName ?? undefined,

      // Measurements (best-effort — many are not stored directly; use extra details where possible)
      CruisingSpeedMeasure: parsedExtra.cruisingSpeed ?? undefined,
      PropellerCruisingSpeed: parsedExtra.propCruisingSpeed ?? undefined,
      MaximumSpeedMeasure: parsedExtra.maxSpeed ?? undefined,
      RangeMeasure: parsedExtra.range ?? undefined,
      BridgeClearanceMeasure: parsedExtra.bridgeClearance ?? undefined,
      BeamMeasure: this.formatFeet(boat.beam) ?? undefined,
      FreeBoardMeasure: parsedExtra.freeBoard ?? undefined,
      CabinHeadroomMeasure: parsedExtra.cabinHeadroom ?? undefined,
      WaterTankCountNumeric: parsedExtra.waterTankCount ?? undefined,
      WaterTankCapacityMeasure: parsedExtra.waterTankCapacity ?? undefined,
      WaterTankMaterialCode: parsedExtra.waterTankMaterial ?? undefined,
      FuelTankCountNumeric: parsedExtra.fuelTankCount ?? undefined,
      FuelTankCapacityMeasure: parsedExtra.fuelTankCapacity ?? undefined,
      FuelTankMaterialCode: parsedExtra.fuelTankMaterial ?? undefined,
      HoldingTankCountNumeric: parsedExtra.holdingTankCount ?? undefined,
      HoldingTankCapacityMeasure: parsedExtra.holdingTankCapacity ?? undefined,
      HoldingTankMaterialCode: parsedExtra.holdingTankMaterial ?? undefined,
      DryWeightMeasure: parsedExtra.dryWeight ?? undefined,
      BallastWeightMeasure: parsedExtra.ballastWeight ?? undefined,
      DisplacementMeasure: parsedExtra.displacement ?? undefined,
      DisplacementTypeCode: parsedExtra.displacementType ?? undefined,
      TotalEnginePowerQuantity: totalHp != null ? `${totalHp} hp` : undefined,
      DriveTypeCode: boat.engineType ?? boat.propType ?? undefined,
      BoatKeelCode: parsedExtra.keelCode ?? undefined,
      ConvertibleSaloonIndicator: parsedExtra.convertibleSaloon ?? undefined,
      WindlassTypeCode: parsedExtra.windlassType ?? undefined,
      DeadriseMeasure: parsedExtra.deadrise ?? undefined,
      ElectricalCircuitMeasure: parsedExtra.electricalCircuit ?? undefined,
      TrimTabsIndicator: parsedExtra.trimTabs ?? undefined,
      HeadsCountNumeric: boat.headsNumber ?? undefined,
      CabinsCountNumeric: boat.cabinsNumber ?? undefined,
      BoatHullMaterialCode: boat.material ?? undefined,
      BoatHullID: parsedExtra.boatHullId ?? undefined,
      StockNumber: parsedExtra.stockNumber ?? undefined,
      NominalLength: this.formatFeet(boat.length) ?? undefined,
      LengthOverall: this.formatFeet(boat.length) ?? undefined,
      ListingTitle: boat.name ?? undefined,
      MaxDraft: this.formatFeet(boat.draft) ?? undefined,
      TaxStatusCode: parsedExtra.taxStatus ?? undefined,
      IMTTimeStamp: boat.updatedAt?.toISOString() ?? undefined,
      HasBoatHullID: Boolean(parsedExtra.boatHullId ?? parsedExtra.hullId),
      IsAvailableForPls: parsedExtra.isAvailableForPls ?? undefined,
      NormNominalLength: boat.length ?? undefined,
      OptionActiveIndicator: parsedExtra.optionActiveIndicator ?? undefined,

      // Engine & descriptions & media
      Engines: mappedEngines?.length ? mappedEngines : undefined,
      GeneralBoatDescription: general.length ? general : undefined,
      AdditionalDetailDescription: additional.length ? additional : undefined,
      ExternalLink: parsedExtra.externalLinks ?? undefined,
      Images: mappedImages.length ? mappedImages : undefined,
      BoatClassCode: classCodes,
    };

    // apply chosen fields preset before returning
    return this.applyFieldPreset(result, fields);
  }
}
