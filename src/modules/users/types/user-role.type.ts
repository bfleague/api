export const USER_ROLES = ['admin', 'mod', 'default'] as const;

export type UserRole = (typeof USER_ROLES)[number];
