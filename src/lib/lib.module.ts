import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { MulterModule } from './multer/multer.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { S3BucketModule } from './s3/s3.module';
import { SeedModule } from './seed/seed.module';
import { StripeModule } from './stripe/stripe.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    QueueModule,
    SeedModule,
    PrismaModule,
    MailModule,
    UtilsModule,
    FileModule,
    MulterModule,
    StripeModule,
    S3BucketModule,
  ],
  exports: [],
  providers: [],
})
export class LibModule {}
