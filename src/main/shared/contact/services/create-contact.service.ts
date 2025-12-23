import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ENVEnum } from '@/common/enum/env.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { MailService } from '@/lib/mail/mail.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactSource, ContactType } from 'generated/client';
import { GetAllBoatsService } from '../../boats/services/get-all-boats.service';
import { CreateContactDto } from '../dto/create-contact.dto';

@Injectable()
export class CreateContactService {
  private readonly logger = new Logger(CreateContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly getAllBoatsService: GetAllBoatsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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

    // 4. Get the boat
    let boat = null;
    if (listingId && listingSource) {
      boat = await this.getAllBoatsService.getSingleBoat(listingId, {
        source: listingSource,
      });
    }

    // Transaction: create contact and FloridaLead if needed
    const result = await this.prisma.client.$transaction(async (tx) => {
      // Create the contact
      const contact = await tx.contact.create({ data });

      // If FLORIDA contact with boat, create FloridaLead
      if (source === ContactSource.FLORIDA && boat) {
        const boatId = boat.data.DocumentID;
        if (typeof boatId === 'string') {
          await tx.floridaLead.create({
            data: {
              contactId: contact.id,
              boatId,
            },
          });
        }
      }

      return contact;
    });

    try {
      const adminEmail = this.configService.get<string>(
        ENVEnum.SUPER_ADMIN_EMAIL,
      );

      if (!adminEmail) {
        this.logger.warn(
          'SUPER_ADMIN_EMAIL not configured in environment variables. Skipping email notification.',
        );
      } else {
        const boatInfo = boat
          ? `<p><strong>Boat:</strong> ${boat.data.BoatName || boat.data.ListingTitle || 'N/A'}</p>
             <p><strong>Listing ID:</strong> ${data.listingId || 'N/A'}</p>
             <p><strong>Price:</strong> ${boat.data.Price || 'N/A'}</p>`
          : '<p><strong>Type:</strong> General Inquiry</p>';

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="info-box">
                  <h2>Contact Information</h2>
                  <p><strong>Name:</strong> ${data.name}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Phone:</strong> ${data.phone}</p>
                </div>
                <div class="info-box">
                  <h2>Message</h2>
                  <p>${data.message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="info-box">
                  <h2>Details</h2>
                  <p><strong>Source:</strong> ${data.source}</p>
                  <p><strong>Type:</strong> ${data.type}</p>
                  ${boatInfo}
                  <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated email from Diaz Boats Contact System</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailText = `
New Contact Form Submission

Contact Information:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Message:
${data.message}

Details:
Source: ${data.source}
Type: ${data.type}
${boat ? `Boat: ${boat.data.BoatName || boat.data.ListingTitle || 'N/A'}\nListing ID: ${data.listingId || 'N/A'}\nPrice: ${boat.data.Price || 'N/A'}` : 'Type: General Inquiry'}
Submitted: ${new Date().toLocaleString()}
        `;

        await this.mailService.sendMail({
          to: adminEmail,
          subject: `New Contact Form Submission - ${data.name}`,
          html: emailHtml,
          text: emailText,
        });

        this.logger.log(
          `Contact email sent to admin (SUPER_ADMIN_EMAIL): ${adminEmail}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send email to admin: ${error.message}`);
    }

    this.logger.log(`Contact created: ${JSON.stringify(result)}`);
    return successResponse(result, 'Contact created successfully');
  }
}
