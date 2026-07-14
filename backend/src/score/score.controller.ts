import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('score')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  submit(
    @CurrentUser() user: any,
    @Query('gameName') gameName: string,
    @Body() dto: CreateScoreDto,
  ) {
    return this.scoreService.submit(user.userId, gameName, dto);
  }

  @Get()
  findHighestScores(
    @Query('gameName') gameName: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.scoreService.findHighestScores(gameName, limit);
  }

  @Get('top-players')
  topPlayersReport(
    @Query('gameId', ParseIntPipe) gameId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.scoreService.topPlayersReport(
      gameId,
      new Date(startDate),
      new Date(endDate),
      limit,
    );
  }
}
