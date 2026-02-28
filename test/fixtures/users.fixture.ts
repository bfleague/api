export const DEFAULT_PROVIDER = 'discord';
export const ALTERNATE_PROVIDER = 'google';

export function userIdentityPath(
  provider: string,
  providerUserId: string,
): string {
  return `/users/provider/${provider}/${providerUserId}`;
}

export function userIdPath(userId: string): string {
  return `/users/${userId}`;
}
