import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Repository } from 'typeorm';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
  ) { }

  findAll(): Promise<MenuItem[]> {
    return this.menuRepository.find()
  }

  async findOne(id: string): Promise<MenuItem> {
    const item = await this.menuRepository.findOneBy({ id })
    if (!item) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
    return item
  }

  create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuRepository.create(dto)

    return this.menuRepository.save(item)
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.menuRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.menuRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
  }


}
