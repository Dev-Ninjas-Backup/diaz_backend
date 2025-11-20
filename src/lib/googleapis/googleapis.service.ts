import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from 'google-auth-library';
import { content_v2_1, google } from 'googleapis';

@Injectable()
export class GoogleapisService implements OnModuleInit {
  private readonly logger = new Logger(GoogleapisService.name);
  private contentClient: content_v2_1.Content;
  private merchantId: string;
  private authClient: JWT;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.getOrThrow<string>(
      ENVEnum.GMC_MERCHANT_ID,
    );
  }

  async onModuleInit() {
    this.logger.log('Initializing Google Content API client...');

    try {
      this.authClient = new google.auth.JWT({
        email: this.configService.getOrThrow<string>(ENVEnum.GMC_CLIENT_EMAIL),
        key: this.configService
          .getOrThrow<string>(ENVEnum.GMC_PRIVATE_KEY)
          .replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/content'],
      });

      this.contentClient = google.content({
        version: 'v2.1',
        auth: this.authClient,
      });

      this.logger.log('Google Content API initialized successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to initialize Google Content API client.',
        error.stack,
      );
      throw error;
    }
  }

  getClient(): content_v2_1.Content {
    if (!this.contentClient) {
      throw new Error('Google Content API client is not initialized yet.');
    }
    return this.contentClient;
  }

  getMerchantId(): string {
    return this.merchantId;
  }
}
