import { Module } from '@nestjs/common';
import { AboutUsController } from './aboutus.controller';
import { AboutUsService } from './services/aboutus.service';
import { MissionVisionService } from './services/mission-vision.service';
import { OurStoryService } from './services/our-story.service';
import { WhatSetsUsApartService } from './services/what-sets-us-apart.service';

@Module({
  controllers: [AboutUsController],
  providers: [
    AboutUsService,
    OurStoryService,
    MissionVisionService,
    WhatSetsUsApartService,
  ],
})
export class AboutUsModule {}
