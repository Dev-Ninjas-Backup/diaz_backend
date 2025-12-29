import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    type: 'string',
    format: 'binary',
    description: 'Team member image file',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
