import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats() {
    return this.prisma.boats.findMany();
  }
}
