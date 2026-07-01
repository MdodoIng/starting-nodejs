import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // both guards on every route
export class UsersController {
  constructor(private readonly service: UsersService) { }

  @Get()
  @Roles(Role.Admin) // only admin can list all users
  findAll() {
    return this.service.findAll()
  }

  @Patch(":id/role")
  @Roles(Role.Admin)
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.service.updateRole(id, dto)
  }

}
