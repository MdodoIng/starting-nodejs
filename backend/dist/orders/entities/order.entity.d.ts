import { User } from "../../users/entities/user.entity";
import { Product } from '../../products/entities/product.entity';
export declare class Order {
    id: string;
    user: User;
    products: Product[];
    total: number;
    status: string;
    createdAt: Date;
}
