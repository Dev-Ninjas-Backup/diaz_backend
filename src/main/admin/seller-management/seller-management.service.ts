import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateSellerDto } from './dto/seller.dto';

@Injectable()
export class SellerManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSellers() {
    const sellerBoatStats = await this.prisma.client.user.findMany({
      where: {
        role: 'SELLER', // Optional: filter only sellers
        status: 'ACTIVE',
        boats: {
          // Only users who have at least one non-inactive boat listing
          some: {
            status: {
              not: 'INACTIVE',
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        isVerified: true,
        avatarUrl: true,

        // Count of boats
        _count: {
          select: {
            boats: {
              where: {
                // Count all non-inactive listings as boats for this seller
                status: {
                  not: 'INACTIVE',
                },
              },
            },
          },
        },

        // Total value of all sold boats (sum of price)
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
        boatsCount: seller._count.boats,
        totalSalesValue: Number(totalSalesValue.toFixed(2)), // Clean float
      };
    });
    return result;
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
