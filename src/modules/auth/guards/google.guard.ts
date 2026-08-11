import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    _info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error`);
      return null as TUser;
    }
    return user;
  }
}