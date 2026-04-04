import { ENVEnum } from '@/common/enum/env.enum';
import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('search-listing/listing')
export class RedirectController {
  private readonly floridaBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.floridaBaseUrl = this.configService.getOrThrow<string>(
      ENVEnum.PRODUCT_DETAILS_BASE_URL,
    );
  }

  @Get(':id')
  @Redirect()
  redirectToFlorida(@Param('id') id: string) {
    return { url: `${this.floridaBaseUrl}/listing/${id}`, statusCode: 301 };
  }
}
