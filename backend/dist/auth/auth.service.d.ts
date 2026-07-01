import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
