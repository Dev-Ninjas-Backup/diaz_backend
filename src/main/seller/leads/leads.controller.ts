import { GetUser, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetSellerLeadsDto } from './dto/get-own-leads.dto';
import { LeadsService } from './services/leads.service';

@ApiTags('Seller --- Leads')
@ApiBearerAuth()
@ValidateAuth()
@Controller('leads/seller')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Get seller leads' })
  @Get()
  async getSellerLeads(
    @GetUser('sub') userId: string,
    @Query() query: GetSellerLeadsDto,
  ) {
    return this.leadsService.getSellerLeads(userId, query);
  }

  @ApiOperation({ summary: 'Get seller lead by id' })
  @Get(':leadId')
  async getSellerLeadById(
    @GetUser('sub') userId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.leadsService.getSellerLeadById(userId, leadId);
  }
}
