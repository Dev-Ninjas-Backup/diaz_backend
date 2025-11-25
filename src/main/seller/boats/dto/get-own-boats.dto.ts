import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BoatListingStatus } from 'generated/client';

export class GetOwnBoatsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Boat name to search for',
    example: 'Sapphire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Boat status to filter by',
    enum: BoatListingStatus,
    example: BoatListingStatus.ACTIVE,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string' && value in BoatListingStatus) {
      return value.toUpperCase() as BoatListingStatus;
    }
    return value;
  })
  @IsEnum(BoatListingStatus)
  status: BoatListingStatus;
}
