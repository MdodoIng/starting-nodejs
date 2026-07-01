import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private repo: Repository<Order>,
    private productsService: ProductsService,
  ) { }

  async create(dto: CreateOrderDto, user: User) {
    const products = await this.productsService.findByIds(dto.productIds)

    if (!products.length) throw new NotFoundException('No products found');

    const total = products.reduce((sum, p) => sum + Number(p.price), 0)

    const order = this.repo.create({ user, products, total })

    return this.repo.save(order)

  }

  findAllForUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['products'],   // tells TypeORM to JOIN and include products
    })
  }

}
