import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  TPaginatedResponse,
  TResponse,
  successResponse,
} from '@/common/utils/response.util';
import { BoatFromBoatsGroup } from '@/lib/boatsgroup/interface/boats.interface';
import { BoatsGroupService } from '@/lib/boatsgroup/services/boats-group.service';
import { GetAllCustomBoatsService } from '@/lib/boatsgroup/services/get-all-custom-boats.service';
import { Injectable, Logger } from '@nestjs/common';
import { GetBoatsDto, GetSingleBoatDto } from '../dto/get-boats.dto';

@Injectable()
export class GetAllBoatsService {
  private readonly logger = new Logger(GetAllBoatsService.name);

  constructor(
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
    private readonly boatsGroupService: BoatsGroupService,
  ) {}

  @HandleError('Failed to get boats')
  async getBoats(
    query: GetBoatsDto,
  ): Promise<
    TPaginatedResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>
  > {
    const { source, page = 1, limit = 50, fields } = query;

    switch (source) {
      case BoatsSourceEnum.inventory:
        return this.boatsGroupService.getInventoryBoats(page, limit, fields);

      case BoatsSourceEnum.service:
        return this.boatsGroupService.getServiceBoats(page, limit, fields);

      case BoatsSourceEnum.custom:
        return this.getAllCustomBoatsService.getAllBoats({
          page,
          limit,
          fields,
        });

      default:
        this.logger.warn(
          `Unknown boats source "${source}". Falling back to database source.`,
        );
        return this.getAllCustomBoatsService.getAllBoats({
          page,
          limit,
          fields,
        });
    }
  }

  @HandleError('Failed to get single boat')
  async getSingleBoat(
    boatId: string,
    query: GetSingleBoatDto,
  ): Promise<TResponse<BoatFromBoatsGroup & { Source: BoatsSourceEnum }>> {
    switch (query.source) {
      case BoatsSourceEnum.inventory:
        return await this.boatsGroupService.getSingleInventoryBoat(
          boatId,
          query.fields,
        );

      case BoatsSourceEnum.service:
        return await this.boatsGroupService.getSingleServiceBoat(
          boatId,
          query.fields,
        );

      case BoatsSourceEnum.custom:
        return await this.getAllCustomBoatsService.getSingleBoat(boatId);

      default:
        this.logger.warn(
          `Unknown boats source "${query.source}". Falling back to database source.`,
        );
        return await this.getAllCustomBoatsService.getSingleBoat(
          boatId,
          query.fields,
        );
    }
  }

