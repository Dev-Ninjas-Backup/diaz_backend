import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyLeadsPaginatedResponseDto } from './dto/daily-lead-response.dto';
import { CreateDailyLeadDto } from './dto/create-daily-lead.dto';
import { GetDailyLeadsQueryDto } from './dto/get-daily-leads-query.dto';
import { UpdateDailyLeadDto } from './dto/update-daily-lead.dto';
import { DailyLeadsService } from './daily-leads.service';

/** True if param is a positive integer string (e.g. "1", "42") */
function isNumericId(param: string): boolean {
  const num = parseInt(param, 10);
  return String(num) === param && num >= 1;
}

/** Parse and validate numeric id; throws BadRequestException if invalid */
function parseLeadId(id: string): number {
  const num = parseInt(id, 10);
  if (Number.isNaN(num) || num < 1 || !Number.isInteger(num)) {
    throw new BadRequestException('Lead id must be a positive integer.');
  }
  return num;
}

@ApiTags('Daily Leads')
@Controller('daily_leads')
export class DailyLeadsController {
  constructor(private readonly dailyLeadsService: DailyLeadsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all daily leads (paginated, sortable, filter by today)',
    description:
      "Returns daily leads with pagination, date-wise sorting, and optional today filter. Query: page, limit, sortOrder (asc|desc), today (true = only today's leads in UTC).",
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 10)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort by created_at (default desc)',
  })
  @ApiQuery({
    name: 'today',
    required: false,
    type: Boolean,
    description: 'If true, only leads created today (UTC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DailyLeadsPaginatedResponseDto,
  })
  async getAll(@Query() query: GetDailyLeadsQueryDto) {
    return this.dailyLeadsService.getAll({
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
      today: query.today,
    });
  }

  @Get(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get lead(s) by numeric id or user_id',
    description:
      'Pass a numeric id (e.g. 1) for a single lead, or user_id (e.g. FY271407489) for all leads of that user.',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async getByIdOrUserId(@Param('idOrUserId') idOrUserId: string) {
    if (isNumericId(idOrUserId)) {
      const lead = await this.dailyLeadsService.getById(
        parseLeadId(idOrUserId),
      );
      if (!lead) {
        return { status: 'error', message: 'Lead not found', lead: null };
      }
      return { status: 'success', lead };
    }
    return this.dailyLeadsService.getByUserId(idOrUserId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a daily lead' })
  @ApiResponse({ status: 201, description: 'Lead created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 409,
    description: 'A lead with this user_id and product already exists',
  })
  async create(@Body() dto: CreateDailyLeadDto) {
    const lead = await this.dailyLeadsService.create(dto);
    return {
      status: 'success',
      total_leads: 1,
      leads: [lead],
    };
  }

  @Patch(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update lead(s) by numeric id or user_id',
    description:
      'Pass numeric id to update one lead. Pass user_id to update by user_id; include product in body to update a specific lead, or omit to update all leads for that user.',
  })
  @ApiResponse({ status: 200, description: 'Lead(s) updated' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async update(
    @Param('idOrUserId') idOrUserId: string,
    @Body() dto: UpdateDailyLeadDto,
  ) {
    if (isNumericId(idOrUserId)) {
      const lead = await this.dailyLeadsService.update(
        parseLeadId(idOrUserId),
        dto,
      );
      if (!lead) {
        return { status: 'error', message: 'Lead not found', lead: null };
      }
      return { status: 'success', lead };
    }
    const result = await this.dailyLeadsService.updateByUserId(idOrUserId, dto);
    if (result.updated === 0) {
      return { status: 'error', message: 'No leads found for this user_id' };
    }
    return {
      status: 'success',
      updated: result.updated,
      leads: result.leads,
    };
  }

  @Delete(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete lead(s) by numeric id or user_id',
    description:
      'Pass numeric id to delete one lead. Pass user_id to delete all leads for that user.',
  })
  @ApiResponse({ status: 200, description: 'Lead(s) deleted' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async delete(@Param('idOrUserId') idOrUserId: string) {
    if (isNumericId(idOrUserId)) {
      const deleted = await this.dailyLeadsService.delete(
        parseLeadId(idOrUserId),
      );
      if (!deleted) {
        return { status: 'error', message: 'Lead not found' };
      }
      return { status: 'success', message: 'Lead deleted' };
    }
    const deleted = await this.dailyLeadsService.deleteByUserId(idOrUserId);
    if (deleted === 0) {
      return { status: 'error', message: 'No leads found for this user_id' };
    }
    return {
      status: 'success',
      message: `${deleted} lead(s) deleted`,
      deleted,
    };
  }
}
