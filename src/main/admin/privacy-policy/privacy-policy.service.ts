import { Injectable } from '@nestjs/common';
import { UpdatePrivacyPolicyDto } from './dto/privacy-policy.dto';
import { PrismaService } from '@/lib/prisma/prisma.service';
// In-memory storage (replace with Prisma/TypeORM/Mongo in production)

@Injectable()
export class PrivacyPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getPolicy(): Promise<UpdatePrivacyPolicyDto | null> {
    return this.prisma.client.privacyPolicy.findFirst();
  }

  async updatePolicy(updatePrivacyPolicyDto: UpdatePrivacyPolicyDto) {
    const ppp = await this.getPolicy();

    if (!ppp) {
      throw new Error('Privacy policy not found');
    }

    return this.prisma.client.privacyPolicy.update({
      where: { id: ppp.id },
      data: updatePrivacyPolicyDto,
    });
  }

  async createPrivacyPolicy(createPrivacyPolicy: UpdatePrivacyPolicyDto) {
    return this.prisma.client.privacyPolicy.create({
      data: createPrivacyPolicy,
    });
  }
}
