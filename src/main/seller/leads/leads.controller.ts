import { GetUser, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSellerLeadsDto } from './dto/get-own-leads.dto';
import { LeadsService } from './services/leads.service';

@ApiTags('Seller -- Leads & Stats')
@ApiBearerAuth()
@ValidateAuth()
@Controller('seller')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Get seller stats' })
  @Get('stats')
  async getSellerStats(@GetUser('sub') userId: string) {
    return this.leadsService.getSellerStats(userId);
  }

  @ApiOperation({ summary: 'Get seller leads' })
  @Get('leads')
  async getSellerLeads(
    @GetUser('sub') userId: string,
    @Query() query: GetSellerLeadsDto,
  ) {
    return this.leadsService.getSellerLeads(userId, query);
  }

  @ApiOperation({ summary: 'Get seller lead by id' })
  @Get('leads/:leadId')
  async getSellerLeadById(
    @GetUser('sub') userId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.leadsService.getSellerLeadById(userId, leadId);
  }
}
