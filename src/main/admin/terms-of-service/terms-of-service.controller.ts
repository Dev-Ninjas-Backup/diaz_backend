import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateTermsOfServicesDto } from './dto/tos.dto';
import { TermsofServicesService } from './terms-of-service.service';

@ApiTags('Admin -- Terms of Service Page') // Groups in Swagger UI
@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly privacyPolicyService: TermsofServicesService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Terms of Service entry' })
  @ApiBody({ type: UpdateTermsOfServicesDto })
  @ApiResponse({ status: 201, description: 'Terms created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createTermsOfService(
    @Body() createTermsOfServiceDto: UpdateTermsOfServicesDto,
  ) {
    return this.privacyPolicyService.createTermsOfService(
      createTermsOfServiceDto,
    );
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update Terms of Service by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Terms of Service ID' })
  @ApiBody({ type: UpdateTermsOfServicesDto })
  @ApiResponse({ status: 200, description: 'Terms updated successfully.' })
  @ApiResponse({ status: 404, description: 'Terms not found.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async updateTermsOfService(
    @Body() updateTermsOfServiceDto: UpdateTermsOfServicesDto,
    @Param('id') id: string,
  ) {
    return this.privacyPolicyService.updateTermsOfService(
      id,
      updateTermsOfServiceDto,
    );
  }

  @Get('get/:id')
  async getTermsOfService(@Param('id') id: string) {
    return this.privacyPolicyService.getTermsOfServiceById(id);
  }
}
