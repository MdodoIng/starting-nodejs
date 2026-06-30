import { MenuItem } from './entities/menu-item.entity';
import { Repository } from 'typeorm';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuService {
    private menuRepository;
    constructor(menuRepository: Repository<MenuItem>);
    findAll(): Promise<MenuItem[]>;
    findOne(id: string): Promise<MenuItem>;
    create(dto: CreateMenuItemDto): Promise<MenuItem>;
    update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem>;
    remove(id: string): Promise<void>;
}
