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
import { CreateMissionVisionDto } from '../dto/create-mission-vision.dto';
import { UpdateMissionVisionDto } from '../dto/update-mission-vision.dto';

@Injectable()
export class MissionVisionService {
  private readonly logger = new Logger(MissionVisionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getMissionVision(site: SiteType) {
    try {
      const missionVision = await this.prisma.client.missionVision.findUnique({
        where: { site },
        include: {
          image1: true,
          image2: true,
          image3: true,
        },
      });

      if (!missionVision) {
        throw new NotFoundException(
          `Mission & Vision content for site ${site} not found`,
        );
      }

      return missionVision;
    } catch (error) {
      this.logger.error('Error getting Mission & Vision:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
        throw new InternalServerErrorException(
          `Database error while retrieving Mission & Vision: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get Mission & Vision content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createMissionVision(
    site: SiteType,
    createMissionVisionDto: CreateMissionVisionDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ) {
    try {
      // Check if Mission & Vision content already exists for this site
      const existing = await this.prisma.client.missionVision.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `Mission & Vision content for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      // Upload images and get their IDs
      const imageIds: {
        image1Id?: string | null;
        image2Id?: string | null;
        image3Id?: string | null;
      } = {};

      if (files.image1 && files.image1.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image1[0]]);
        imageIds.image1Id = uploaded.data.files[0].id;
      }

      if (files.image2 && files.image2.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image2[0]]);
        imageIds.image2Id = uploaded.data.files[0].id;
      }

      if (files.image3 && files.image3.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image3[0]]);
        imageIds.image3Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.missionVision.create({
        data: {
          site,
          title: createMissionVisionDto.title,
          missionTitle: createMissionVisionDto.missionTitle,
          description: createMissionVisionDto.description,
          visionTitle: createMissionVisionDto.visionTitle,
          visionDescription: createMissionVisionDto.visionDescription,
          ...imageIds,
        },
        include: {
          image1: true,
          image2: true,
          image3: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating Mission & Vision:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Mission & Vision content for site ${site} already exists. Use PATCH method to update.`,
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
          `Database error while creating Mission & Vision: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Mission & Vision content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateMissionVision(
    site: SiteType,
    updateMissionVisionDto: UpdateMissionVisionDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ) {
    try {
      // Get the existing Mission & Vision record for this site
      const existing = await this.prisma.client.missionVision.findUnique({
        where: { site },
        select: {
          id: true,
          image1Id: true,
          image2Id: true,
          image3Id: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(
          `Mission & Vision content for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        title?: string;
        missionTitle?: string;
        description?: string;
        visionTitle?: string;
        visionDescription?: string;
        image1Id?: string | null;
        image2Id?: string | null;
        image3Id?: string | null;
      } = {};

      if (updateMissionVisionDto.title !== undefined) {
        updateData.title = updateMissionVisionDto.title;
      }
      if (updateMissionVisionDto.missionTitle !== undefined) {
        updateData.missionTitle = updateMissionVisionDto.missionTitle;
      }
      if (updateMissionVisionDto.description !== undefined) {
        updateData.description = updateMissionVisionDto.description;
      }
      if (updateMissionVisionDto.visionTitle !== undefined) {
        updateData.visionTitle = updateMissionVisionDto.visionTitle;
      }
      if (updateMissionVisionDto.visionDescription !== undefined) {
        updateData.visionDescription = updateMissionVisionDto.visionDescription;
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

      if (files.image3 && files.image3.length > 0) {
        // Delete old image if exists
        if (existing.image3Id) {
          try {
            await this.s3Service.deleteFiles([existing.image3Id]);
          } catch (error) {
            this.logger.warn(`Failed to delete old image3: ${error}`);
          }
        }
        const uploaded = await this.s3Service.uploadFiles([files.image3[0]]);
        updateData.image3Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.missionVision.update({
        where: { site },
        data: updateData,
        include: {
          image1: true,
          image2: true,
          image3: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating Mission & Vision:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Mission & Vision content for site ${site} not found. Use POST method to create.`,
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
          `Database error while updating Mission & Vision: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update Mission & Vision content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
