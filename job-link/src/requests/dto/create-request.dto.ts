import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { RequestStatus } from '../entities/request.entity';

export class CreateRequestDto {

  @IsString()
  @IsOptional() description?: string;

  @IsEnum(RequestStatus)
  @IsOptional() status?: RequestStatus;

  @IsNumber() userId: number;

  @IsNumber() serviceId: number;
}