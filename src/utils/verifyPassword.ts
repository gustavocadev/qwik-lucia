import { Argon2id } from 'oslo/password';

/**
 * Verifies the password using Argon2id which is provided by the Oslo library
 * @param passwordHash - The hashed password
 * @param password - The password to verify
 * @returns Whether the password is valid
 * @example
 * ```ts
 * const passwordHash = await hashPassword('password');
 * const isValid = await verifyPassword(passwordHash, 'password');
 * if (!isValid) {
 *  console.log('Invalid password');
 * }
 *```
 * @example
 * ```ts
 * const passwordHash = await hashPassword('password');
 * const isValid = await verifyPassword(passwordHash, 'password');
 * if (isValid) {
 *  console.log('Valid password');
 * }
 * ```
 */

export const verifyPassword = async (
  passwordHash: string,
  password: string
) => {
  return new Argon2id().verify(passwordHash, password);
};
