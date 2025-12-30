import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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
    type: 'string',
    format: 'binary',
    description: 'Team member image file',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the team member is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
