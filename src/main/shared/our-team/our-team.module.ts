import { S3BucketModule } from '@/lib/s3/s3.module';
import { Module } from '@nestjs/common';
import { OurTeamController } from './our-team.controller';
import { OurTeamService } from './our-team.service';

@Module({
  imports: [S3BucketModule],
  controllers: [OurTeamController],
  providers: [OurTeamService],
  exports: [OurTeamService],
})
export class OurTeamModule {}
