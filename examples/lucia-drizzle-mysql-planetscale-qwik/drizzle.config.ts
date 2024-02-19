import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

// if your have a eslint error make sure to add the following line `"files":["./drizzle.config.ts"]` in your tsconfig.json file
export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    uri: process.env.DATABASE_URL!,
  },
} satisfies Config;
