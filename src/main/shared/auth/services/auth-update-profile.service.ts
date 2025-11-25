import { UserResponseDto } from '@/common/dto/user-response.dto';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class AuthUpdateProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly s3: S3Service,
  ) {}

  @HandleError('Failed to update profile', 'User')
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Upload image if provided
    let imageUrl: string | undefined;
    if (file) {
      const uploadResult = await this.s3.uploadFiles([file]);
      if (!uploadResult.success) {
        throw new AppError(500, 'Failed to upload image');
      }

      imageUrl = uploadResult.data.files[0].url;
    }

    // Clean phone number
    const phone = dto.phone?.trim();
    if (phone?.startsWith('+')) {
      dto.phone = phone.slice(1);
    }

    // Check if phone already exists
    if (phone) {
      const existingUser = await this.prisma.client.user.findFirst({
        where: { phone },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(400, 'Phone number already exists');
      }
    }

    // Update user with new data
    const updatedUser = await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim() || user.name,
        avatarUrl: imageUrl || user.avatarUrl,
        phone: dto.phone?.trim() || user.phone,
        country: dto.country?.trim() || user.country,
        city: dto.city?.trim() || user.city,
        state: dto.state?.trim() || user.state,
        zip: dto.zip?.trim() || user.zip,
      },
    });

    return successResponse(
      this.utils.sanitizedResponse(UserResponseDto, updatedUser),
      'Profile updated successfully',
    );
  }
}
