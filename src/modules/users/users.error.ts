export type UserAlreadyExistsError = {
  type: 'user_already_exists';
  discordId: string;
};
