import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async create(dto: CreateGameDto): Promise<Game> {
    const existing = await this.gameRepo.findOne({ where: { name: dto.name } });
    if (existing)
      throw new ConflictException('A game with this name already exists');

    const game = this.gameRepo.create(dto);
    return this.gameRepo.save(game);
  }

  async findById(id: number): Promise<Game> {
    const game = await this.gameRepo.findOne({ where: { id } });
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async findByName(name: string): Promise<Game> {
    const game = await this.gameRepo.findOne({ where: { name } });
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async update(id: number, dto: UpdateGameDto): Promise<Game> {
    const game = await this.findById(id);
    Object.assign(game, dto);
    return this.gameRepo.save(game);
  }

  async remove(id: number): Promise<void> {
    const result = await this.gameRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Game not found');
  }
}
