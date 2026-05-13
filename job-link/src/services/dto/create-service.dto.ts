import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {

    @IsString()
    @IsNotEmpty() title: string;

    @IsString()
    @IsNotEmpty() description: string;

    @IsString()
    @IsNotEmpty() category: string;

    @IsNumber() price: number;

    @IsString()
    @IsOptional() location?: string;

    @IsBoolean()
    @IsOptional() availability?: boolean;

    @IsNumber() userId: number;
}