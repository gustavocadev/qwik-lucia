import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { sessionTable, userTable, SelectUser } from "./schema";
import { Lucia } from "lucia";
import { qwikLuciaConfig } from "qwik-lucia";

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

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

// IMPORTANT! Configure Qwik to use Lucia for handling requests
export const { handleRequest } = qwikLuciaConfig(lucia);

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<SelectUser, "id">;
  }
}
