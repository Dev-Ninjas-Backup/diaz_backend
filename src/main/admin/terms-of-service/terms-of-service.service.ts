import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  CreateTermsOfServicesDto,
  UpdateTermsOfServicesDto,
} from './dto/tos.dto';
import { SiteType } from 'generated/enums';
import { Prisma } from 'generated/client';

@Injectable()
export class TermsofServicesService {
  private readonly logger = new Logger(TermsofServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTermsOfService(site: SiteType) {
    try {
      const terms = await this.prisma.client.termsOfServices.findUnique({
        where: { site },
        select: {
          id: true,
          site: true,
          termsTitle: true,
          termsDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!terms) {
        throw new NotFoundException(
          `Terms of Service for site ${site} not found`,
        );
      }

      return terms;
    } catch (error) {
      this.logger.error('Error getting Terms of Service:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get Terms of Service';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createTermsOfService(
    site: SiteType,
    createTermsOfServiceDto: CreateTermsOfServicesDto,
  ) {
    try {
      // Check if Terms of Service already exists for this site
      const existing = await this.prisma.client.termsOfServices.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `Terms of Service for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      const result = await this.prisma.client.termsOfServices.create({
        data: {
          site,
          termsTitle: createTermsOfServiceDto.termsTitle,
          termsDescription: createTermsOfServiceDto.termsDescription,
        },
        select: {
          id: true,
          site: true,
          termsTitle: true,
          termsDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating Terms of Service:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Terms of Service for site ${site} already exists. Use PATCH method to update.`,
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Terms of Service';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateTermsOfService(
    site: SiteType,
    updateTermsOfServiceDto: UpdateTermsOfServicesDto,
  ) {
    try {
      // Get the existing Terms of Service for this site
      const existing = await this.prisma.client.termsOfServices.findUnique({
        where: { site },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException(
          `Terms of Service for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        termsTitle?: string;
        termsDescription?: string;
      } = {};
      if (updateTermsOfServiceDto.termsTitle !== undefined) {
        updateData.termsTitle = updateTermsOfServiceDto.termsTitle;
      }
      if (updateTermsOfServiceDto.termsDescription !== undefined) {
        updateData.termsDescription = updateTermsOfServiceDto.termsDescription;
      }

      const result = await this.prisma.client.termsOfServices.update({
        where: { site },
        data: updateData,
        select: {
          id: true,
          site: true,
          termsTitle: true,
          termsDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating Terms of Service:', error);

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
          : 'Failed to update Terms of Service';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
