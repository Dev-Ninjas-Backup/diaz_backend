import { PaginationDto } from '@/common/dto/pagination.dto';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError("Can't get user profile")
  async getOwnNotification(
    userId: string,
    pg: PaginationDto,
  ): Promise<TResponse<any>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;

    const skip = (page - 1) * limit;

    const notification = await this.prisma.client.userNotification.findMany({
      where: {
        userId,
      },
      include: {
        notification: true,
      },
      orderBy: [
        { read: 'asc' }, // unread first
        { createdAt: 'desc' }, // newest first
      ],
      take: limit,
      skip,
    });

    return successResponse(notification, 'Notification fetched successfully');
  }

  @HandleError('Failed to mark as read')
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<TResponse<any>> {
    const updated = await this.prisma.client.userNotification.update({
      where: { userId_notificationId: { userId, notificationId } },
      data: { read: true },
    });
    return successResponse(updated, 'Notification marked as read');
  }

  @HandleError('Failed to mark notifications')
  async markAllAsRead(userId: string): Promise<TResponse<any>> {
    await this.prisma.client.userNotification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return successResponse(null, 'All notifications marked as read');
  }
}
