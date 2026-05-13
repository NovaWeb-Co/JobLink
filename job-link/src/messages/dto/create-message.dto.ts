import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {

  @IsString()  content: string;

  @IsBoolean()
  @IsOptional()  isRead?: boolean;

  @IsNumber()  senderId: number;

  @IsNumber()  receiverId: number;
}