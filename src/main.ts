import 'reflect-metadata';

import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ENVEnum } from './common/enum/env.enum';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://development.jupitermarinesales.com',
      'https://jupitermarinesales.com',
      'https://development.floridayachttrader.com',
      'https://floridayachttrader.com',
      'https://admin.floridayachttrader.com',
      'https://diaz-florida-yacht-frontend.vercel.app',
      'https://florida-yacht-dashboard.pages.dev',
      'https://diaz-jupiter-marine-frontend.vercel.app',
      'http://16.171.46.71:3000',
      'http://16.171.46.71:4173',
      'http://13.50.239.13:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // * add global pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // * add global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // * set global prefix before all routes & swagger
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'search-listing/listing/:id', method: RequestMethod.GET },
    ],
  });

  // * Swagger config with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('Diaz API')
    .setDescription('The Diaz API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // * add body parser
  app.use(
    '/api/subscription/webhook/stripe',
    bodyParser.raw({ type: 'application/json' }),
  );

  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '5051', 10);
  await app.listen(port);
}

void bootstrap();
