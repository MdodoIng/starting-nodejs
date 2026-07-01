import {
  Controller, Get, Post, Body,
  UseGuards, Request
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';



@Controller('orders')
@UseGuards(JwtAuthGuard)    // ALL routes in this controller are now protected
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateOrderDto) {
    // req.user is set automatically by JwtStrategy.validate()
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAllForUser(req.user.id);
  }
}