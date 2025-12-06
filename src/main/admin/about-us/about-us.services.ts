import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateAboutUsDto } from './dto/about-us.dto';

@Injectable()
export class AboutUsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAboutUs() {
    return this.prisma.client.aboutPage.findFirst();
  }

  async updateAboutUs(updateAboutUsDto: UpdateAboutUsDto) {
    const aboutus = await this.getAboutUs();

    if (!aboutus) {
      throw new Error('Privacy policy not found');
    }

    return this.prisma.client.aboutPage.update({
      where: { id: aboutus.id },
      data: updateAboutUsDto,
    });
  }

  async createAboutUs(createAboutUsDto: UpdateAboutUsDto) {
    return this.prisma.client.aboutPage.create({
      data: { ...createAboutUsDto },
    });
  }
}
