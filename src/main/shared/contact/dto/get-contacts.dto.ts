import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ContactSource, ContactType } from 'generated/client';

export class GetContactsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: ContactSource,
    description: 'Filter by contact source',
  })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @ApiPropertyOptional({
    enum: ContactType,
    description: 'Filter by contact type',
  })
  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;
}
