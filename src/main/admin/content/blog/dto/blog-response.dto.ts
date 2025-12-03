import { ApiProperty } from '@nestjs/swagger';

export class BlogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  blogTitle: string;

  @ApiProperty()
  blogDescription: string;

  @ApiProperty()
  sharedLink?: string;

  @ApiProperty()
  postStatus: string;

  @ApiProperty()
  blogImageUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
