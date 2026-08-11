import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}