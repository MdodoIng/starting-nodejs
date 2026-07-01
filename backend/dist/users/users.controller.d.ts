import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<import("./entities/user.entity").User>;
}
