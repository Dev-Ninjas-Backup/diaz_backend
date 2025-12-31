import { ENVEnum } from '@/common/enum/env.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { MailService } from '@/lib/mail/mail.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ContactUsResponseDataDto,
  CreateContactUsResponseDataDto,
} from '../dto/contact-us-response.dto';
import { CreateContactUsDto } from '../dto/create-contact-us.dto';

@Injectable()
export class CreateContactUsService {
  private readonly logger = new Logger(CreateContactUsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @HandleError('Failed to get contact us information', 'Contact')
  async getContactUs(): Promise<TResponse<ContactUsResponseDataDto>> {
    // This is a global endpoint, no site-specific ContactPage data

    return successResponse(
      {
        contactPage: null,
        formFields: {
          fullName: {
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'John Doe',
            maxLength: 255,
            description: 'Full name of the contact',
          },
          phone: {
            label: 'Phone',
            type: 'text',
            required: true,
            placeholder: '1234567890',
            maxLength: 20,
            description: 'Phone number of the contact',
          },
          email: {
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'john@example.com',
            maxLength: 255,
            description: 'Email address of the contact',
          },
          boatInformation: {
            label: 'Boat Information',
            type: 'textarea',
            required: false,
            placeholder: 'Interested in a 2020 Sea Ray Sundancer',
            maxLength: 2000,
            description: 'Boat information (optional)',
          },
          comments: {
            label: 'Comments',
            type: 'textarea',
            required: false,
            placeholder: 'I would like to schedule a viewing.',
            maxLength: 2000,
            description: 'Additional comments (optional)',
          },
        },
        endpoint: '/contact/contact-us',
        method: 'POST',
        message: 'Contact Us form information',
      },
      'Contact Us form information retrieved successfully',
    );
  }

  @HandleError('Failed to create contact', 'Contact')
  async createContactUs(
    data: CreateContactUsDto,
  ): Promise<TResponse<CreateContactUsResponseDataDto>> {
    // Create contact us record
    const contact = await this.prisma.client.contactUs.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        boatInformation: data.boatInformation || null,
        comments: data.comments || null,
      },
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
              .field-label { font-weight: bold; color: #555; }
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
                  <p><span class="field-label">Full Name:</span> ${data.fullName}</p>
                  <p><span class="field-label">Email:</span> ${data.email}</p>
                  <p><span class="field-label">Phone:</span> ${data.phone}</p>
                </div>
                ${
                  data.boatInformation
                    ? `
                <div class="info-box">
                  <h2>Boat Information</h2>
                  <p>${data.boatInformation.replace(/\n/g, '<br>')}</p>
                </div>
                `
                    : ''
                }
                ${
                  data.comments
                    ? `
                <div class="info-box">
                  <h2>Comments</h2>
                  <p>${data.comments.replace(/\n/g, '<br>')}</p>
                </div>
                `
                    : ''
                }
                <div class="info-box">
                  <h2>Submission Details</h2>
                  <p><span class="field-label">Submitted:</span> ${new Date().toLocaleString()}</p>
                  <p><span class="field-label">Source:</span> Contact Us Form</p>
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
Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}

${data.boatInformation ? `Boat Information:\n${data.boatInformation}\n\n` : ''}
${data.comments ? `Comments:\n${data.comments}\n\n` : ''}
Submission Details:
Submitted: ${new Date().toLocaleString()}
Source: Contact Us Form
        `;

        await this.mailService.sendMail({
          to: adminEmail,
          subject: `New Contact Form Submission - ${data.fullName}`,
          html: emailHtml,
          text: emailText,
        });

        this.logger.log(
          `Contact Us email sent to admin (SUPER_ADMIN_EMAIL): ${adminEmail}`,
        );
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email to admin: ${error.message}`);
    }

    this.logger.log(`Contact Us form submitted: ${contact.id}`);
    return successResponse(
      {
        id: contact.id,
        message: 'Thank you for contacting us! We will get back to you soon.',
      },
      'Contact form submitted successfully',
    );
  }
}
