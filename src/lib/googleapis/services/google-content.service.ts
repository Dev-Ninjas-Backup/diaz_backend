import { ENVEnum } from '@/common/enum/env.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { ListingForGmc } from '@/lib/queue/interface/sync-boats-with-gmc.payload';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { content_v2_1 } from 'googleapis';
import { DateTime } from 'luxon';
import { GoogleapisService } from '../googleapis.service';

@Injectable()
export class GoogleContentService {
  private readonly logger = new Logger(GoogleContentService.name);
  private frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleapis: GoogleapisService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>(
      ENVEnum.PRODUCT_DETAILS_BASE_URL,
    );
  }

  // Build a Google Merchant Center product from a listing
  buildGoogleProduct(listing: ListingForGmc): content_v2_1.Schema$Product {
    // Map images to URLs
    const images: string[] = listing.images?.map((img) => img.file.url) || [];

    // Build custom attributes array
    const customAttributes: Array<{ name: string; value: string }> = [];

    // Extra details
    if (listing.extraDetails) {
      try {
        const parsed =
          typeof listing.extraDetails === 'string'
            ? JSON.parse(listing.extraDetails)
            : listing.extraDetails;

        if (parsed && typeof parsed === 'object') {
          for (const [key, value] of Object.entries(parsed)) {
            customAttributes.push({ name: key, value: String(value ?? '') });
          }
        }
      } catch (err) {
        this.logger.warn(
          'Failed to parse listing.extraDetails for custom attributes',
          err,
        );
      }
    }

    // Standard attributes
    if (listing.buildYear != null)
      customAttributes.push({ name: 'year', value: String(listing.buildYear) });
    if (listing.length != null)
      customAttributes.push({ name: 'length', value: String(listing.length) });
    if (listing.beam != null)
      customAttributes.push({ name: 'beam', value: String(listing.beam) });
    if (listing.draft != null)
      customAttributes.push({ name: 'draft', value: String(listing.draft) });
    const engineCount = listing.engines?.length || listing.enginesNumber || 0;
    customAttributes.push({ name: 'engineCount', value: String(engineCount) });

    const product: content_v2_1.Schema$Product = {
      offerId: listing.id,

      // BASIC INFO
      title: listing.name || `Boat ${listing.id}`,
      description: listing.description || 'No description available',

      // LINKS
      link: `${this.frontendUrl}/listing/${listing.id}`,
      imageLink: images[0],
      additionalImageLinks: images.length > 1 ? images.slice(1) : undefined,

      // REQUIRED FOR ALL PRODUCTS
      contentLanguage: 'en',
      targetCountry: 'US',
      channel: 'online',
      availability: 'in stock',
      condition: listing.condition === 'new' ? 'new' : 'used',

      // PRICING
      price: {
        value: String(listing.price ?? 0),
        currency: 'USD',
      },

      // BRAND + CATEGORY (minimum required)
      brand: listing.make || 'Generic',
      googleProductCategory: '870', // Boats (GMC Taxonomy ID)

      // CUSTOM CATEGORY (user-defined)
      productTypes: ['Vehicles > Boats', 'Boats', 'Yachts'],

      // CUSTOM ATTRIBUTES
      customAttributes,
    };

    return product;
  }

  async uploadBoat(listing: ListingForGmc) {
    const product = this.buildGoogleProduct(listing);

    try {
      const res = await this.googleapis.getClient().products.insert({
        merchantId: this.googleapis.getMerchantId(),
        requestBody: product,
      });

      this.logger.log(`Boat uploaded to Google Merchant: ${product.offerId}`);
      return res.data;
    } catch (err) {
      this.logger.error(
        `Failed to upload boat ${product.offerId} to GMC`,
        err.message,
      );
      throw err;
    }
  }

  async getBoatGmcStatus(offerId: string) {
    try {
      const res = await this.googleapis.getClient().products.get({
        merchantId: this.googleapis.getMerchantId(),
        productId: this.getGoogleProductId(offerId),
      });

      return res.data; // includes status, issues, etc.
    } catch (err: any) {
      this.logger.debug(`Boat ${offerId} is not in GMC`, err.message);
    }
  }

  async updateBoatOnGmc(listing: ListingForGmc) {
    // Calculate 24 hours ago
    const since = DateTime.now().minus({ hours: 24 }).toJSDate();

    // Build full product
    const fullProduct = this.buildGoogleProduct(listing);

    // Remove offerId for update
    const {
      offerId,
      targetCountry,
      channel,
      contentLanguage,
      customAttributes,
      ...updatePayload
    } = fullProduct;
    this.logger.debug(
      `Update payload for boat ${channel}:${targetCountry}:${contentLanguage}:${offerId}`,
      customAttributes,
      updatePayload,
    );

    // Example: check each top-level field
    if (listing.updatedAt >= since) {
      this.logger.debug(`Boat ${offerId} was updated in the last 24 hours`);
      return;
    }

    try {
      const res = await this.googleapis.getClient().products.update({
        merchantId: this.googleapis.getMerchantId(),
        productId: this.getGoogleProductId(listing.id),
        requestBody: updatePayload,
      });

      this.logger.log(`Boat updated in Google Merchant: ${listing.id}`);
      return res.data;
    } catch (err) {
      this.logger.error(
        `Failed to update boat ${listing.id} in GMC`,
        err.message,
      );
      throw err;
    }
  }

  @HandleError('Failed to sync boat with GMC')
  async syncBoatWithGmc(listingId: string) {
    const listing = await this.prisma.client.boats.findUniqueOrThrow({
      where: { id: listingId },
      include: { engines: true, images: { include: { file: true } } },
    });

    const offerId = listing.id;
    const gmcProduct = await this.getBoatGmcStatus(offerId);

    let res;
    if (!gmcProduct) {
      // Not uploaded yet → insert
      res = await this.uploadBoat(listing);
    } else {
      // Already uploaded → update
      res = await this.updateBoatOnGmc(listing);
    }

    this.logger.log(`Boat synced with GMC: ${offerId}`, res);

    return res;
  }

  private getGoogleProductId(offerId: string) {
    return `online:en:US:${offerId}`;
  }
}
