import { TResponse } from '@/common/utils/response.util';
import {
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import * as multer from 'multer';
import { CreateOurTeamDto } from './dto/create-our-team.dto';
import { OurTeamResponseDto } from './dto/our-team-response.dto';
import { UpdateOurTeamDto } from './dto/update-our-team.dto';
import { OurTeamService } from './our-team.service';

@ApiTags('Our Team')
@Controller('our-team')
export class OurTeamController {
  constructor(private readonly ourTeamService: OurTeamService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new team member',
    description: 'Add a new team member with name, designation, and image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  @ApiBody({ type: CreateOurTeamDto })
  @ApiOkResponse({
    description: 'Team member created successfully',
    type: OurTeamResponseDto,
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateOurTeamDto,
  ): Promise<TResponse<any>> {
    return await this.ourTeamService.create(dto, file);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all team members for a site',
    description:
      'Retrieve all active team members for a given site ordered by display order',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Site identifier (FLORIDA or JUPITER). Defaults to FLORIDA.',
  })
  @ApiOkResponse({
    description: 'Team members retrieved successfully',
    type: [OurTeamResponseDto],
  })
  async findAll(@Query('site') site?: SiteType): Promise<TResponse<any>> {
    return await this.ourTeamService.findAll(site);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific team member',
    description: 'Retrieve a single team member by ID',
  })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiOkResponse({
    description: 'Team member retrieved successfully',
    type: OurTeamResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
  })
  async findOne(@Param('id') id: string): Promise<TResponse<any>> {
    return await this.ourTeamService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a team member',
    description: "Update an existing team member's information",
  })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  @ApiBody({ type: UpdateOurTeamDto })
  @ApiOkResponse({
    description: 'Team member updated successfully',
    type: OurTeamResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
  })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateOurTeamDto,
  ): Promise<TResponse<any>> {
    return await this.ourTeamService.update(id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a team member',
    description: 'Remove a team member and their associated image',
  })
  @ApiParam({ name: 'id', description: 'Team member ID' })
  @ApiOkResponse({
    description: 'Team member deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
  })
  async remove(@Param('id') id: string): Promise<TResponse<any>> {
    return await this.ourTeamService.remove(id);
  }
}
