import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateContactPageDto } from './dto/contact-page.dto';

@Injectable()
export class ContactPageService {
  constructor(private readonly prisma: PrismaService) {}

  async getContactPage() {
    return this.prisma.client.contactPage.findFirst();
  }

  async updateContactPage(updateContactPageDto: UpdateContactPageDto) {
    const aboutus = await this.getContactPage();

    if (!aboutus) {
      throw new Error('Privacy policy not found');
    }

    return this.prisma.client.contactPage.update({
      where: { id: aboutus.id },
      data: updateContactPageDto,
    });
  }

  async createAboutUs(updateContactPageDto: UpdateContactPageDto) {
    return this.prisma.client.contactPage.create({
      data: { ...updateContactPageDto },
    });
  }
}
