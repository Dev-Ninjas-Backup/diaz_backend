import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAdminUsersDto } from './dto/admin.dto';
import { UserPermissionsService } from './user-permissions.services';

@Controller('user-permissions')
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsServices: UserPermissionsService,
  ) {}

  @Get('admins')
  @ApiOperation({
    summary: 'Get all users with ADMIN or SUPER_ADMIN role',
    description:
      'Returns a list of users who have elevated privileges (ADMIN and SUPER_ADMIN).',
  })
  @ApiOkResponse({
    description: 'List of admin users retrieved successfully',
    type: [GetAdminUsersDto], // Shows array + fields in Swagger UI
    example: [
      {
        id: 1,
        email: 'super@example.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
      },
      {
        id: 2,
        name: 'Site Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    ],
  })
  @ApiResponse({
    status: 204,
    description: 'No admin users found (empty list)',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAdminUsers() {
    // Placeholder logic - replace with actual implementation
    return this.userPermissionsServices.getAdminUsers();
  }
}
