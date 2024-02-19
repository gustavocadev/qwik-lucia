import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./drizzle/db";
import { sessionTable, userTable, SelectUser } from "./drizzle/schema";
import { Lucia } from "lucia";
import { qwikLuciaConfig } from "qwik-lucia";

const adapter = new DrizzleMySQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

// IMPORTANT! Here we need to use `qwikLuciaConfig` to correctly configure the `handleRequest` function
export const { handleRequest } = qwikLuciaConfig(lucia);

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<SelectUser, "id">;
  }
}