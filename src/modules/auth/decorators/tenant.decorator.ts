import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ServiceJwtPayload } from '../types/service-token.type';

type RequestWithServiceUser = Request & {
  user?: ServiceJwtPayload;
};

export const Tenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithServiceUser>();
    const tenant = request.user?.tenant;

    if (!tenant) {
      throw new UnauthorizedException(
        'Missing tenant in authenticated service token',
      );
    }

    return tenant;
  },
);
