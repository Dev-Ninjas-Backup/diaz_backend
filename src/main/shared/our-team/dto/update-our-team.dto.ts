import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/client';

export class UpdateOurTeamDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Name of the team member',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Chief Executive Officer',
    description: 'Designation of the team member',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    example: 'Seasoned professional with 15+ years in the boating industry.',
    description: 'Short biography of the team member',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address of the team member',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '+1 234 567 8900',
    description: 'Contact/phone number of the team member',
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image file',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiPropertyOptional({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site this team member belongs to (FLORIDA or JUPITER)',
  })
  @IsOptional()
  site?: SiteType;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the team member is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
