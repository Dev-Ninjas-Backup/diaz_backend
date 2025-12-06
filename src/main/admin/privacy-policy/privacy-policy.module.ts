import { Module } from '@nestjs/common';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrismaService } from '@/lib/prisma/prisma.service';

@Module({
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService, PrismaService],
})
export class PrivacyPolicyModule {}
