import { IsArray, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsUUID('all', { each: true })  // validates every item in array is a UUID
  productIds: string[];
}