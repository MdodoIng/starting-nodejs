import { IsNumber } from 'class-validator';

export class CreateScoreDto {
  @IsNumber()
  value: number;
}
