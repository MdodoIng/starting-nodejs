import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private repo;
    constructor(repo: Repository<Product>);
    findAll(): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    findByIds(ids: string[]): Promise<Product[]>;
    create(dto: CreateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
}
