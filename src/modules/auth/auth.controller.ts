// src/modules/auth/auth.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Rota Protegida Exemplo
   * Só acessível se enviar o cabeçalho 'Authorization: Bearer <JWT>'
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Ativa a validação do JwtStrategy nesta rota
  getProfile(@Req() req: Request) {
    // O req.user foi injetado pelo método 'validate' da JwtStrategy
    return req.user;
  }
}
