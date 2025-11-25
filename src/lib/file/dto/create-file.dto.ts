import { IsEnum, IsNumber, IsString } from 'class-validator';
import { FileType } from 'generated/client';

export class CreateFileDto {
  @IsString()
  filename: string;

  @IsString()
  originalFilename: string;

  @IsString()
  path: string;

  @IsString()
  url: string;

  @IsEnum(FileType)
  fileType: FileType;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;
}
