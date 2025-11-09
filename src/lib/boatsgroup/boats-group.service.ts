import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BoatsGroupService {
  private readonly logger = new Logger(BoatsGroupService.name);
  private readonly apiBoatsKey;
  private readonly apiBoatsBaseUrl;
  private readonly serviceBoatsKey;
  private readonly serviceBoatsBaseUrl;

  constructor(private readonly config: ConfigService) {
    this.apiBoatsKey = this.config.getOrThrow<string>(ENVEnum.API_BOATS_KEY);
    this.apiBoatsBaseUrl = `https://api.boats.com/inventory/search?key=${this.apiBoatsKey}`;
    this.serviceBoatsKey = this.config.getOrThrow<string>(
      ENVEnum.SERVICE_BOATS_KEY,
    );
    this.serviceBoatsBaseUrl = `https://services.boats.com/pls/boats/search?key=${this.serviceBoatsKey}`;
  }
}
