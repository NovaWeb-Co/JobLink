import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty() name: string;

  @IsString()
  @IsNotEmpty() lastname: string;

  @IsEmail() email: string;

  @IsString()
  @MinLength(6) password: string;

  @IsString()
  @IsOptional() phone?: string;

  @IsString()
  @IsOptional() address?: string;

  @IsString()
  @IsOptional() profilePhoto?: string;

}