  @HandleError('Failed to get single boat')
  async getSingleBoatTransform(boatId: string, query: GetSingleBoatDto) {
    this.logger.log('getSingleBoatTransform', { boatId, query });

    // fetch the raw boat object depending on the source
    let resp: TResponse<any>;

    switch (query.source) {
      case BoatsSourceEnum.inventory:
        resp = await this.boatsGroupService.getSingleInventoryBoat(
          boatId,
          query.fields,
        );
        break;

      case BoatsSourceEnum.service:
        resp = await this.boatsGroupService.getSingleServiceBoat(
          boatId,
          query.fields,
        );
        break;

      case BoatsSourceEnum.custom:
        resp = await this.getAllCustomBoatsService.getSingleBoat(
          boatId,
          query.fields,
        );
        break;

      default:
        this.logger.warn(
          `Unknown boats source "${query.source}". Falling back to database source for transform.`,
        );
        resp = await this.getAllCustomBoatsService.getSingleBoat(
          boatId,
          query.fields,
        );
    }

    const boat = resp?.data ?? resp;

    // Normalize images to { uri, priority, caption?, lastModified? }
    const extractImages = (b: any) => {
      const out: Array<{
        uri: string | null;
        priority?: number;
        caption?: string;
        lastModified?: string;
      }> = [];

      // boats-group formatted images (Uri)
      if (Array.isArray(b?.Images)) {
        for (const img of b.Images) {
          if (!img) continue;
          out.push({
            uri: img.Uri ?? img.uri ?? null,
            priority: img.Priority ?? undefined,
            caption: img.Caption ?? undefined,
            lastModified: img.LastModifiedDateTime ?? undefined,
          });
        }
      }

      // custom DB formatted images (coverImages/galleryImages with url)
      if (Array.isArray(b?.coverImages) || Array.isArray(b?.galleryImages)) {
        const arr = [...(b?.coverImages ?? []), ...(b?.galleryImages ?? [])];
        for (const img of arr) {
          out.push({
            uri: img?.url ?? null,
            lastModified: img?.updatedAt ?? img?.createdAt ?? undefined,
          });
        }
      }

      // fallback: if object with Uri
      if (
        !out.length &&
        b?.Images &&
        typeof b.Images === 'object' &&
        b.Images.Uri
      ) {
        out.push({
          uri: b.Images.Uri,
        });
      }

      return out;
    };

    // Extract engines as a normalized array (separated from specifications)
    const extractEngines = (b: any) => {
      const out: Array<{
        make?: string | null;
        model?: string | null;
        fuelType?: string | null;
        power?: string | number | null;
        hours?: string | number | null;
        type?: string | null;
        propellerType?: string | null;
      }> = [];

      if (Array.isArray(b?.Engines) && b.Engines.length) {
        for (const e of b.Engines) {
          out.push({
            make: e?.Make ?? e?.make ?? null,
            // model: e?.Model ?? e?.model ?? null,
            fuelType: e?.Fuel ?? e?.fuel ?? null,
            power: e?.EnginePower ?? e?.horsepower ?? null,
            hours: e?.Hours ?? e?.hours ?? null,
            type: e?.Type ?? e?.type ?? null,
            // propellerType: e?.PropellerType ?? e?.propellerType ?? null,
          });
        }
      }

      // fallback for single object engine
      if (!out.length && b?.Engine && typeof b.Engine === 'object') {
        const e = b.Engine;
        out.push({
          make: e?.Make ?? e?.make ?? null,
          // model: e?.Model ?? e?.model ?? null,
          fuelType: e?.Fuel ?? e?.fuel ?? null,
          power: e?.EnginePower ?? e?.horsepower ?? null,
          hours: e?.Hours ?? e?.hours ?? null,
          type: e?.Type ?? e?.type ?? null,
          // propellerType: e?.PropellerType ?? e?.propellerType ?? null,
        });
      }

      return out;
    };

    // Only expose 12 primary specifications in `specifications`.
    // Any other fields are pushed into `additionalInfo`.
    const PRIMARY_SPECS: Array<{ key: string; getter: (b: any) => any }> = [
      {
        key: 'Brand Make',
        getter: (b: any) => b?.MakeString ?? b?.Make ?? b?.make,
      },
      { key: 'Model', getter: (b: any) => b?.Model ?? b?.model },
      {
        key: 'Built Year',
        getter: (b: any) => b?.ModelYear ?? b?.buildYear ?? b?.year,
      },
      {
        key: 'Length',
        getter: (b: any) => b?.NominalLength ?? b?.LengthOverall ?? b?.length,
      },
      { key: 'Beam Size', getter: (b: any) => b?.BeamMeasure ?? b?.beam },
      { key: 'Max Draft', getter: (b: any) => b?.MaxDraft ?? b?.draft },
      {
        key: 'Condition',
        getter: (b: any) => b?.SaleClassCode ?? b?.condition,
      },
      {
        key: 'Material',
        getter: (b: any) =>
          b?.BoatHullMaterialCode ?? b?.HullMaterial ?? b?.material,
      },
      {
        key: 'Builder Name',
        getter: (b: any) =>
          b?.BuilderName ?? b?.Builder?.Name ?? b?.builderName,
      },
      {
        key: 'Number Of Engines',
        getter: (b: any) =>
          Array.isArray(b?.Engines)
            ? b.Engines.length
            : (b?.numberOfEngines ?? null),
      },
      {
        key: 'Number Of Cabins',
        getter: (b: any) => b?.CabinsCountNumeric ?? b?.cabins,
      },
      {
        key: 'Price',
        getter: (b: any) =>
          b?.Price ??
          b?.OriginalPrice ??
          (b?.NormPrice != null ? `${b.NormPrice}` : null),
      },
    ];

    const buildSpecs = (b: any) => {
      const specs: Array<{ key: string; value: string | number }> = [];

      for (const spec of PRIMARY_SPECS) {
        const v = spec.getter(b);
        if (v === undefined || v === null || v === '' || v === 'null') continue;
        specs.push({ key: spec.key, value: v });
      }

      // remove duplicates
      const seen = new Set();
      return specs.filter((s) => {
        const key = `${s.key}:${s.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Build frontend-required detailed specifications
    const buildDetailedSpecs = (b: any, enginesArr: any[]) => {
      const get = (...keys: string[]) => {
        for (const k of keys) {
          if (b?.[k] !== undefined && b?.[k] !== null && b?.[k] !== '') {
            return b[k];
          }
        }
        return null;
      };

      const numberOfEngines = enginesArr.length || (b?.numberOfEngines ?? null);

      const location =
        b?.Location ??
        (b?.Office
          ? [
              b.Office.City,
              b.Office.StateProv ?? b.Office.State,
              b.Office.Country,
            ]
              .filter(Boolean)
              .join(', ')
          : null);

      return {
        brandMake: get('MakeString', 'Make', 'make', 'manufacturer'),
        model: get('Model', 'model'),
        builtYear: get('ModelYear', 'buildYear', 'year'),
        length:
          get('NominalLength', 'LengthOverall', 'length') ??
          (b?.Specs?.length ? `${b.Specs.length}` : null),
        numberOfEngines,
        engines: enginesArr,
        class: get('BoatClassCode', 'Class', 'class'),
        material: get('HullMaterial', 'material'),
        numberOfCabins: get('Cabins', 'cabinCount', 'numberOfCabins'),
        numberOfHeads: get('Heads', 'bathrooms', 'numberOfHeads'),
        beamSize: get('BeamMeasure', 'beam', 'Beam'),
        fuelType:
          get('FuelType', 'fuelType') ?? enginesArr[0]?.fuelType ?? null,
        maxDraft: get('MaxDraft', 'draft'),
        boatName: get('BoatName', 'name'),
        location,
        condition: get('SaleClassCode', 'condition'),
        price:
          get('Price', 'OriginalPrice') ??
          (b?.NormPrice != null ? `${b.NormPrice}` : null),
      };
    };

    // Build description
    const extractDescription = (b: any) => {
      const descriptionParts: string[] = [];

      if (Array.isArray(b?.GeneralBoatDescription)) {
        descriptionParts.push(...b.GeneralBoatDescription);
      }

      if (Array.isArray(b?.AdditionalDetailDescription)) {
        descriptionParts.push(...b.AdditionalDetailDescription);
      }

      if (typeof b?.description === 'string') {
        descriptionParts.push(b.description);
      }

      return descriptionParts.length ? descriptionParts.join('\n') : null;
    };

    // Extract location as separate fields
    const extractLocation = (b: any) => {
      const locationParts: string[] = [];

      if (b?.Location) {
        locationParts.push(b.Location);
      } else if (b?.Office) {
        const city = b.Office.City;
        const state = b.Office.StateProv ?? b.Office.State;
        const country = b.Office.Country;

        if (city) locationParts.push(city);
        if (state) locationParts.push(state);
        if (country) locationParts.push(country);
      }

      return locationParts.length ? locationParts.join(', ') : null;
    };

    // Additional info (descriptions + office/contact + external links + leftover fields)
    const buildAdditional = (b: any, enginesArr: any[]) => {
      const out: Array<{ key: string; value: string | null }> = [];

      // Office / contact
      if (b?.Office) {
        if (b.Office.Email) {
          out.push({ key: 'email', value: b.Office.Email });
        }
        if (b.Office.Phone) {
          out.push({ key: 'phone', value: b.Office.Phone });
        }
        if (b.Office.City) {
          out.push({ key: 'city', value: b.Office.City });
        }
        if (b.Office.PostalAddress) {
          out.push({ key: 'address', value: b.Office.PostalAddress });
        }
        if (b.Office.State) {
          out.push({ key: 'office_state', value: b.Office.State });
        }
        if (b.Office.Country) {
          out.push({ key: 'office_country', value: b.Office.Country });
        }
      }

      // external links
      if (Array.isArray(b?.ExternalLink)) {
        for (const link of b.ExternalLink) {
          if (link?.Uri) {
            out.push({
              key: `external:${link?.Type ?? 'link'}`,
              value: link.Uri,
            });
          }
        }
      }

      // common fallback fields that are useful but not in the 12 primary specs
      const fallbackFields: Array<{ key: string; val: any }> = [
        { key: 'Total Engine Power', val: b?.TotalEnginePowerQuantity },
        { key: 'Nominal Length', val: b?.NominalLength },
        { key: 'Length Overall', val: b?.LengthOverall },
        {
          key: 'Boat Class Code',
          val: Array.isArray(b?.BoatClassCode)
            ? b.BoatClassCode.join(', ')
            : b?.BoatClassCode,
        },
        { key: 'Norm Nominal Length', val: b?.NormNominalLength },
        { key: 'Last Modified', val: b?.LastModificationDate },
        { key: 'Item Received Date', val: b?.ItemReceivedDate },
        { key: 'IMT Timestamp', val: b?.IMTTimeStamp },
      ];

      for (const f of fallbackFields) {
        if (f.val !== undefined && f.val !== null && f.val !== '') {
          out.push({ key: f.key, value: f.val });
        }
      }

      // Engines summary if present (kept in additional info too for easy display)
      if (enginesArr.length) {
        // out.push({ key: 'engines_summary', value: JSON.stringify(enginesArr) });
        this.logger.log(`engines_summary: ${JSON.stringify(enginesArr)}`);
      }

      // as a last resort, include any raw fields that might be useful but weren't captured above
      const extraCandidates = [
        'DriveTypeCode',
        'HasBoatHullID',
        'CoOpIndicator',
        'SalesStatus',
        'Specs',
        'Features',
      ];

      for (const k of extraCandidates) {
        if (b?.[k] !== undefined && b?.[k] !== null && b?.[k] !== '') {
          out.push({
            key: k,
            value: typeof b[k] === 'object' ? JSON.stringify(b[k]) : b[k],
          });
        }
      }

      return out.filter(Boolean);
    };

    const enginesArr = extractEngines(boat);
    const specifications = buildSpecs(boat);
    const detailedSpecs = buildDetailedSpecs(boat, enginesArr);
    this.logger.log(`detailedSpecs: ${JSON.stringify(detailedSpecs)}`);
    const additional = buildAdditional(boat, enginesArr);
    const description = extractDescription(boat);
    const location = extractLocation(boat);

    const transformed = {
      id:
        boat?.DocumentID ??
        boat?.DocumentId ??
        boat?.id ??
        boat?.listingId ??
        null,

      title:
        boat?.ListingTitle ??
        boat?.BoatName ??
        boat?.listingTitle ??
        boat?.name ??
        null,

      price:
        boat?.Price ??
        boat?.OriginalPrice ??
        (boat?.NormPrice != null ? `${boat.NormPrice}` : null),

      source: boat?.Source ?? query.source ?? null,

      // only 12 primary specifications here
      specifications,
      // detailedSpecs,

      description,

      location,

      images: extractImages(boat),
      engines: enginesArr, // engines provided separately
      additionalInfo: additional,
      // raw: boat,
    };

    return successResponse(transformed, 'Boat transformed successfully');
  }
}
