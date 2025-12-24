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
      const specs: Array<{
        key: string;
        value: string | number | null | undefined;
      }> = [];

      const push = (k: string, v: any) =>
        specs.push({
          key: k,
          value: v ?? null,
        });

      push('Make', b?.MakeString ?? b?.Make ?? b?.make);
      push('Model', b?.Model ?? b?.model);
      push('Year', b?.ModelYear ?? b?.buildYear ?? b?.year ?? null);
      push('Condition', b?.SaleClassCode ?? b?.condition ?? null);
      push('Length', b?.NominalLength ?? b?.LengthOverall ?? b?.length ?? null);
      push('Beam', b?.BeamMeasure ?? b?.beam ?? null);
      push('Draft', b?.MaxDraft ?? b?.draft ?? null);
      push('Fuel', b?.Engines?.[0]?.Fuel ?? b?.fuelType ?? null);

      if (Array.isArray(b?.Engines) && b.Engines.length) {
        b.Engines.forEach((e: any, i: number) => {
          const idx = i + 1;
          push(`Engine ${idx} - Make`, e?.Make ?? e?.make ?? null);
          push(`Engine ${idx} - Model`, e?.Model ?? e?.model ?? null);
          const power = e?.EnginePower ?? e?.horsepower ?? null;
          push(`Engine ${idx} - Power`, power);
        });
      }

      // remove duplicates and empty values while keeping order
      const seen = new Set();
      return specs.filter((s) => {
        const key = `${s.key}:${s.value}`;
        if (!s.value) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
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
      images: extractImages(boat),
      aditionalInfo: buildAdditional(boat),
      raw: boat,
    };

    return successResponse(transformed, 'Boat transformed successfully');
  }
}
