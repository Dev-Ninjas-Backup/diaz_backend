import { ENVEnum } from '@/common/enum/env.enum';
import { MailService } from '@/lib/mail/mail.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/client';
import { DailyLead } from 'generated/client';
import { CreateDailyLeadDto } from './dto/create-daily-lead.dto';
import { UpdateDailyLeadDto } from './dto/update-daily-lead.dto';
import { getNewLeadAlertHtml } from './templates/new-lead-alert.template';

export type DailyLeadResponse = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  product: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DailyLeadsApiResponse = {
  status: string;
  total_leads: number;
  leads: DailyLeadResponse[];
};

export type DailyLeadsPaginatedApiResponse = DailyLeadsApiResponse & {
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

function toResponseFormat(lead: DailyLead): DailyLeadResponse {
  return {
    id: lead.id,
    user_id: lead.userId,
    name: lead.name,
    email: lead.email,
    product: lead.product,
    status: lead.status,
    created_at: lead.createdAt.toISOString(),
    updated_at: lead.updatedAt.toISOString(),
  };
}

@Injectable()
export class DailyLeadsService {
  private readonly logger = new Logger(DailyLeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private handlePrismaError(err: unknown): never {
    this.logger.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2021') {
        throw new ServiceUnavailableException(
          'Daily leads table is missing. Run: pnpm prisma migrate deploy',
        );
      }
      if (err.code === 'P2002') {
        throw new ConflictException(
          'A lead with this user_id and product already exists.',
        );
      }
      if (err.code === 'P2003') {
        throw err; // FK constraint – let default handler show it
      }
    }
    throw err;
  }

  /**
   * Get all daily leads from the local database with optional pagination, date sort, and today filter.
   */
  async getAll(query: {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    today?: boolean;
  }): Promise<DailyLeadsPaginatedApiResponse> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.max(1, Math.min(100, query.limit ?? 10));
      const sortOrder = query.sortOrder ?? 'desc';
      const today = query.today === true;

      const where = today ? this.getTodayWhereFilter() : {};

      const [leads, total] = await Promise.all([
        this.prisma.client.dailyLead.findMany({
          where,
          orderBy: { createdAt: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.client.dailyLead.count({ where }),
      ]);

      const totalPage = Math.ceil(total / limit) || 1;

      return {
        status: 'success',
        total_leads: leads.length,
        leads: leads.map(toResponseFormat),
        metadata: {
          page,
          limit,
          total,
          totalPage,
        },
      };
    } catch (err) {
      this.handlePrismaError(err);
    }
  }

  /** Prisma where filter: created_at >= start of today UTC and < start of tomorrow UTC */
  private getTodayWhereFilter(): { createdAt: { gte: Date; lt: Date } } {
    const now = new Date();
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return {
      createdAt: { gte: start, lt: end },
    };
  }

  async getById(id: number): Promise<DailyLeadResponse | null> {
    const lead = await this.prisma.client.dailyLead.findUnique({
      where: { id },
    });
    return lead ? toResponseFormat(lead) : null;
  }

  /** Get all leads for a given user_id */
  async getByUserId(userId: string): Promise<DailyLeadsApiResponse> {
    const leads = await this.prisma.client.dailyLead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      status: 'success',
      total_leads: leads.length,
      leads: leads.map(toResponseFormat),
    };
  }

  async create(dto: CreateDailyLeadDto): Promise<DailyLeadResponse> {
    try {
      const product = dto.product ?? '';
      const existing = await this.prisma.client.dailyLead.findUnique({
        where: {
          userId_product: { userId: dto.user_id, product },
        },
      });

      if (existing) {
        const updated = await this.prisma.client.dailyLead.update({
          where: { id: existing.id },
          data: {
            name: dto.name,
            email: dto.email,
            status: dto.status ?? 'not contacted',
          },
        });
        return toResponseFormat(updated);
      }

      const lead = await this.prisma.client.dailyLead.create({
        data: {
          userId: dto.user_id,
          name: dto.name,
          email: dto.email,
          product,
          status: dto.status ?? 'not contacted',
        },
      });

      await this.sendNewLeadEmailToAdmin(lead).catch((err) => {
        this.logger.warn(
          `Failed to send new lead email to admin: ${err?.message ?? err}`,
        );
      });

      return toResponseFormat(lead);
    } catch (err) {
      this.handlePrismaError(err);
    }
  }

  /** Human-readable date for email (e.g. "March 12, 2026 at 12:10 AM UTC") */
  private formatEmailDate(date: Date): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    };
    return d.toLocaleString('en-US', options);
  }

  private async sendNewLeadEmailToAdmin(lead: DailyLead): Promise<void> {
    const adminEmail = this.configService.get<string>(
      ENVEnum.SUPER_ADMIN_EMAIL,
    );
    if (!adminEmail) {
      this.logger.warn(
        'SUPER_ADMIN_EMAIL not set; skipping new lead notification',
      );
      return;
    }

    const now = new Date();
    const dashboardUrl =
      this.configService.get<string>(ENVEnum.BASE_URL) ??
      'https://admin.floridayachttrader.com/';

    const html = getNewLeadAlertHtml({
      LEAD_NAME: lead.name,
      LEAD_EMAIL: lead.email,
      STATUS: lead.status,
      USER_ID: lead.userId,
      LEAD_TIME: this.formatEmailDate(lead.createdAt),
      TIMESTAMP: this.formatEmailDate(now),
      CLIENT_NAME: 'Admin',
      YEAR: String(now.getUTCFullYear()),
      DASHBOARD_URL: dashboardUrl,
    });

    const text = `New Lead: ${lead.name} (${lead.email}). Product: ${lead.product || '—'}. Status: ${lead.status}. User ID: ${lead.userId}. Received: ${lead.createdAt.toISOString()}.`;

    await this.mailService.sendMail({
      to: adminEmail,
      subject: `New Daily Lead: ${lead.name} – ${lead.product || 'Inquiry'}`,
      html,
      text,
    });

    this.logger.log(`New lead alert email sent to admin for lead ${lead.id}`);
  }

  async update(
    id: number,
    dto: UpdateDailyLeadDto,
  ): Promise<DailyLeadResponse | null> {
    const lead = await this.prisma.client.dailyLead.findUnique({
      where: { id },
    });
    if (!lead) return null;

    const updated = await this.prisma.client.dailyLead.update({
      where: { id },
      data: {
        ...(dto.user_id != null && { userId: dto.user_id }),
        ...(dto.name != null && { name: dto.name }),
        ...(dto.email != null && { email: dto.email }),
        ...(dto.product != null && { product: dto.product }),
        ...(dto.status != null && { status: dto.status }),
      },
    });
    return toResponseFormat(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.client.dailyLead.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /** Update lead(s) by user_id. If dto.product is set, updates only that lead; else updates all leads for the user. */
  async updateByUserId(
    userId: string,
    dto: UpdateDailyLeadDto,
  ): Promise<{ updated: number; leads: DailyLeadResponse[] }> {
    const where: { userId: string; product?: string } =
      dto.product != null && dto.product !== ''
        ? { userId, product: dto.product }
        : { userId };
    const leads = await this.prisma.client.dailyLead.findMany({ where });
    if (leads.length === 0) {
      return { updated: 0, leads: [] };
    }
    const data = {
      ...(dto.user_id != null && { userId: dto.user_id }),
      ...(dto.name != null && { name: dto.name }),
      ...(dto.email != null && { email: dto.email }),
      ...(dto.product != null && { product: dto.product }),
      ...(dto.status != null && { status: dto.status }),
    };
    const updated: DailyLeadResponse[] = [];
    for (const lead of leads) {
      const u = await this.prisma.client.dailyLead.update({
        where: { id: lead.id },
        data,
      });
      updated.push(toResponseFormat(u));
    }
    return { updated: updated.length, leads: updated };
  }

  /** Delete all leads for a user_id. Returns number of deleted rows. */
  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.prisma.client.dailyLead.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}
