import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
export declare class OrdersService {
    private repo;
    private productsService;
    constructor(repo: Repository<Order>, productsService: ProductsService);
    create(dto: CreateOrderDto, user: User): Promise<Order>;
    findAllForUser(userId: string): Promise<Order[]>;
}
