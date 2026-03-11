import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateSellerDto } from './dto/seller.dto';

interface GetSellersQuery {
  page: number;
  limit: number;
  search?: string;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class SellerManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSellers(query: GetSellersQuery) {
    const { page, limit, search, isVerified, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: 'SELLER',
      status: 'ACTIVE',
      boats: {
        some: {
          status: {
            not: 'INACTIVE',
          },
        },
      },
    };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add isVerified filter
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Get total count
    const total = await this.prisma.client.user.count({ where });

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      if (sortBy === 'name') {
        orderBy = { name: sortOrder || 'asc' };
      } else if (sortBy === 'createdAt') {
        orderBy = { createdAt: sortOrder || 'desc' };
      }
      // Note: boatsCount and totalSalesValue sorting will be done in-memory
    }

    const sellerBoatStats = await this.prisma.client.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,

        _count: {
          select: {
            boats: {
              where: {
                status: {
                  not: 'INACTIVE',
                },
              },
            },
          },
        },

        boats: {
          select: {
            price: true,
          },
          where: {
            status: {
              in: ['SOLD'],
            },
          },
        },
      },
      orderBy,
    });

    // Transform to clean output
    const result = sellerBoatStats.map((seller) => {
      const totalSalesValue = seller.boats.reduce(
        (sum, boat) => sum + boat.price,
        0,
      );

      return {
        sellerId: seller.id,
        name: seller.name,
        email: seller.email,
        username: seller.username,
        avatarUrl: seller.avatarUrl,
        isVerified: seller.isVerified,
        boatsCount: seller._count.boats,
        totalSalesValue: Number(totalSalesValue.toFixed(2)),
        createdAt: seller.createdAt,
      };
    });

    // Sort by boatsCount or totalSalesValue if needed
    if (sortBy === 'boatsCount') {
      result.sort((a, b) => {
        return sortOrder === 'desc'
          ? b.boatsCount - a.boatsCount
          : a.boatsCount - b.boatsCount;
      });
    } else if (sortBy === 'totalSalesValue') {
      result.sort((a, b) => {
        return sortOrder === 'desc'
          ? b.totalSalesValue - a.totalSalesValue
          : a.totalSalesValue - b.totalSalesValue;
      });
    }

    // Apply pagination after sorting
    const paginatedResult = result.slice(skip, skip + limit);

    return {
      data: paginatedResult,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateSeller(sellerId: string, updateSellerDto: UpdateSellerDto) {
    return this.prisma.client.user.update({
      where: { id: sellerId },
      data: {
        status: updateSellerDto.status,
      },
    });
  }

  async getSellerById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
    });
  }
}
