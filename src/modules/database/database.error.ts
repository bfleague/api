export type PersistenceError = {
  type: 'persistence_error';
  cause: unknown;
  code?: string;
};
