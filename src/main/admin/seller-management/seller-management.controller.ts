import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateSellerDto } from './dto/seller.dto';
import { SellerManagementService } from './seller-management.service';

@ApiTags('Admin -- Seller Management')
@Controller('seller-management')
export class SellerManagementController {
  constructor(
    private readonly sellerManagementService: SellerManagementService,
  ) {}

  @Get('sellers')
  @ApiOperation({
    summary: 'Get all sellers with boat count and total sales value',
    description:
      'Returns a paginated list of all SELLER users including how many boats they have listed (ACTIVE/PENDING) and the total value of their listings.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'boatsCount', 'totalSalesValue', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiOkResponse({
    description: 'List of sellers retrieved successfully',
    example: {
      data: [
        {
          sellerId: 'usr_123abc',
          name: 'John Marine',
          email: 'john@boats.com',
          username: 'johnmarine',
          avatarUrl: 'https://example.com/avatars/john.jpg',
          isVerified: true,
          boatsCount: 15,
          totalSalesValue: 2850000.0,
          createdAt: '2024-06-15T10:30:00.000Z',
        },
      ],
      metadata: {
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Success (can return empty array)' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSellers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isVerified') isVerified?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.sellerManagementService.getAllSellers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      isVerified:
        isVerified !== undefined
          ? isVerified === true || isVerified === 'true'
          : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Patch('sellers/:sellerId')
  @ApiOperation({
    summary: 'Update a seller profile (Admin only or self-update)',
    description:
      'Allows updating seller details like name, email, phone, address, etc.',
  })
  @ApiParam({
    name: 'sellerId',
    type: 'string',
    description: 'UUID of the seller',
    example: 'usr_669f8a1c-8b2d-4f3a-9e1a-7d5f8e9c1b2a',
  })
  @ApiBody({
    type: UpdateSellerDto,
    description: 'Fields to update (all optional)',
    examples: {
      basic: {
        summary: 'Update name and phone',
        value: {
          name: 'John Marine Updated',
          phone: '+12025550123',
        },
      },
      full: {
        summary: 'Full profile update',
        value: {
          name: 'Miami Yacht Brokers',
          email: 'sales@miamiyachts.com',
          phone: '+13055551234',
          city: 'Miami',
          state: 'Florida',
          zip: '33139',
          avatarUrl: 'https://example.com/avatars/miami.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Seller updated successfully',
    schema: {
      example: {
        id: 'usr_669f8a1c-8b2d-4f3a-9e1a-7d5f8e9c1b2a',
        name: 'John Marine Updated',
        email: 'john@boats.com',
        phone: '+12025550123',
        status: 'ACTIVE',
        updatedAt: '2025-04-05T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Seller not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (e.g. duplicate email)',
  })
  async updateSeller(
    @Param('sellerId') sellerId: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return this.sellerManagementService.updateSeller(sellerId, updateSellerDto);
  }

  @Get('seller/:id')
  async getSellerById(@Param('id') id: string) {
    return this.sellerManagementService.getSellerById(id);
  }
}
