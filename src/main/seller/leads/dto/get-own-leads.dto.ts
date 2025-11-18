import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSellerLeadsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Boat name to search for',
    example: 'Sapphire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Boat listing id to search for',
    example: 'a2a3e3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a',
  })
  @IsOptional()
  @IsString()
  listingId?: string;
}
