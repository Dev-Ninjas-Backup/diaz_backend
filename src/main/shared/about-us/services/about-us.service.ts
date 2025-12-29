import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SiteType } from 'generated/enums';
import { AboutUsResponseDto } from '../dto/about-us-response.dto';

@Injectable()
export class AboutUsService {
  private readonly logger = new Logger(AboutUsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAboutUs(site: SiteType): Promise<TResponse<AboutUsResponseDto>> {
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

      return successResponse(
        aboutUs as AboutUsResponseDto,
        'About Us content retrieved successfully',
      );
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
}
