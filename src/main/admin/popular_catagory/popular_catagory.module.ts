import { Module } from '@nestjs/common';
import { PopularCategoryController } from './popular_catagory.controller';
import { PopularCategoryService } from './popular_catagory.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';

@Module({
  controllers: [PopularCategoryController],
  providers: [PopularCategoryService, PrismaService, S3Service],
})
export class PopularCategoryModule {}
