import { UserRole } from './user-role.type';

export type User = {
  id: string;
  tenant: string;
  provider: string;
  providerUserId: string;
  username: string;
  role: UserRole;
  createdAt: Date;
};
