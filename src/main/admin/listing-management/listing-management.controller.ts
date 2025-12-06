import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingManagementService } from './services/listing-management.service';

@ApiTags('Listing Management')
@Controller('admin/listings')
export class ListingManagementController {
  constructor(private readonly service: ListingManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all yacht listings' })
  getAll(@Query() query: ListingFilterDto) {
    return this.service.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single yacht listing by ID' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a yacht listing' })
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a yacht listing' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
