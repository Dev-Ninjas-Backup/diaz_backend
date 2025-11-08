import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BoatEngine, Boats } from '@prisma/client';
import { GetAllBoatsAIServerDto } from '../dto/get-all-boats-ai-server.dto';

@Injectable()
export class GetBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatFeet(value: number | null | undefined): string | null {
    if (value === null || value === undefined || Number.isNaN(value))
      return null;
    const fixed =
      Math.round(value) === value ? `${value}` : `${+value.toFixed(2)}`;
    return `${fixed} ft`;
  }

  private sanitizeCityNameForKey(name?: string | null): string | null {
    if (!name) return null;
    return name.replace(/[^a-z0-9]/gi, '').toLowerCase();
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

  private mapEngineToOutput(engine: any) {
    return {
      Make: engine.make ?? null,
      Model: engine.model ?? null,
      DriveTransmissionDescription: null,
      Fuel: engine.fuelType ?? null,
      EnginePower:
        engine.horsepower != null ? `${engine.horsepower}|horsepower` : null,
      Type: null,
      PropellerType: engine.propellerType ?? null,
      Year: null,
      Hours: engine.hours ?? null,
      BoatEngineLocationCode: null,
    };
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

  private detailsPageLink(boatId: string) {
    return `https://development.jupitermarinesales.com/search-listing/${boatId}`;
  }

  private transformBoat(boat: Boats & { engines: BoatEngine[] }) {
    const mappedEngines = Array.isArray(boat.engines)
      ? boat.engines.map((e: BoatEngine) => this.mapEngineToOutput(e))
      : [];

    const totalHp =
      Array.isArray(boat.engines) && boat.engines.length > 0
        ? boat.engines.reduce(
            (s: number, en: any) => s + (Number(en.horsepower) || 0),
            0,
          )
        : null;

    const { general, additional } = this.extractDescriptions(boat);

    return {
      DocumentID: boat.id,
      OriginalPrice: boat.price != null ? `${boat.price} USD` : null,
      Price: boat.price != null ? `${Number(boat.price).toFixed(2)} USD` : null,
      BoatLocation: {
        BoatCityName: boat.city ?? null,
        BoatCountryID: 'US',
        BoatStateCode: boat.state ?? null,
      },
      BoatCityNameNoCaseAlnumOnly:
        this.sanitizeCityNameForKey(boat.city) ?? null,
      MakeString: boat.make ?? null,
      ModelYear: boat.buildYear ?? null,
      Model: boat.model ?? null,
      BeamMeasure: this.formatFeet(boat.beam),
      TotalEnginePowerQuantity: totalHp != null ? `${totalHp} hp` : null,
      NominalLength: this.formatFeet(boat.length),
      LengthOverall: this.formatFeet(boat.length),
      ListingTitle: boat.name ?? null,
      MaxDraft: this.formatFeet(boat.draft),
      Engines: mappedEngines,
      GeneralBoatDescription: general,
      AdditionalDetailDescription: additional,
      Link: this.detailsPageLink(boat.id),
    };
  }

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats(options?: GetAllBoatsAIServerDto) {
    const page = Math.max(Number(options?.page) || 1, 1);
    const limit = Math.max(Number(options?.limit) || 0, 0);

    if (limit > 0) {
      const skip = (page - 1) * limit;

      const [total, boats] = await Promise.all([
        this.prisma.boats.count(),
        this.prisma.boats.findMany({
          skip,
          take: limit,
          include: { engines: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const transformed = boats.map((boat) => this.transformBoat(boat));
      const totalPages = Math.ceil(total / limit);

      return {
        data: transformed,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // No pagination: return all
    const boats = await this.prisma.boats.findMany({
      include: { engines: true },
      orderBy: { createdAt: 'desc' },
    });
    return boats.map((boat) => this.transformBoat(boat));
  }
}
