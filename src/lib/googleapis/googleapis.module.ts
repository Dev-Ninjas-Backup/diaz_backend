import { Module } from '@nestjs/common';
import { GoogleapisService } from './googleapis.service';

@Module({
  providers: [GoogleapisService],
})
export class GoogleapisModule {}
