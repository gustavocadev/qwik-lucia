import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const libsqlClient = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(libsqlClient);
