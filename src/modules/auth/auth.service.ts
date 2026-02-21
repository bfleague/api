import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServiceJwtPayload } from './types/service-token.type';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  signServiceToken(serviceName: string, tenant: string, role?: string) {
    const payload: Omit<ServiceJwtPayload, 'iat' | 'exp'> = {
      service: serviceName,
      tenant,
      role,
    };

    return this.jwt.sign(payload);
  }
}
