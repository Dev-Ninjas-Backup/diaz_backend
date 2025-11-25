import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus } from 'generated/client';

export class GetSellerInvoicesDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Optional search term for filtering results (supports partial match, case-insensitive)',
    example: 'Sapphire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Boat status to filter by',
    enum: InvoiceStatus,
    example: InvoiceStatus.PAID,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string' && value in InvoiceStatus) {
      return value.toUpperCase() as InvoiceStatus;
    }
    return value;
  })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
