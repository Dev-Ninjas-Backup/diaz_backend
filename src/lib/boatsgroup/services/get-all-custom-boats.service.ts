import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { GetBoatsDto } from '@/main/shared/boats/dto/get-boats.dto';
import { Injectable, Logger } from '@nestjs/common';
import { BoatEngine, BoatImage, Boats, FileInstance } from '@prisma/client';
import { getBoatFieldsByPreset } from '../helpers/boat-field-presets';
import { FieldPreset } from '../interface/boats-fields.interface';
import {
  BoatFromBoatsGroup,
  Engine,
  Image,
} from '../interface/boats.interface';

@Injectable()
export class GetAllCustomBoatsService {
  private readonly logger = new Logger(GetAllCustomBoatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats(
    options?: GetBoatsDto,
  ): Promise<TPaginatedResponse<BoatFromBoatsGroup>> {
    const page = Math.max(Number(options?.page ?? 1), 1);
    // sensible default when limit omitted or <= 0
    const limit = Math.max(Number(options?.limit ?? 20), 1);

    const skip = (page - 1) * limit;

    const [total, boats] = await this.prisma.$transaction([
      this.prisma.boats.count(),
      this.prisma.boats.findMany({
        take: limit,
        skip,
        include: {
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

    return successPaginatedResponse(
      transformed,
      {
        page,
        limit,
        total,
      },
      'Boats found successfully',
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
      Make: engine.make ?? null,
      Model: engine.model ?? null,
      DriveTransmissionDescription: '',
      Fuel: engine.fuelType ?? null,
      EnginePower:
        engine.horsepower != null ? String(engine.horsepower) : undefined,
      Type: engine.fuelType ?? null,
      PropellerType: engine.propellerType ?? null,
      Year: undefined,
      Hours: engine.hours ?? null,
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

  private transformBoat(
    boat: Boats & {
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

    const result: BoatFromBoatsGroup = {
      DocumentID: boat.id,
      OriginalPrice: boat.price != null ? `${boat.price} USD` : undefined,
      Price:
        boat.price != null ? `${Number(boat.price).toFixed(2)} USD` : undefined,
      BoatLocation: {
        BoatCityName: boat.city ?? undefined,
        BoatCountryID: 'US',
        BoatStateCode: boat.state ?? undefined,
      },
      MakeString: boat.make ?? undefined,
      ModelYear: boat.buildYear ?? undefined,
      Model: boat.model ?? undefined,
      BeamMeasure: this.formatFeet(boat.beam) ?? undefined,
      TotalEnginePowerQuantity: totalHp != null ? `${totalHp} hp` : undefined,
      NominalLength: this.formatFeet(boat.length) ?? undefined,
      LengthOverall: this.formatFeet(boat.length) ?? undefined,
      ListingTitle: boat.name ?? undefined,
      MaxDraft: this.formatFeet(boat.draft) ?? undefined,
      Engines: mappedEngines?.length ? mappedEngines : undefined,
      GeneralBoatDescription: general.length ? general : undefined,
      AdditionalDetailDescription: additional.length ? additional : undefined,
      NumberOfEngines: boat.engines?.length ?? undefined,
      HeadsCountNumeric: boat.headsNumber ?? undefined,
      CabinsCountNumeric: boat.cabinsNumber ?? undefined,
      BoatHullMaterialCode: boat.material ?? undefined,
      SaleClassCode: boat.condition ?? undefined,
      BoatName: boat.name ?? undefined,
      Videos: boat.videoURL ? { url: [boat.videoURL] } : undefined,
      Images: mappedImages.length ? mappedImages : undefined,
      LastModificationDate: boat.updatedAt?.toISOString() ?? undefined,
      NormPrice: boat.price ?? undefined,
      NormNominalLength: boat.length ?? undefined,
    };

    // apply chosen fields preset before returning
    return this.applyFieldPreset(result, fields);
  }
}
