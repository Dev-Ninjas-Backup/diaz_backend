import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ContactSource } from '@prisma/client';
import { GetAllBoatsService } from '../../boats/services/get-all-boats.service';
import { CreateContactDto } from '../dto/create-contact.dto';

@Injectable()
export class CreateContactService {
  private readonly logger = new Logger(CreateContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly getAllBoatsService: GetAllBoatsService,
  ) {}

  @HandleError('Failed to create contact', 'Contact')
  async createContact(data: CreateContactDto): Promise<TResponse<any>> {
    const { listingId, listingSource, source } = data;

    // Validate paired fields
    if ((listingId && !listingSource) || (!listingId && listingSource)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Both listing ID and listing source must be provided together',
      );
    }

    // Specific business rule: FLORIDA source must have custom listing source
    if (
      source === ContactSource.FLORIDA &&
      listingSource &&
      listingSource !== BoatsSourceEnum.custom
    ) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Listing source must be custom if source is FLORIDA',
      );
    }

    // Validate the listing exists if both fields are provided
    if (listingId && listingSource) {
      await this.getAllBoatsService.getSingleBoat(listingId, {
        source: listingSource,
      });
    }

    // Create the contact
    const contact = await this.prisma.contact.create({ data });

    this.logger.log(`Contact created: ${JSON.stringify(contact)}`);

    // TODO: send email if client wants

    return successResponse(contact, 'Contact created successfully');
  }
}
