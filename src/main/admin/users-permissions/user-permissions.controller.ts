import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateAdminUserDto } from './dto/admin.dto';
import { UserPermissionsService } from './user-permissions.services';
import { changeRole } from './enum/changerole.enum';
import { RoleAuthGuard } from '@/common/guard/role-auth.guard';
import { UserRole } from 'generated/enums';

@ApiTags('Admin -- User Permissions')
@Controller('user-permissions')
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsServices: UserPermissionsService,
  ) {}

  @Post('add-admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminUserDto })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async addAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.userPermissionsServices.addAdmin(createAdminUserDto);
  }

  @Get('get-admins')
  @ApiOperation({ summary: 'Retrieve list of all admin users' })
  @ApiResponse({
    status: 200,
    description: 'List of admin users',
    type: [CreateAdminUserDto], // adjust if you have a response DTO
  })
  async getAdminUsers() {
    return this.userPermissionsServices.getAdmins();
  }

  @UseGuards(new RoleAuthGuard([UserRole.SUPER_ADMIN]))
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

  @Patch('delete/:id')
  @ApiOperation({
    summary: 'Soft-delete or remove admin privileges from a user',
  })
  @ApiParam({ name: 'id', description: 'User ID to delete as admin' })
  @ApiResponse({ status: 200, description: 'Admin removed successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteAdmin(@Param('id') id: string) {
    return this.userPermissionsServices.deleteAdmin(id);
  }
}
