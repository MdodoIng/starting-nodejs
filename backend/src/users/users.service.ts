import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) { }

  async create(dto: CreateUserDto): Promise<User> {
    // check if email already exists
    const exists = await this.repo.findOneBy({ email: dto.email })
    if (exists) throw new ConflictException('Email already registered');

    // never store plain text passwords — hash with bcrypt (10 salt rounds)
    const hashed = await bcrypt.hash(dto.password, 10)
    const user = this.repo.create({ email: dto.email, password: hashed });

    return this.repo.save(user)

  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email })
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<User> {
    const user = await this.repo.findOneBy({ id })
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.role = dto.role;
    return this.repo.save(user);
  }
}
