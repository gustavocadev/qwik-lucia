import { varchar, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Docs: https://lucia-auth.com/database/drizzle
export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  password: text("password").notNull(),
  username: text("username").notNull(),
  // other user attributes
  name: varchar("name", {
    length: 255,
  }),
  lastName: varchar("last_name", {
    length: 255,
  }),
  email: varchar("email", {
    length: 255,
  }),
});
export type SelectUser = typeof userTable.$inferSelect;

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
export type SelectSession = typeof sessionTable.$inferSelect;
