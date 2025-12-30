import { PrismaModule } from '@/lib/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AboutUsController } from './about-us.controller';
import { AboutUsService } from './services/about-us.service';

@Module({
  imports: [PrismaModule],
  controllers: [AboutUsController],
  providers: [AboutUsService],
  exports: [AboutUsService],
})
export class AboutUsModule {}
