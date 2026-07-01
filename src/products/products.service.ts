import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) { }

  findAll() { return this.repo.find(); }

  async findOne(id: string) {
    const p = await this.repo.findOneBy({ id });
    if (!p) throw new NotFoundException(`Product ${id} not found`);
    return p;
  }

  findByIds(ids: string[]) {
    return this.repo.findBy(ids.map(id => ({ id })));
  }

  create(dto: CreateProductDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}