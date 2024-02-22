import { Argon2id } from 'oslo/password';

/**
 * Hashes the password using Argon2id which is provided by the Oslo library
 * @param password - The password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string) => {
  return new Argon2id().hash(password);
};
