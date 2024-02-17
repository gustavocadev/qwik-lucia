import { Argon2id } from 'oslo/password';

export const verifyPassword = async (
  passwordHash: string,
  password: string
) => {
  return new Argon2id().verify(passwordHash, password);
};
