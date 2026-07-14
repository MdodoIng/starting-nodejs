import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
