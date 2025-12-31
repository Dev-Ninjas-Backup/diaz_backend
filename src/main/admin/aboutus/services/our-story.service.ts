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
import { CreateOurStoryDto } from '../dto/create-our-story.dto';
import { UpdateOurStoryDto } from '../dto/update-our-story.dto';

@Injectable()
export class OurStoryService {
  private readonly logger = new Logger(OurStoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getOurStory(site: SiteType) {
    try {
      const ourStory = await this.prisma.client.ourStory.findUnique({
        where: { site },
        include: {
          image1: true,
          image2: true,
          image3: true,
          image4: true,
          image5: true,
        },
      });

      if (!ourStory) {
        throw new NotFoundException(
          `Our Story content for site ${site} not found`,
        );
      }

      return ourStory;
    } catch (error) {
      this.logger.error('Error getting Our Story:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
        throw new InternalServerErrorException(
          `Database error while retrieving Our Story: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get Our Story content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createOurStory(
    site: SiteType,
    createOurStoryDto: CreateOurStoryDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
      image5?: Express.Multer.File[];
    },
  ) {
    try {
      // Check if Our Story content already exists for this site
      const existing = await this.prisma.client.ourStory.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `Our Story content for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      // Upload images and get their IDs
      const imageIds: {
        image1Id?: string | null;
        image2Id?: string | null;
        image3Id?: string | null;
        image4Id?: string | null;
        image5Id?: string | null;
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

      if (files.image4 && files.image4.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image4[0]]);
        imageIds.image4Id = uploaded.data.files[0].id;
      }

      if (files.image5 && files.image5.length > 0) {
        const uploaded = await this.s3Service.uploadFiles([files.image5[0]]);
        imageIds.image5Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.ourStory.create({
        data: {
          site,
          title: createOurStoryDto.title,
          description: createOurStoryDto.description,
          ...imageIds,
        },
        include: {
          image1: true,
          image2: true,
          image3: true,
          image4: true,
          image5: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating Our Story:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Our Story content for site ${site} already exists. Use PATCH method to update.`,
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
          `Database error while creating Our Story: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Our Story content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateOurStory(
    site: SiteType,
    updateOurStoryDto: UpdateOurStoryDto,
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
      image5?: Express.Multer.File[];
    },
  ) {
    try {
      // Get the existing Our Story record for this site
      const existing = await this.prisma.client.ourStory.findUnique({
        where: { site },
        select: {
          id: true,
          image1Id: true,
          image2Id: true,
          image3Id: true,
          image4Id: true,
          image5Id: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(
          `Our Story content for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        title?: string;
        description?: string;
        image1Id?: string | null;
        image2Id?: string | null;
        image3Id?: string | null;
        image4Id?: string | null;
        image5Id?: string | null;
      } = {};

      if (updateOurStoryDto.title !== undefined) {
        updateData.title = updateOurStoryDto.title;
      }
      if (updateOurStoryDto.description !== undefined) {
        updateData.description = updateOurStoryDto.description;
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

      if (files.image4 && files.image4.length > 0) {
        // Delete old image if exists
        if (existing.image4Id) {
          try {
            await this.s3Service.deleteFiles([existing.image4Id]);
          } catch (error) {
            this.logger.warn(`Failed to delete old image4: ${error}`);
          }
        }
        const uploaded = await this.s3Service.uploadFiles([files.image4[0]]);
        updateData.image4Id = uploaded.data.files[0].id;
      }

      if (files.image5 && files.image5.length > 0) {
        // Delete old image if exists
        if (existing.image5Id) {
          try {
            await this.s3Service.deleteFiles([existing.image5Id]);
          } catch (error) {
            this.logger.warn(`Failed to delete old image5: ${error}`);
          }
        }
        const uploaded = await this.s3Service.uploadFiles([files.image5[0]]);
        updateData.image5Id = uploaded.data.files[0].id;
      }

      const result = await this.prisma.client.ourStory.update({
        where: { site },
        data: updateData,
        include: {
          image1: true,
          image2: true,
          image3: true,
          image4: true,
          image5: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating Our Story:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Our Story content for site ${site} not found. Use POST method to create.`,
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
          `Database error while updating Our Story: ${error.message}`,
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Prisma validation error:', error.message);
        throw new BadRequestException(`Invalid data format: ${error.message}`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update Our Story content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
