import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { CreateContactPageDto } from '../dto/create-contactus.dto';
import { UpdateContactPageDto } from '../dto/update-contactus.dto';
import { Prisma } from 'generated/client';
import { SiteType } from 'generated/enums';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getContactUs(site: SiteType) {
    try {
      const contactUs = await this.prisma.client.contactPage.findUnique({
        where: { site },
        select: {
          id: true,
          site: true,
          contactTitle: true,
          contactDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!contactUs) {
        throw new NotFoundException(
          `Contact Us content for site ${site} not found`,
        );
      }

      return contactUs;
    } catch (error) {
      this.logger.error('Error getting Contact Us:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get Contact Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createContactUs(
    site: SiteType,
    createContactPageDto: CreateContactPageDto,
  ) {
    try {
      // Check if Contact Us content already exists for this site
      const existing = await this.prisma.client.contactPage.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `Contact Us content for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      const result = await this.prisma.client.contactPage.create({
        data: {
          site,
          contactTitle: createContactPageDto.contactTitle,
          contactDescription: createContactPageDto.contactDescription,
        },
        select: {
          id: true,
          site: true,
          contactTitle: true,
          contactDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating Contact Us:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Contact Us content for site ${site} already exists. Use PATCH method to update.`,
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Contact Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateContactUs(
    site: SiteType,
    updateContactPageDto: UpdateContactPageDto,
  ) {
    try {
      // Get the existing Contact Us record for this site
      const existing = await this.prisma.client.contactPage.findUnique({
        where: { site },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException(
          `Contact Us content for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        contactTitle?: string;
        contactDescription?: string;
      } = {};
      if (updateContactPageDto.contactTitle !== undefined) {
        updateData.contactTitle = updateContactPageDto.contactTitle;
      }
      if (updateContactPageDto.contactDescription !== undefined) {
        updateData.contactDescription = updateContactPageDto.contactDescription;
      }

      const result = await this.prisma.client.contactPage.update({
        where: { site },
        data: updateData,
        select: {
          id: true,
          site: true,
          contactTitle: true,
          contactDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating Contact Us:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update Contact Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
