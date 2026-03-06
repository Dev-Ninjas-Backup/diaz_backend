import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/client';

export class CreateOurTeamDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the team member' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Chief Executive Officer',
    description: 'Designation of the team member',
  })
  @IsNotEmpty()
  @IsString()
  designation: string;

  @ApiPropertyOptional({
    example: 'Seasoned professional with 15+ years in the boating industry.',
    description: 'Short biography of the team member',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site this team member belongs to (FLORIDA or JUPITER)',
  })
  @IsOptional()
  site?: SiteType;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image file',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
