import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Get()
  findByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.userService.findById(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ranking')
  getMyRanking(@CurrentUser() user: any, @Query('gameName') gameName: string) {
    return this.leaderboardService.getUserRanking(user.userId, gameName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ranking/:gameName')
  getTopPlayers(@Param('gameName') gameName: string) {
    return this.leaderboardService.getGameLeaderboard(gameName, 10);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
