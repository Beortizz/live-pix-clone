import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';
import type { OAuthUserData } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

type SafeUser = Omit<User, 'password'>;

type CreateUserData = { email: string; name: string; password: string };

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const { password: _, ...user } = await this.prisma.user.create({
        data: { email: data.email, name: data.name, password: hashedPassword },
      });
      return user;
    } catch {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { provider, providerId } });
  }

  async createOAuthUser(data: OAuthUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        provider: data.provider,
        providerId: data.providerId,
        avatarUrl: data.avatarUrl,
        password: null,
      },
    });
  }

  async linkOAuthAccount(userId: string, data: OAuthUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        provider: data.provider,
        providerId: data.providerId,
        avatarUrl: data.avatarUrl ?? undefined,
      },
    });
  }
}