import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

export const userTable = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId(15)),
  passwordHash: text("passwordHash").notNull(),
  username: text("username").notNull(),
  // other user attributes
  name: text("name", {
    length: 255,
  }),
  lastName: text("last_name", {
    length: 255,
  }),
  email: text("email", {
    length: 255,
  }),
});

export type SelectUser = typeof userTable.$inferSelect;

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export type SelectSession = typeof sessionTable.$inferSelect;
