import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RegisterSchema, LoginSchema } from './schemas/auth.schemas';
import type { RegisterDto, LoginDto } from './schemas/auth.schemas';
import { GoogleAuthGuard, GoogleCallbackGuard } from './guards/google.guard';
import { TwitchAuthGuard, TwitchCallbackGuard } from './guards/twitch.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import type { User } from '@prisma/client';

type OAuthUser = Omit<User, 'password'>;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.loginLocal(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  googleCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) return;
    const token = this.authService.loginOAuth(req.user as OAuthUser);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token.access_token}`);
  }

  @Get('twitch')
  @UseGuards(TwitchAuthGuard)
  twitchLogin() {}

  @Get('twitch/callback')
  @UseGuards(TwitchCallbackGuard)
  twitchCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) return;
    const token = this.authService.loginOAuth(req.user as OAuthUser);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token.access_token}`);
  }
}