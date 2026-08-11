import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    _req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: any) => void,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException('Conta Google não possui e-mail associado.'),
      );
    }

    try {
      const user = await this.authService.validateOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email,
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
      });
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
}