import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ContactSource, ContactType } from '@prisma/client';
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
    const { listingId, listingSource, source, type } = data;

    // 1. Validate ContactType rules
    if (type === ContactType.GLOBAL) {
      // GLOBAL must not have any listing details
      if (listingId || listingSource) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          'GLOBAL contact cannot include listingId or listingSource',
        );
      }
    }

    if (type === ContactType.INDIVIDUAL_LISTING) {
      // INDIVIDUAL_LISTING requires both
      if (!listingId || !listingSource) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          'INDIVIDUAL_LISTING requires both listingId and listingSource',
        );
      }
    }

    // 2. Validate paired fields (extra safety, but still required)
    if ((listingId && !listingSource) || (!listingId && listingSource)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Both listingId and listingSource must be provided together',
      );
    }

    // 3. Business rule: FLORIDA source → must use custom listingSource
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

    // 4. Validate listing existence for INDIVIDUAL_LISTING
    if (listingId && listingSource) {
      await this.getAllBoatsService.getSingleBoat(listingId, {
        source: listingSource,
      });
    }

    // 5. Create the contact
    const contact = await this.prisma.contact.create({ data });

    this.logger.log(`Contact created: ${JSON.stringify(contact)}`);

    return successResponse(contact, 'Contact created successfully');
  }
}
