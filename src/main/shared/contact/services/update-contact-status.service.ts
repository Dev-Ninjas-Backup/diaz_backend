import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateContactStatusDto } from '../dto/update-contact-status.dto';

@Injectable()
export class UpdateContactStatusService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to update contact status', 'Contact')
  async updateContactStatus(
    id: string,
    dto: UpdateContactStatusDto,
  ): Promise<TResponse<any>> {
    const existingContact = await this.prisma.client.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    const updatedContact = await this.prisma.client.contact.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return successResponse(
      updatedContact,
      'Contact status updated successfully',
    );
  }
}
