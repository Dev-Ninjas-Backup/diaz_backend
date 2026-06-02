import { ENVEnum } from '@/common/enum/env.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Controller, Get, Headers, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

const SHARE_BASE_URL = 'https://api.floridayachttrader.com';

const CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Telegram/i;

function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Controller('share/boat')
export class ShareController {
  private readonly deepLinkBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.deepLinkBaseUrl = this.configService.getOrThrow<string>(
      ENVEnum.FYT_DEEP_LINK_BASE_URL,
    );
  }

  @Get(':id')
  async shareBoat(
    @Param('id') boatId: string,
    @Headers('user-agent') userAgent: string = '',
    @Res() res: Response,
  ): Promise<void> {
    if (CRAWLER_PATTERN.test(userAgent)) {
      try {
        const boat = await this.prisma.client.boats.findUnique({
          where: { id: boatId },
          include: { images: { include: { file: true } } },
        });

        if (boat) {
          const coverImage = boat.images.find(
            (img: any) => img.imageType === 'COVER',
          );
          const imageUrl = escapeHtml(
            coverImage?.file?.url ??
              `${SHARE_BASE_URL}/public/default-preview.jpg`,
          );
          const title = escapeHtml(`${boat.name} | Florida Yacht Trader`);
          const lengthFt = boat.length
            ? `${Math.floor(Number(boat.length))}'`
            : null;
          const description = escapeHtml(
            `${boat.buildYear} ${boat.make} ${boat.model}` +
              (lengthFt ? ` — ${lengthFt}` : '') +
              (boat.price
                ? ` | Price: $${Number(boat.price).toLocaleString()}`
                : ' | Contact for price'),
          );
          const canonicalUrl = escapeHtml(
            `${SHARE_BASE_URL}/share/boat/${boatId}`,
          );

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
  </head>
  <body>
    <p>Redirecting to Florida Yacht Trader...</p>
  </body>
</html>`);
          return;
        }
      } catch {
        // Fall through to deep-link redirect on any DB error
      }
    }

    res.redirect(`${this.deepLinkBaseUrl}/boat?id=${boatId}`);
  }
}
