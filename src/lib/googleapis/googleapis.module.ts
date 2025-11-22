import { Global, Module } from '@nestjs/common';
import { GoogleapisService } from './googleapis.service';
import { GoogleContentService } from './services/google-content.service';

@Global()
@Module({
  providers: [GoogleapisService, GoogleContentService],
  exports: [GoogleapisService, GoogleContentService],
})
export class GoogleapisModule {}
