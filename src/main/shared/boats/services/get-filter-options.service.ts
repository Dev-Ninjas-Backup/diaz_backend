import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export interface BoatFilterOptions {
  makes: string[];
  models: string[];
  years: number[];
  cities: string[];
  states: string[];
  classes: string[];
}

@Injectable()
export class GetFilterOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch boat filter options')
  async getFilterOptions(): Promise<BoatFilterOptions> {
    const [makes, models, years, cities, states, classes] =
      await this.prisma.client.$transaction([
        // Get makes from specifications
        this.prisma.client.boatSpecification.findMany({
          where: { type: 'MAKE', isDeleted: false },
          select: { name: true },
          orderBy: { name: 'asc' },
        }),

        // Get models from specifications
        this.prisma.client.boatSpecification.findMany({
          where: { type: 'MODEL', isDeleted: false },
          select: { name: true },
          orderBy: { name: 'asc' },
          take: 200, // Limit to avoid too much data
        }),

        // Get distinct years from active boats
        this.prisma.client.boats.findMany({
          where: { status: 'ACTIVE' },
          select: { buildYear: true },
          distinct: ['buildYear'],
          orderBy: { buildYear: 'desc' },
        }),

        // Get distinct cities from active boats
        this.prisma.client.boats.findMany({
          where: { status: 'ACTIVE' },
          select: { city: true },
          distinct: ['city'],
          orderBy: { city: 'asc' },
        }),

        // Get distinct states from active boats
        this.prisma.client.boats.findMany({
          where: { status: 'ACTIVE' },
          select: { state: true },
          distinct: ['state'],
          orderBy: { state: 'asc' },
        }),

        // Get class from specifications
        this.prisma.client.boatSpecification.findMany({
          where: { type: 'CLASS', isDeleted: false },
          select: { name: true },
          orderBy: { name: 'asc' },
        }),
      ]);

    return {
      makes: makes.map((m) => m.name),
      models: models.map((m) => m.name),
      years: years.map((y) => y.buildYear),
      cities: cities.map((c) => c.city),
      states: states.map((s) => s.state),
      classes: classes.map((c) => c.name),
    };
  }
}
