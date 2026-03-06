import { HandleError } from '@/common/error/handle-error.decorator';
import { TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SiteType } from 'generated/client';
import { CreateOurTeamDto } from './dto/create-our-team.dto';
import { UpdateOurTeamDto } from './dto/update-our-team.dto';

@Injectable()
export class OurTeamService {
  private readonly logger = new Logger(OurTeamService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /** CREATE TEAM MEMBER */
  @HandleError('Failed to create team member', 'Our Team')
  async create(
    dto: CreateOurTeamDto,
    file?: Express.Multer.File,
  ): Promise<TResponse<any>> {
    try {
      let uploadedFileId: string | null = null;

      if (file) {
        try {
          const uploadResult = await this.s3.uploadFiles([file]);
          uploadedFileId = uploadResult.data.files[0].id;
          this.logger.log(`File uploaded successfully: ${uploadedFileId}`);
        } catch (error) {
          this.logger.error(
            `Failed to upload file: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }

      try {
        const teamMember = await this.prisma.client.ourTeam.create({
          data: {
            name: dto.name,
            designation: dto.designation,
            bio: dto.bio || undefined,
            site: dto.site || SiteType.FLORIDA,
            imageId: uploadedFileId,
          },
          include: {
            image: true,
          },
        });

        this.logger.log(
          `Team member created successfully: ${teamMember.id} - ${teamMember.name}`,
        );

        return {
          success: true,
          message: 'Team member created successfully',
          data: teamMember,
        };
      } catch (error) {
        this.logger.error(
          `Failed to create team member: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to create team member: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /** GET ALL TEAM MEMBERS */
  @HandleError('Failed to get all team members', 'Our Team')
  async findAll(site?: SiteType): Promise<TResponse<any>> {
    const siteType = site || SiteType.FLORIDA;

    try {
      const teamMembers = await this.prisma.client.ourTeam.findMany({
        where: { isActive: true, site: siteType },
        include: {
          image: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      this.logger.log(`Retrieved ${teamMembers.length} team members`);

      return {
        success: true,
        message: 'Team members retrieved successfully',
        data: teamMembers,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get all team members: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /** GET SINGLE TEAM MEMBER */
  @HandleError('Failed to get team member', 'Our Team')
  async findOne(id: string): Promise<TResponse<any>> {
    try {
      const teamMember = await this.prisma.client.ourTeam.findUnique({
        where: { id },
        include: {
          image: true,
        },
      });

      if (!teamMember) {
        this.logger.warn(`Team member not found: ${id}`);
        throw new NotFoundException('Team member not found');
      }

      this.logger.log(`Retrieved team member: ${id}`);

      return {
        success: true,
        message: 'Team member retrieved successfully',
        data: teamMember,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get team member: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /** UPDATE TEAM MEMBER */
  @HandleError('Failed to update team member', 'Our Team')
  async update(
    id: string,
    dto: UpdateOurTeamDto,
    file?: Express.Multer.File,
  ): Promise<TResponse<any>> {
    try {
      const existing = await this.prisma.client.ourTeam.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Team member not found');
      }

      let uploadedFileId: string | null = existing.imageId;

      if (file) {
        try {
          // Delete old image if exists
          if (existing.imageId) {
            await this.s3.deleteFiles([existing.imageId]);
            this.logger.log(`Old file deleted: ${existing.imageId}`);
          }

          // Upload new image
          const uploadResult = await this.s3.uploadFiles([file]);
          uploadedFileId = uploadResult.data.files[0].id;
          this.logger.log(
            `File uploaded successfully for update: ${uploadedFileId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to upload file for update: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }

      try {
        const teamMember = await this.prisma.client.ourTeam.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            designation: dto.designation ?? undefined,
            bio: dto.bio ?? undefined,
            site: dto.site ?? undefined,
            imageId: uploadedFileId ?? undefined,
            isActive: dto.isActive ?? undefined,
          },
          include: {
            image: true,
          },
        });

        this.logger.log(`Team member updated successfully: ${id}`);

        return {
          success: true,
          message: 'Team member updated successfully',
          data: teamMember,
        };
      } catch (error) {
        this.logger.error(
          `Failed to update team member: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to update team member: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /** DELETE TEAM MEMBER */
  @HandleError('Failed to delete team member', 'Our Team')
  async remove(id: string): Promise<TResponse<any>> {
    try {
      const existing = await this.prisma.client.ourTeam.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Team member not found');
      }

      try {
        // Delete image if exists
        if (existing.imageId) {
          await this.s3.deleteFiles([existing.imageId]);
          this.logger.log(`Image deleted: ${existing.imageId}`);
        }

        await this.prisma.client.ourTeam.delete({
          where: { id },
        });

        this.logger.log(`Team member deleted successfully: ${id}`);

        return {
          success: true,
          message: 'Team member deleted successfully',
          data: null,
        };
      } catch (error) {
        this.logger.error(
          `Failed to delete team member: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove team member: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
