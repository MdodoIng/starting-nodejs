import { Order } from '../../orders/entities/order.entity';
export declare class Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    orders: Order[];
}
