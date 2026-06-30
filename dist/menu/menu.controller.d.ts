import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    findAll(): Promise<import("./entities/menu-item.entity").MenuItem[]>;
    findOne(id: string): Promise<import("./entities/menu-item.entity").MenuItem>;
    create(dto: CreateMenuItemDto): Promise<import("./entities/menu-item.entity").MenuItem>;
    update(id: string, dto: UpdateMenuItemDto): Promise<import("./entities/menu-item.entity").MenuItem>;
    remove(id: string): Promise<void>;
}
