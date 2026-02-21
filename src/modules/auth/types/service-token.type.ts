export type ServiceJwtPayload = {
  service: string;
  tenant: string;
  role?: string;
  iat: number;
  exp: number;
};
