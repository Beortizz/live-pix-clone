// src/modules/user/user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client'; // Tipo real do banco
import { CreateUserDto } from './dto/create-user.dto'; // Crie este arquivo ou interface
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
        },
      });
    } catch {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
