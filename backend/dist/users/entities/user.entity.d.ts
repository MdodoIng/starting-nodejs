import { Order } from '../../orders/entities/order.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    role: string;
    orders: Order[];
}
