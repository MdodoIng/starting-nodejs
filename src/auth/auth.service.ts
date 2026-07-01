import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto)

    // never return the password hash in responses
    const { password, ...result } = user;
    return result
  }

  async login(dto: CreateUserDto) {
    const user = await this.usersService.findByEmail(dto.email)

    // if user not found OR password wrong — same error message
    // (don't tell attacker which one failed)
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // JWT payload — what gets embedded inside the token
    const payload = { sub: user.id, email: user.email, role: user.role }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }

  }

}
