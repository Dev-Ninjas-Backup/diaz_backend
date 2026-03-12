import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileInstanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;
}

export class OurTeamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  designation: string;

  @ApiPropertyOptional({
    description: 'Short biography of the team member',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Email address of the team member',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Contact/phone number of the team member',
  })
  contact?: string;

  @ApiPropertyOptional({ type: FileInstanceDto })
  image?: FileInstanceDto;

  @ApiProperty()
  order: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
