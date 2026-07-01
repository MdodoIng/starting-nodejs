import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ProductsModule,           // import so we can use ProductsService here
    AuthModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule { }
