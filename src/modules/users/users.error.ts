export type UserAlreadyExistsError = {
  type: 'user_already_exists';
};

export type UserNotFoundError = {
  type: 'user_not_found';
  discordId: string;
};
