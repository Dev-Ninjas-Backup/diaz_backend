import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateTermsOfServicesDto } from './dto/tos.dto';

@Injectable()
export class TermsofServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createTermsOfService(createTermsOfServiceDto: any) {
    const { termsTitle, termsDescription } = createTermsOfServiceDto;
    return this.prisma.client.termsOfServices.create({
      data: {
        termsTitle,
        termsDescription,
      },
    });
  }

  async updateTermsOfService(
    id: string,
    updateTermsOfServiceDto: UpdateTermsOfServicesDto,
  ) {
    const { termsTitle, termsDescription } = updateTermsOfServiceDto;
    return this.prisma.client.termsOfServices.update({
      where: { id },
      data: {
        termsTitle,
        termsDescription,
      },
    });
  }

  async getTermsOfServiceById(id: string) {
    return this.prisma.client.termsOfServices.findUnique({
      where: { id },
    });
  }
}
