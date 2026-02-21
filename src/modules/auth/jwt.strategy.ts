import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceJwtPayload } from './types/service-token.type';
import { EnvSchema } from '../../env/env.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<EnvSchema, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_PUBLIC_KEY', { infer: true }),
      algorithms: [config.getOrThrow('JWT_ALGO', { infer: true }) as 'RS256'],
      issuer: config.getOrThrow('JWT_ISS', { infer: true }),
      audience: config.getOrThrow('JWT_AUD', { infer: true }),
    });
  }

  validate(payload: ServiceJwtPayload) {
    if (!payload.service || !payload.tenant) {
      throw new UnauthorizedException('Invalid service identity');
    }

    return payload;
  }
}
