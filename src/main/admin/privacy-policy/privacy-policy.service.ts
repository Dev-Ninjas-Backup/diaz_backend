import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdatePrivacyPolicyDto } from './dto/privacy-policy.dto';

@Injectable()
export class PrivacyPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async createPrivacyPolicy(updatePrivacyPolicyDto: UpdatePrivacyPolicyDto) {
    return this.prisma.client.privacyPolicy.create({
      data: {
        privacyTitle: updatePrivacyPolicyDto.privacyTitle,
        privacyDescription: updatePrivacyPolicyDto.privacyDescription,
      },
    });
  }

  async updatePrivacyPolicy(
    id: string,
    updatePrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    return this.prisma.client.privacyPolicy.update({
      where: { id },
      data: {
        privacyTitle: updatePrivacyPolicyDto.privacyTitle,
        privacyDescription: updatePrivacyPolicyDto.privacyDescription,
      },
    });
  }

  async getPrivacyPolicyById(id: string) {
    return this.prisma.client.privacyPolicy.findUnique({
      where: { id },
    });
  }
}
