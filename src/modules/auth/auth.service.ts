import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import type { User } from '@prisma/client';
import type { RegisterDto, LoginDto } from './schemas/auth.schemas';
import * as bcrypt from 'bcrypt';

export interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.userService.create(dto);
    return this.generateToken(user);
  }

  async loginLocal(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateToken(user);
  }

  async validateOAuthUser(data: OAuthUserData): Promise<User> {
    let user = await this.userService.findByProviderId(
      data.provider,
      data.providerId,
    );

    if (user) return user;

    user = await this.userService.findByEmail(data.email);

    if (user) {
      if (!user.provider || !user.providerId) {
        return this.userService.linkOAuthAccount(user.id, data);
      }
      throw new UnauthorizedException(
        'Este e-mail já está vinculado a outra conta.',
      );
    }

    return this.userService.createOAuthUser(data);
  }

  loginOAuth(user: Pick<User, 'id' | 'email'>): { access_token: string } {
    return this.generateToken(user);
  }

  private generateToken(
    user: Pick<User, 'id' | 'email'>,
  ): { access_token: string } {
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }
}