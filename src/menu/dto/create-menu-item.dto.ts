import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  name: string

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsString()
  image?: string;
}