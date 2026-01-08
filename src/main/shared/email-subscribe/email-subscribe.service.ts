import { TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteType } from 'generated/client';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import { UnsubscribeEmailDto } from './dto/unsubscribe-email.dto';

@Injectable()
export class EmailSubscribeService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeEmailDto): Promise<TResponse<any>> {
    const site = dto.site || SiteType.FLORIDA;

    // Check if already subscribed
    const existing = await this.prisma.client.emailSubscription.findUnique({
      where: {
        email_site: {
          email: dto.email,
          site: site,
        },
      },
    });

    if (existing) {
      // If already subscribed and active
      if (existing.isActive) {
        throw new ConflictException(
          `Email ${dto.email} is already subscribed to ${site} newsletter`,
        );
      }

      // Reactivate if previously unsubscribed
      const reactivated = await this.prisma.client.emailSubscription.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      });

      return {
        success: true,
        message: 'Successfully resubscribed to newsletter',
        data: reactivated,
      };
    }

    // Create new subscription
    const subscription = await this.prisma.client.emailSubscription.create({
      data: {
        email: dto.email,
        site: site,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: subscription,
    };
  }

  async unsubscribe(dto: UnsubscribeEmailDto): Promise<TResponse<any>> {
    const existing = await this.prisma.client.emailSubscription.findUnique({
      where: {
        email_site: {
          email: dto.email,
          site: dto.site,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Subscription not found for ${dto.email} on ${dto.site} site`,
      );
    }

    if (!existing.isActive) {
      throw new ConflictException(
        `Email ${dto.email} is already unsubscribed from ${dto.site} newsletter`,
      );
    }

    const unsubscribed = await this.prisma.client.emailSubscription.update({
      where: { id: existing.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: unsubscribed,
    };
  }

  async getSubscriptions(site?: SiteType): Promise<TResponse<any>> {
    const where: any = {};

    if (site) {
      where.site = site;
    }

    const subscriptions = await this.prisma.client.emailSubscription.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
    });

    return {
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
    };
  }

  async getActiveSubscriptions(site?: SiteType): Promise<TResponse<any>> {
    const where: any = { isActive: true };

    if (site) {
      where.site = site;
    }

    const subscriptions = await this.prisma.client.emailSubscription.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
    });

    return {
      success: true,
      message: 'Active subscriptions retrieved successfully',
      data: subscriptions,
    };
  }
}
