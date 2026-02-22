import { UserRole } from './user-role.type';

export type User = {
  id: string;
  tenant: string;
  discordId: string;
  username: string;
  role: UserRole;
  createdAt: Date;
};
