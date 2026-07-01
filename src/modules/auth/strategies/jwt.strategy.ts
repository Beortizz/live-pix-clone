// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret_para_dev',
    });
  }

  validate(payload: { sub: string; email: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    // O objeto retornado aqui é injetado em 'req.user' nas rotas protegidas
    return { id: payload.sub, email: payload.email };
  }
}
