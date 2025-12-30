import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { BoatsInfoDto } from './boats-info.dto';
import { BoatListingFilesDto, UpdateBoatEngineDto } from './boats.dto';

export class UpdateListingDto extends BoatsInfoDto {
  @ApiProperty({
    type: 'array',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description:
      'UUID of images to delete. To replace a cover photo: (1) provide the old cover photo UUID in this array, (2) upload the new cover photo in the covers field',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  imagesToDelete: string[];

  @ApiPropertyOptional({
    type: [UpdateBoatEngineDto],
    description: 'Optional inline engine objects',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBoatEngineDto)
  engines?: UpdateBoatEngineDto[];
}

export class UpdateListingDtoWithImagesDto extends PartialType(
  UpdateListingDto,
) {}

export class UpdateListingDtoWithFilesDto extends BoatListingFilesDto {
  @ApiPropertyOptional({ type: UpdateListingDtoWithImagesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateListingDtoWithImagesDto)
  boatInfo: UpdateListingDtoWithImagesDto;
}
