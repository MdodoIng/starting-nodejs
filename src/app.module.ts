import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "shopnest.sqlite",
      autoLoadEntities: true, // automatically picks up entities registered via forFeature()
      synchronize: true  // dev only — auto creates/updates tables
    }),
    UsersModule, ProductsModule, OrdersModule, AuthModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
