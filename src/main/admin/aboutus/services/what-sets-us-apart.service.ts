import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/client';
import { SiteType } from 'generated/enums';
import { CreateWhatSetsUsApartDto } from '../dto/create-what-sets-us-apart.dto';
import { UpdateWhatSetsUsApartDto } from '../dto/update-what-sets-us-apart.dto';

@Injectable()
export class WhatSetsUsApartService {
  private readonly logger = new Logger(WhatSetsUsApartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getWhatSetsUsApart(site: SiteType) {
    try {
      const whatSetsUsApart =
        await this.prisma.client.whatSetsUsApart.findUnique({
          where: { site },
          include: {
            image1: true,
            image2: true,
          },
        });

      if (!whatSetsUsApart) {
        throw new NotFoundException(
          `What Sets Us Apart content for site ${site} not found`,
        );
      }

      return whatSetsUsApart;
    } catch (error) {
      this.logger.error('Error getting What Sets Us Apart:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
        throw new InternalServerErrorException(
          `Database error while retrieving What Sets Us Apart: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get What Sets Us Apart content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createWhatSetsUsApart(
    site: SiteType,
    createWhatSetsUsApartDto: CreateWhatSetsUsApartDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
    },
  ) {
    try {
      // Check if What Sets Us Apart content already exists for this site
      const existing = await this.prisma.client.whatSetsUsApart.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `What Sets Us Apart content for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      // Upload images and get their IDs
      const imageIds: {
        image1Id?: string | null;
        image2Id?: string | null;
      } = {};

      if (files.image1 && files.image1.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image1[0]]);
        imageIds.image1Id = uploaded.data.files[0].id;
      }

      if (files.image2 && files.image2.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image2[0]]);
        imageIds.image2Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.whatSetsUsApart.create({
        data: {
          site,
          title: createWhatSetsUsApartDto.title,
          description: createWhatSetsUsApartDto.description,
          yearsOfYachtingExcellence:
            createWhatSetsUsApartDto.yearsOfYachtingExcellence,
          boatsSoldIn2024: createWhatSetsUsApartDto.boatsSoldIn2024,
          listingsViewedMonthly: createWhatSetsUsApartDto.listingsViewedMonthly,
          ...imageIds,
        },
        include: {
          image1: true,
          image2: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating What Sets Us Apart:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `What Sets Us Apart content for site ${site} already exists. Use PATCH method to update.`,
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'One or more image file IDs do not exist. Please provide valid file IDs.',
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
        throw new InternalServerErrorException(
          `Database error while creating What Sets Us Apart: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create What Sets Us Apart content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateWhatSetsUsApart(
    site: SiteType,
    updateWhatSetsUsApartDto: UpdateWhatSetsUsApartDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
    },
  ) {
    try {
      // Get the existing What Sets Us Apart record for this site
      const existing = await this.prisma.client.whatSetsUsApart.findUnique({
        where: { site },
        select: {
          id: true,
          image1Id: true,
          image2Id: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(
          `What Sets Us Apart content for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        title?: string;
        description?: string;
        yearsOfYachtingExcellence?: string;
        boatsSoldIn2024?: string;
        listingsViewedMonthly?: string;
        image1Id?: string | null;
        image2Id?: string | null;
      } = {};

      if (updateWhatSetsUsApartDto.title !== undefined) {
        updateData.title = updateWhatSetsUsApartDto.title;
      }
      if (updateWhatSetsUsApartDto.description !== undefined) {
        updateData.description = updateWhatSetsUsApartDto.description;
      }
      if (updateWhatSetsUsApartDto.yearsOfYachtingExcellence !== undefined) {
        updateData.yearsOfYachtingExcellence =
          updateWhatSetsUsApartDto.yearsOfYachtingExcellence;
      }
      if (updateWhatSetsUsApartDto.boatsSoldIn2024 !== undefined) {
        updateData.boatsSoldIn2024 = updateWhatSetsUsApartDto.boatsSoldIn2024;
      }
      if (updateWhatSetsUsApartDto.listingsViewedMonthly !== undefined) {
        updateData.listingsViewedMonthly =
          updateWhatSetsUsApartDto.listingsViewedMonthly;
      }

      // Handle image uploads - upload new files and get their IDs
      if (files.image1 && files.image1.length > 0) {
        // Delete old image if exists
        if (existing.image1Id) {
          try {
            await this.s3Service.deleteFiles([existing.image1Id]);
          } catch (error) {
            this.logger.warn(`Failed to delete old image1: ${error}`);
          }
        }
        const uploaded = await this.s3Service.uploadFiles([files.image1[0]]);
        updateData.image1Id = uploaded.data.files[0].id;
      }

      if (files.image2 && files.image2.length > 0) {
        // Delete old image if exists
        if (existing.image2Id) {
          try {
            await this.s3Service.deleteFiles([existing.image2Id]);
          } catch (error) {
            this.logger.warn(`Failed to delete old image2: ${error}`);
          }
        }
        const uploaded = await this.s3Service.uploadFiles([files.image2[0]]);
        updateData.image2Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.whatSetsUsApart.update({
        where: { site },
        data: updateData,
        include: {
          image1: true,
          image2: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating What Sets Us Apart:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `What Sets Us Apart content for site ${site} not found. Use POST method to create.`,
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'One or more image file IDs do not exist. Please provide valid file IDs.',
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
        throw new InternalServerErrorException(
          `Database error while updating What Sets Us Apart: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update What Sets Us Apart content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
