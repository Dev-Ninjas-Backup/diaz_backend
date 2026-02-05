import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ValidateSuperAdmin,
  ValidateSuperAdminOnly,
} from '@/common/jwt/jwt.decorator';
import { AdminUserResponseDto, CreateAdminUserDto } from './dto/admin.dto';
import { changeRole } from './enum/changerole.enum';
import { UserPermissionsService } from './user-permissions.services';

@ApiTags('Admin -- User Permissions')
@Controller('user-permissions')
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsServices: UserPermissionsService,
  ) {}

  @ValidateSuperAdmin()
  @ApiBearerAuth()
  @Post('add-admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminUserDto })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully.',
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient permissions.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or username already exists.',
  })
  async addAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.userPermissionsServices.addAdmin(createAdminUserDto);
  }

  @ValidateSuperAdmin()
  @ApiBearerAuth()
  @Get('get-admins')
  @ApiOperation({ summary: 'Retrieve list of all admin users' })
  @ApiResponse({
    status: 200,
    description: 'List of admin users',
    type: [CreateAdminUserDto], // adjust if you have a response DTO
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient permissions.',
  })
  async getAdminUsers() {
    return this.userPermissionsServices.getAdmins();
  }

  @ValidateSuperAdminOnly()
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Change role of a user (SUPER_ADMIN only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID or number)' })
  @ApiQuery({
    name: 'changerole',
    enum: changeRole,
    description: 'New role to assign',
    example: changeRole.ADMIN,
  })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid role provided.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient permissions.',
  })
  async changeRole(
    @Query('changerole') role: changeRole,
    @Param('id') id: string,
  ) {
    if (!role || !Object.values(changeRole).includes(role as changeRole)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(changeRole).join(', ')}`,
      );
    }

    return this.userPermissionsServices.changeRole(id, role);
  }

  @ValidateSuperAdmin()
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Soft-delete or remove admin privileges from a user',
  })
  @ApiParam({ name: 'id', description: 'User ID to delete as admin' })
  @ApiResponse({ status: 200, description: 'Admin removed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteAdmin(@Param('id') id: string) {
    return this.userPermissionsServices.deleteAdmin(id);
  }
}
