# Qwik Lucia

Qwik Lucia is a library that helps you to integrate [Lucia](https://lucia-auth.com/) with your Qwik project.

- No more configuration

## Installation

```sh
npm i qwik-lucia
pnpm add qwik-lucia
bun add qwik-lucia
yarn add qwik-lucia
```

## Setup Qwik Lucia

In this example, we will use the `@lucia-auth/adapter-drizzle` adapter to connect to a PostgreSQL database.

> For simplicity, we won't show the imports that are not related to the `qwik-lucia` or `lucia` package.

```ts
// src/server/lucia.ts
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
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

/*
IMPORTANT!
Here we need to use `qwikLuciaConfig` to correctly configure the `handleRequest` function
*/
export const { handleRequest } = qwikLuciaConfig(lucia);

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<SelectUser, 'id'>;
  }
}
```

### Set `user` and `session` in SharedMap on every request using `onRequest` handler

```tsx
// src/routes/layout.tsx
import type { RequestHandler } from '@builder.io/qwik-city';
import { handleRequest } from '~/server/lucia';

// Run on every request
export const onRequest: RequestHandler = async ({ cookie, sharedMap }) => {
  const authRequest = handleRequest({ cookie });
  const { user, session } = await authRequest.validateUser();

  // share the user and session with the rest of the app
  sharedMap.set('user', user);
  sharedMap.set('session', session);
};
```

### Signup

```tsx
// src/routes/signup/index.tsx
import { handleRequest, lucia } from "~/lib/lucia";

// This is just a wrapper around the oslo/password library
import { hashPassword } from 'qwik-lucia';

export const useSignupUser = routeAction$(
  async (values, { redirect }) => {
    try {
      const passwordHash = await hashPassword(values.password);

      await db.insert(userTable).values({
        username: values.username,
        password: passwordHash,
      });
    } catch (e) {
      ... // handle error
    }
    // make sure you don't throw inside a try/catch block!
    throw redirect(303, '/');
  },
  // validate the input
  zod$({
    username: z.string().min(2),
    password: z.string().min(5),
  })
);
```

### Login

```tsx
// src/routes/login/index.tsx
import { handleRequest, lucia } from "~/server/lucia";

// This is just a wrapper around the oslo/password library
import { verifyPassword } from 'qwik-lucia';

export const useLoginAction = routeAction$(
  async (values, { cookie, fail }) => {
    // Important! Use `handleRequest` to handle the authentication request
    const authRequest = handleRequest({ cookie });

    try {
      //1. search for user
      const [user] = await db
        .select({
          id: userTable.id,
          passwordHash: userTable.password,
          username: userTable.username,
        })
        .from(userTable)
        .where(eq(userTable.username, values.username));

      //2. if user is not found, throw error
      if (!user) {
        return fail(400, {
          message: 'Incorrect username or password',
        });
      }

      // 3. validate password
      const isValidPassword = await verifyPassword(
        user.passwordHash,
        values.password
      );

      if (!isValidPassword) {
        return fail(400, {
          message: 'Incorrect username or password',
        });
      }

      // 4. create session
      const session = await lucia.createSession(user.id, {});

      authRequest.setSession(session); // set session cookie
    } catch (e) {
       ... // handle error
    }
    // make sure you don't throw inside a try/catch block!
    throw event.redirect(303, '/');
  },
  // validate the input
  zod$({
    username: z.string(),
    password: z.string(),
  })
);
```

### Logout

```tsx
// src/routes/index.tsx
import { handleRequest } from '~/server/lucia';

// Create a user logout action
export const useLogoutUserAction = routeAction$(
  async (values, { cookie, sharedMap, redirect }) => {
    const authRequest = handleRequest({ cookie });
    const session = sharedMap.get('session');

    if (!session) throw redirect(302, '/login');

    // Remove the session from the database and from the cookie - Logout
    await authRequest.invalidateSessionCookie(session);

    throw redirect(302, '/login');
  }
);
```

### Get User and Session from SharedMap

```tsx
const user = sharedMap.get('user');
const session = sharedMap.get('session');
```

Example

```tsx
export const isUserLoggedIn = routeLoader$(async ({ sharedMap, redirect }) => {
  const user = sharedMap.get('user');
  const session = sharedMap.get('session');

  if (!user || !session) {
    throw redirect(302, '/login');
  }

  return {};
});
```
