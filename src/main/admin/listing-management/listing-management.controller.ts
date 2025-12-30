import { GetUser, ValidateSuperAdmin } from '@/common/jwt/jwt.decorator';
import { FileType, MulterService } from '@/lib/multer/multer.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { CreateBoatsInfoDto } from '@/main/seller/boats/dto/boats-info.dto';
import { BoatListingDto } from '@/main/seller/boats/dto/boats.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BoatImageType } from 'generated/enums';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AdminCreateListingService } from './services/admincreate-listing.service';
import { ListingManagementService } from './services/listing-management.service';

@ApiTags('Admin -- Listing Management')
@Controller('admin/listings')
export class ListingManagementController {
  constructor(
    private readonly service: ListingManagementService,
    private readonly AdminCreateListingService: AdminCreateListingService,
  ) {}

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

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @ApiOperation({ summary: 'Create admin Boat Listing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BoatListingDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'covers', maxCount: 5 },
        { name: 'galleries', maxCount: 70 },
      ],
      new MulterService().createMultipleFileOptions({
        destinationFolder: './temp',
        prefix: 'boat_listing',
        fileType: FileType.IMAGE,
        maxFileCount: 75,
      }),
    ),
  )
  @Post('admin-create-listing')
  async admincreateListing(
    @GetUser('sub') userId: string,
    @Body()
    data: {
      boatInfo: CreateBoatsInfoDto;
    },
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    const mappedFiles: QueueFile[] = [
      ...(files.covers || []).map((file) => ({
        path: file.path,
        type: BoatImageType.COVER,
        originalName: file.originalname,
      })),
      ...(files.galleries || []).map((file) => ({
        path: file.path,
        type: BoatImageType.GALLERY,
        originalName: file.originalname,
      })),
    ];
    return this.AdminCreateListingService.admincreateListing(
      userId,
      data,
      mappedFiles,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a yacht listing' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
