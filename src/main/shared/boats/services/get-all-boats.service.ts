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

    // Build specifications as { key, value } pairs for consistent consumption
    const buildSpecs = (b: any) => {
      const specs: Array<{ key: string; value: string | number }> = [];

      const push = (k: string, v: any) => {
        if (v === undefined || v === null || v === '' || v === 'null') return;
        specs.push({ key: k, value: v });
      };

      // ---- BASE / COMMON FIELDS ----
      push('Brand Make', b?.MakeString ?? b?.Make ?? b?.make);
      push('Model', b?.Model ?? b?.model);
      push('Built Year', b?.ModelYear ?? b?.buildYear ?? b?.year);
      push('Length', b?.NominalLength ?? b?.LengthOverall ?? b?.length);
      push('Beam Size', b?.BeamMeasure ?? b?.beam);
      push('Max Draft', b?.MaxDraft ?? b?.draft);

      push('Condition', b?.SaleClassCode ?? b?.condition);
      push('Class', b?.BoatClassCode?.[0] ?? b?.Class ?? b?.class);
      push(
        'Material',
        b?.BoatHullMaterialCode ?? b?.HullMaterial ?? b?.material,
      );

      // ---- ENGINES ----
      if (Array.isArray(b?.Engines) && b.Engines.length) {
        push('Number Of Engines', b.Engines.length);

        b.Engines.forEach((e: any, i: number) => {
          const idx = i + 1;
          push(`Engine ${idx} - Make`, e?.Make);
          push(`Engine ${idx} - Model`, e?.Model);
          push(`Engine ${idx} - Fuel Type`, e?.Fuel);
          push(`Engine ${idx} - Power`, e?.EnginePower ?? e?.horsepower);
          push(`Engine ${idx} - Hours`, e?.Hours);
          push(`Engine ${idx} - Type`, e?.Type);
          push(`Engine ${idx} - Propeller Type`, e?.PropellerType);
        });
      }

      // ---- CABINS & HEADS ----
      push('Number Of Cabins', b?.CabinsCountNumeric ?? b?.cabins);
      push('Number Of Heads', b?.HeadsCountNumeric ?? b?.heads);

      // ---- LOCATION ----
      push('City', b?.BoatCityName ?? b?.city);
      push('State', b?.BoatStateCode ?? b?.state);
      push('Country', b?.BoatCountryID ?? b?.country);

      if (b?.Office) {
        push('Office City', b.Office.City);
        push('Office Address', b.Office.PostalAddress);
        push('Office State', b.Office.State);
        push('Office Country', b.Office.Country);
      }

      // ---- NAME / TITLE ----
      push('Name', b?.BoatName ?? b?.name);
      push('Listing Title', b?.ListingTitle);

      // ---- PRICE ----
      push('Price', b?.Price ?? b?.OriginalPrice ?? b?.NormPrice);

      // ---- ADDITIONAL OPTIONAL FIELDS ----
      push('Fuel Type', b?.fuelType ?? b?.Engines?.[0]?.Fuel);
      push('Drive Type', b?.DriveTypeCode);
      push('Hull ID Exists', b?.HasBoatHullID ? 'Yes' : undefined);
      push('Co-Op Indicator', b?.CoOpIndicator ? 'Yes' : undefined);
      push('Sales Status', b?.SalesStatus);

      push('Builder Name', b?.BuilderName);
      push('Total Engine Power', b?.TotalEnginePowerQuantity);
      push('Nominal Length', b?.NominalLength);
      push('Length Overall', b?.LengthOverall);

      push('Boat Class Code', b?.BoatClassCode?.join(', '));

      // ---- DIMENSIONS ----
      push('Norm Nominal Length', b?.NormNominalLength);

      // ---- TIMESTAMPS ----
      push('Last Modified', b?.LastModificationDate);
      push('Item Received Date', b?.ItemReceivedDate);
      push('IMT Timestamp', b?.IMTTimeStamp);

      // ---- REMOVE DUPLICATES ----
      const seen = new Set();
      return specs.filter((s) => {
        const key = `${s.key}:${s.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Build frontend-required detailed specifications
    const buildDetailedSpecs = (b: any) => {
      const get = (...keys: string[]) => {
        for (const k of keys) {
          if (b?.[k] !== undefined && b?.[k] !== null && b?.[k] !== '') {
            return b[k];
          }
        }
        return null;
      };

      const numberOfEngines = Array.isArray(b?.Engines)
        ? b.Engines.length
        : (b?.numberOfEngines ?? null);

      const location =
        b?.Location ??
        (b?.Office
          ? [b.Office.City, b.Office.StateProv, b.Office.Country]
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
        class: get('BoatClassCode', 'Class', 'class'),
        material: get('HullMaterial', 'material'),
        numberOfCabins: get('Cabins', 'cabinCount', 'numberOfCabins'),
        numberOfHeads: get('Heads', 'bathrooms', 'numberOfHeads'),
        beamSize: get('BeamMeasure', 'beam', 'Beam'),
        fuelType: get('FuelType', 'fuelType') ?? b?.Engines?.[0]?.Fuel ?? null,
        maxDraft: get('MaxDraft', 'draft'),
        boatName: get('BoatName', 'name'),
        location,
        condition: get('SaleClassCode', 'condition'),
        price:
          get('Price', 'OriginalPrice') ??
          (b?.NormPrice != null ? `${b.NormPrice}` : null),
      };
    };

    // Additional info (descriptions + office/contact + external links)
    const buildAdditional = (b: any) => {
      const out: Array<{ key: string; value: string | null }> = [];

      // Combined description fields
      const descriptionParts: string[] = [];
      if (Array.isArray(b?.GeneralBoatDescription)) {
        descriptionParts.push(...b.GeneralBoatDescription);
      }
      if (Array.isArray(b?.AdditionalDetailDescription)) {
        descriptionParts.push(...b.AdditionalDetailDescription);
      }
      if (b?.description && typeof b.description === 'string') {
        descriptionParts.push(b.description);
      }

      out.push({
        key: 'description',
        value: descriptionParts.length ? descriptionParts.join('\n') : null,
      });

      // Office / contact
      if (b?.Office) {
        if (b.Office.Email) {
          out.push({
            key: 'email',
            value: b.Office.Email,
          });
        }
        if (b.Office.Phone) {
          out.push({
            key: 'phone',
            value: b.Office.Phone,
          });
        }
        if (b.Office.City) {
          out.push({
            key: 'city',
            value: b.Office.City,
          });
        }
        if (b.Office.PostalAddress) {
          out.push({
            key: 'address',
            value: b.Office.PostalAddress,
          });
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

      return out.filter(Boolean);
    };

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

      specifications: buildSpecs(boat),
      detailedSpecs: buildDetailedSpecs(boat),

      images: extractImages(boat),
      aditionalInfo: buildAdditional(boat),
      raw: boat,
    };

    return successResponse(transformed, 'Boat transformed successfully');
  }
}
