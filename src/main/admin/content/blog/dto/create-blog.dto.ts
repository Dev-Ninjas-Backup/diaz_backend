import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from 'generated/client';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  blogDescription: string;

  @ApiProperty({ enum: PostStatus, example: 'DRAFT', required: true })
  @IsEnum(PostStatus)
  postStatus: PostStatus;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  blogImage?: Express.Multer.File;
}
