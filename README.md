# Qwik Lucia

Qwik Lucia is a library that helps you to integrate [Lucia](https://lucia-auth.com/) with your Qwik project.

- No more configuration
- Fully typed
- Extensive database support out of the box

```ts
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { sessionTable, userTable, SelectUser } from './schema';
import { Lucia } from 'lucia';
import { qwikLuciaConfig } from 'qwik-lucia';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === 'production',
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
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<SelectUser, 'id'>;
  }
}
```

## Installation

```sh
npm i lucia
pnpm add lucia
bun add lucia
yarn add lucia
```
