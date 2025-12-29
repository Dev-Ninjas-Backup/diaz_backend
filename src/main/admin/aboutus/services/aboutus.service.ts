import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/client';
import { SiteType } from 'generated/enums';
import { CreateAboutUsDto } from '../dto/create-aboutus.dto';
import { UpdateAboutUsDto } from '../dto/update-aboutus.dto';

@Injectable()
export class AboutUsService {
  private readonly logger = new Logger(AboutUsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAboutUs(site: SiteType) {
    try {
      const aboutUs = await this.prisma.client.aboutPage.findUnique({
        where: { site },
        select: {
          id: true,
          site: true,
          aboutTitle: true,
          aboutDescription: true,
          mission: true,
          vision: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!aboutUs) {
        throw new NotFoundException(
          `About Us content for site ${site} not found`,
        );
      }

      return aboutUs;
    } catch (error) {
      this.logger.error('Error getting About Us:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get About Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createAboutUs(site: SiteType, createAboutUsDto: CreateAboutUsDto) {
    try {
      // Check if About Us content already exists for this site
      const existing = await this.prisma.client.aboutPage.findUnique({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `About Us content for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      const result = await this.prisma.client.aboutPage.create({
        data: {
          site,
          aboutTitle: createAboutUsDto.aboutTitle,
          aboutDescription: createAboutUsDto.aboutDescription,
          mission: createAboutUsDto.mission,
          vision: createAboutUsDto.vision,
        },
        select: {
          id: true,
          site: true,
          aboutTitle: true,
          aboutDescription: true,
          mission: true,
          vision: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating About Us:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `About Us content for site ${site} already exists. Use PATCH method to update.`,
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create About Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateAboutUs(site: SiteType, updateAboutUsDto: UpdateAboutUsDto) {
    try {
      // Get the existing About Us record for this site
      const existing = await this.prisma.client.aboutPage.findUnique({
        where: { site },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException(
          `About Us content for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        aboutTitle?: string;
        aboutDescription?: string;
        mission?: string;
        vision?: string;
      } = {};
      if (updateAboutUsDto.aboutTitle !== undefined) {
        updateData.aboutTitle = updateAboutUsDto.aboutTitle;
      }
      if (updateAboutUsDto.aboutDescription !== undefined) {
        updateData.aboutDescription = updateAboutUsDto.aboutDescription;
      }
      if (updateAboutUsDto.mission !== undefined) {
        updateData.mission = updateAboutUsDto.mission;
      }
      if (updateAboutUsDto.vision !== undefined) {
        updateData.vision = updateAboutUsDto.vision;
      }

      const result = await this.prisma.client.aboutPage.update({
        where: { site },
        data: updateData,
        select: {
          id: true,
          site: true,
          aboutTitle: true,
          aboutDescription: true,
          mission: true,
          vision: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating About Us:', error);

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
          : 'Failed to update About Us content';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
