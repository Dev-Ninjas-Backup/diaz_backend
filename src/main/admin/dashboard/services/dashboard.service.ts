import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BoatListingStatus, UserRole } from 'generated/client';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const now = new Date();

    const [totalYachtsListed, totalPendingApprovals, totalVerifiedSellers] =
      await Promise.all([
        this.prisma.client.boats.count(),
        this.prisma.client.boats.count({
          where: { status: BoatListingStatus.PENDING },
        }),
        this.prisma.client.user.count({
          where: { role: UserRole.SELLER, isVerified: true },
        }),
      ]);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [currentMonthYachts, previousMonthYachts] = await Promise.all([
      this.prisma.client.boats.count({
        where: { createdAt: { gte: startOfThisMonth, lt: startOfNextMonth } },
      }),
      this.prisma.client.boats.count({
        where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
      }),
    ]);

    const totalYachtsListedChangePercent =
      previousMonthYachts === 0
        ? null
        : Math.round(
            ((currentMonthYachts - previousMonthYachts) / previousMonthYachts) *
              100,
          );

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newVerifiedSellersThisWeek = await this.prisma.client.user.count({
      where: {
        role: UserRole.SELLER,
        isVerified: true,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const recentKeys = [
      {
        key: 'boats',
        clientKey: 'boats',
        select: { id: true, listingId: true, name: true, createdAt: true },
      },
      {
        key: 'user',
        clientKey: 'user',
        select: { id: true, email: true, role: true, createdAt: true },
      },
      {
        key: 'floridaLead',
        clientKey: 'floridaLead',
        select: { id: true, name: true, email: true, createdAt: true },
      },
      {
        key: 'invoice',
        clientKey: 'invoice',
        select: {
          id: true,
          stripeInvoiceId: true,
          amount: true,
          createdAt: true,
        },
      },
      {
        key: 'pageBanner',
        clientKey: 'pageBanner',
        select: { id: true, page: true, site: true, createdAt: true },
      },
      {
        key: 'blog',
        clientKey: 'blog',
        select: { id: true, title: true, createdAt: true },
      },
      {
        key: 'fileInstance',
        clientKey: 'fileInstance',
        select: { id: true, filename: true, createdAt: true },
      },
      {
        key: 'boatImage',
        clientKey: 'boatImage',
        select: { id: true, boatId: true, fileId: true, createdAt: true },
      },
    ];

    const recentActivityResults = await Promise.all(
      recentKeys.map(async (rk) => {
        try {
          const record = await (this.prisma.client as any)[
            rk.clientKey
          ].findFirst({
            orderBy: { createdAt: 'desc' },
            select: rk.select,
          });
          return { key: rk.key, record };
        } catch {
          return { key: rk.key, record: null };
        }
      }),
    );

    const recentActivity: Record<string, any> = {};
    for (const r of recentActivityResults) recentActivity[r.key] = r.record;

    return {
      totalYachtsListed,
      totalPendingApprovals,
      totalVerifiedSellers,
      totalYachtsListedChangePercent,
      newVerifiedSellersThisWeek,
      recentActivity,
    };
  }
}
