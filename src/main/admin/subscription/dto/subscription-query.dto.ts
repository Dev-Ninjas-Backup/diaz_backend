import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SubscriptionStatus } from 'generated/client';

export class SubscriptionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @Transform(({ value }) => (value == '' ? undefined : value))
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
