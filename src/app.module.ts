import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuModule } from './menu/menu.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './menu/entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "whatabyte.sqlite",
      entities: [MenuItem],
      synchronize: true
    })
    ,
    MenuModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
