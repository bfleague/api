import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../env/env.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema, true>) => ({
        privateKey: config.getOrThrow('JWT_PRIVATE_KEY', { infer: true }),
        publicKey: config.getOrThrow('JWT_PUBLIC_KEY', { infer: true }),
        signOptions: {
          algorithm: config.getOrThrow('JWT_ALGO', { infer: true }) as 'RS256',
          issuer: config.getOrThrow('JWT_ISS', { infer: true }),
          audience: config.getOrThrow('JWT_AUD', { infer: true }),
          expiresIn: config.getOrThrow('JWT_EXP', { infer: true }),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
