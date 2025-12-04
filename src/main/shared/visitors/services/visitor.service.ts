import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { differenceInSeconds, startOfMonth, subMonths } from 'date-fns';

@Injectable()
export class VisitorService {
  private activeSessions = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  getActiveCount() {
    return this.activeSessions.size;
  }

  async createSession(clientId: string, ip: string, ua: string, page: string) {
    const session = await this.prisma.client.visitorSession.create({
      data: {
        ip,
        userAgent: ua,
        page,
      },
    });

    this.activeSessions.set(clientId, session.id);

    // Increment page view counter
    await this.incrementPageView(page);

    return session;
  }

  async endSession(clientId: string) {
    const sessionId = this.activeSessions.get(clientId);
    if (!sessionId) return;

    const session = await this.prisma.client.visitorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.endedAt) return;

    const endedAt = new Date();

    const durationSeconds = differenceInSeconds(endedAt, session.startedAt);

    await this.prisma.client.visitorSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        durationSeconds,
      },
    });

    this.activeSessions.delete(clientId);
  }

  async incrementPageView(page: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.client.pageView.findFirst({
      where: {
        page,
        createdAt: { gte: today },
      },
    });

    if (!existing) {
      await this.prisma.client.pageView.create({
        data: { page, count: 1 },
      });
    } else {
      await this.prisma.client.pageView.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
    }
  }

  async getStats() {
    const totalVisitors = await this.prisma.client.visitorSession.count();
    const todayVisitors = await this.getTodayVisitors();

    return {
      active: this.getActiveCount(),
      todayVisitors,
      totalVisitors,
    };
  }

  private async getTodayVisitors() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.client.visitorSession.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  async getAnalyticsOverview() {
    const now = new Date();

    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    const totalVisitors = await this.prisma.client.visitorSession.count();

    const thisMonthVisitors = await this.prisma.client.visitorSession.count({
      where: { createdAt: { gte: thisMonthStart } },
    });

    const lastMonthVisitors = await this.prisma.client.visitorSession.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: thisMonthStart,
        },
      },
    });

    const visitorsGrowth = this.getGrowthRate(
      thisMonthVisitors,
      lastMonthVisitors,
    );

    const thisMonthViews = await this.prisma.client.pageView.aggregate({
      _sum: { count: true },
      where: { createdAt: { gte: thisMonthStart } },
    });

    const lastMonthViews = await this.prisma.client.pageView.aggregate({
      _sum: { count: true },
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: thisMonthStart,
        },
      },
    });

    const pageViewsThis = thisMonthViews._sum.count ?? 0;
    const pageViewsLast = lastMonthViews._sum.count ?? 0;

    const pageViewsGrowth = this.getGrowthRate(pageViewsThis, pageViewsLast);

    const sessions = await this.prisma.client.visitorSession.findMany({
      where: { durationSeconds: { not: null } },
      select: { durationSeconds: true },
    });

    const totalSessionSeconds = sessions.reduce(
      (sum, s) => sum + (s.durationSeconds ?? 0),
      0,
    );

    const avgSessionSeconds =
      sessions.length > 0
        ? Math.round(totalSessionSeconds / sessions.length)
        : 0;

    const avgSessionFormatted = this.formatDuration(avgSessionSeconds);

    const sessionGrowth = 15;

    return {
      totalVisitors: {
        value: totalVisitors,
        growth: visitorsGrowth,
      },

      pageViews: {
        value: pageViewsThis,
        growth: pageViewsGrowth,
      },

      avgSessionTime: {
        value: avgSessionFormatted,
        seconds: avgSessionSeconds,
        growth: sessionGrowth,
      },
    };
  }

  private getGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 100;
    const rate = ((current - previous) / previous) * 100;
    return Number(rate.toFixed(1));
  }

  private formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
