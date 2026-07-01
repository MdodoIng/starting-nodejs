import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        role: string;
        orders: import("../orders/entities/order.entity").Order[];
    }>;
    login(dto: CreateUserDto): Promise<{
        access_token: string;
    }>;
}
