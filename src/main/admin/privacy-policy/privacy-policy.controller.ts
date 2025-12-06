import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdatePrivacyPolicyDto } from './dto/privacy-policy.dto';
import { PrivacyPolicyService } from './privacy-policy.service';

@ApiTags('Admin -- Privacy Policy') // This groups it nicely in Swagger UI
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @ApiOperation({ summary: 'Create a new Privacy Policy entry' })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Privacy Policy created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Post('create')
  async createPrivacyPolicy(
    @Body() updatePrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    return this.privacyPolicyService.createPrivacyPolicy(
      updatePrivacyPolicyDto,
    );
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update existing Privacy Policy by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Privacy Policy ID',
    example: 1,
  })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Privacy Policy updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Privacy Policy not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async updatePrivacyPolicy(
    @Param('id') id: string,
    @Body() updatePrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    return this.privacyPolicyService.updatePrivacyPolicy(
      id,
      updatePrivacyPolicyDto,
    );
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Get Privacy Policy by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Privacy Policy ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Privacy Policy found.' })
  @ApiResponse({ status: 404, description: 'Privacy Policy not found.' })
  async getPrivacyPolicy(@Param('id') id: string) {
    return this.privacyPolicyService.getPrivacyPolicyById(id);
  }
}
