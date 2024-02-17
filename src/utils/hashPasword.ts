import { Argon2id } from 'oslo/password';

export const hashPassword = async (password: string) => {
  return new Argon2id().hash(password);
};
