import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatFeet(value: number | null | undefined): string | null {
    if (value === null || value === undefined || Number.isNaN(value))
      return null;
    // remove trailing .00 when possible, keep up to 2 decimal places otherwise
    const fixed =
      Math.round(value) === value ? `${value}` : `${+value.toFixed(2)}`;
    return `${fixed} ft`;
  }

  private sanitizeCityNameForKey(name?: string | null): string | null {
    if (!name) return null;
    // remove non-alphanumeric characters and lower-case (matches BoatCityNameNoCaseAlnumOnly intention)
    return name.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  private parseExtraDetails(extraDetails: any): any {
    // Accept a JSON string, array, or object
    if (!extraDetails) return null;
    try {
      if (typeof extraDetails === 'string') {
        const parsed = JSON.parse(extraDetails);
        return parsed;
      }
      return extraDetails;
    } catch {
      // if parse fails, return original string
      return extraDetails;
    }
  }

  private mapEngineToOutput(engine: any) {
    // engine: BoatEngine model { hours, horsepower, make, model, fuelType, propellerType }
    return {
      Make: engine.make ?? null,
      Model: engine.model ?? null,
      DriveTransmissionDescription: null, // unknown in schema
      Fuel: engine.fuelType ?? null,
      EnginePower:
        engine.horsepower != null ? `${engine.horsepower}|horsepower` : null,
      Type: null, // unknown
      PropellerType: engine.propellerType ?? null,
      Year: null, // not present on BoatEngine model
      Hours: engine.hours ?? null,
      BoatEngineLocationCode: null,
    };
  }

  private extractDescriptions(boat: any) {
    const general: string[] = [];
    const additional: string[] = [];

    // Primary description field
    if (boat.description) {
      // split long descriptions into lines if it's multi-line; otherwise keep as single entry
      const lines = String(boat.description)
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      general.push(...lines);
    }

    // extraDetails can be an array of { key, value } or array of strings or an object
    const parsed = this.parseExtraDetails(boat.extraDetails);

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === 'string') {
          // push string items into general if primary description empty else additional
          if (general.length === 0) general.push(item.trim());
          else additional.push(item.trim());
        } else if (item && typeof item === 'object') {
          // If structure is { key, value } or other object, prefer value
          if ('value' in item && item.value)
            additional.push(String(item.value).trim());
          else {
            // convert object to "key: value" lines
            const kv = Object.entries(item)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' — ');
            additional.push(kv);
          }
        }
      }
    } else if (parsed && typeof parsed === 'object') {
      // object -> flatten into additional
      for (const [k, v] of Object.entries(parsed)) {
        additional.push(`${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`);
      }
    } else if (typeof parsed === 'string') {
      additional.push(parsed);
    }

    // dedupe & trim
    const normalize = (arr: string[]) =>
      Array.from(new Set(arr.map((s) => s.replace(/\s+/g, ' ').trim()))).filter(
        Boolean,
      );

    return {
      general: normalize(general),
      additional: normalize(additional),
    };
  }

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats() {
    const boats = await this.prisma.boats.findMany({
      include: {
        engines: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = boats.map((boat) => {
      const mappedEngines = Array.isArray(boat.engines)
        ? boat.engines.map((e) => this.mapEngineToOutput(e))
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
        Price:
          boat.price != null ? `${Number(boat.price).toFixed(2)} USD` : null,
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
        Link: `/boats/${boat.id}`,
      };
    });

    return transformed;
  }
}
