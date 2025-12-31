import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SiteType } from 'generated/client';

@Injectable()
export class ContactInfoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  @HandleError('Failed to get contact info', 'ContactInfo')
  async getContactInfo(site: SiteType): Promise<TResponse<any>> {
    const contactInfo = await this.prisma.client.contactInfo.findUnique({
      where: { site },
      include: {
        backgroundImage: true,
      },
    });

    if (!contactInfo) {
      return successResponse(
        null,
        'No contact information found for this site',
      );
    }

    return successResponse(
      contactInfo,
      'Contact information retrieved successfully',
    );
  }

  @HandleError('Failed to create contact info', 'ContactInfo')
  async createContactInfo(
    body: any,
    file?: Express.Multer.File,
  ): Promise<TResponse<any>> {
    // Parse body data
    const site = body.site as SiteType;
    const address = body.address;
    const email = body.email;
    const phone = body.phone;

    // Validate required fields
    if (!site || !address || !email || !phone) {
      throw new BadRequestException(
        'Missing required fields: site, address, email, phone',
      );
    }

    // Parse JSON fields
    let workingHours;
    let socialMedia = null;

    try {
      workingHours =
        typeof body.workingHours === 'string'
          ? JSON.parse(body.workingHours)
          : body.workingHours;
    } catch {
      throw new BadRequestException('Invalid workingHours JSON format');
    }

    if (body.socialMedia) {
      try {
        socialMedia =
          typeof body.socialMedia === 'string'
            ? JSON.parse(body.socialMedia)
            : body.socialMedia;
      } catch {
        throw new BadRequestException('Invalid socialMedia JSON format');
      }
    }

    const existing = await this.prisma.client.contactInfo.findUnique({
      where: { site },
    });

    if (existing) {
      throw new BadRequestException(
        'Contact information already exists for this site',
      );
    }

    // Upload file if provided
    let backgroundImageId = null;
    if (file) {
      const uploadedFile = await this.s3Service['uploadFile'](file);
      backgroundImageId = uploadedFile.id;
    }

    const contactInfo = await this.prisma.client.contactInfo.create({
      data: {
        address,
        email,
        phone,
        workingHours: workingHours as any,
        socialMedia: socialMedia as any,
        backgroundImageId,
        site,
      },
      include: {
        backgroundImage: true,
      },
    });

    return successResponse(
      contactInfo,
      'Contact information created successfully',
    );
  }

  @HandleError('Failed to update contact info', 'ContactInfo')
  async updateContactInfo(
    site: SiteType,
    body: any,
    file?: Express.Multer.File,
  ): Promise<TResponse<any>> {
    const existing = await this.prisma.client.contactInfo.findUnique({
      where: { site },
    });

    if (!existing) {
      throw new BadRequestException(
        'Contact information not found for this site',
      );
    }

    const updateData: any = {};

    // Update simple fields
    if (body.address !== undefined) updateData.address = body.address;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;

    // Parse and update JSON fields
    if (body.workingHours !== undefined) {
      try {
        updateData.workingHours =
          typeof body.workingHours === 'string'
            ? JSON.parse(body.workingHours)
            : body.workingHours;
      } catch {
        throw new BadRequestException('Invalid workingHours JSON format');
      }
    }

    if (body.socialMedia !== undefined) {
      try {
        updateData.socialMedia =
          typeof body.socialMedia === 'string'
            ? JSON.parse(body.socialMedia)
            : body.socialMedia;
      } catch {
        throw new BadRequestException('Invalid socialMedia JSON format');
      }
    }

    // Upload new file if provided
    if (file) {
      // Delete old background image if exists
      if (existing.backgroundImageId) {
        await this.s3Service.deleteFiles([existing.backgroundImageId]);
      }

      const uploadedFile = await this.s3Service['uploadFile'](file);
      updateData.backgroundImageId = uploadedFile.id;
    }

    const contactInfo = await this.prisma.client.contactInfo.update({
      where: { site },
      data: updateData,
      include: {
        backgroundImage: true,
      },
    });

    return successResponse(
      contactInfo,
      'Contact information updated successfully',
    );
  }
}
