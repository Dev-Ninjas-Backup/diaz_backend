import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoatsService {
  constructor(private readonly prisma: PrismaService) {}
}
