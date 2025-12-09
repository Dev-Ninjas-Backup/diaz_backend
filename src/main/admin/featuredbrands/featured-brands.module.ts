import { Module } from '@nestjs/common';
import { FeaturedBrandsController } from './featured-brands.controller';
import { FeaturedBrandsService } from './services/featured-brands.service';

@Module({
  imports: [],
  controllers: [FeaturedBrandsController],
  providers: [FeaturedBrandsService],
  exports: [FeaturedBrandsService],
})
export class FeaturedBrandsModule {}
