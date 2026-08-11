import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitch';
import { AuthService } from '../auth.service';

interface TwitchProfile {
  id: string;
  displayName?: string;
  login?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  provider: string;
}

@Injectable()
export class TwitchStrategy extends PassportStrategy(Strategy, 'twitch') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      callbackURL: process.env.TWITCH_CALLBACK_URL!,
      scope: 'user:read:email',
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: TwitchProfile,
    done: (error: Error | null, user?: unknown) => void,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException('Conta Twitch não possui e-mail associado.'),
      );
    }

    const name = profile.displayName || profile.login;
    if (!name) {
      return done(new UnauthorizedException('Perfil Twitch sem nome.'));
    }

    try {
      const user = await this.authService.validateOAuthUser({
        provider: 'twitch',
        providerId: profile.id,
        email,
        name,
        avatarUrl: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
      });
      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)));
    }
  }
}