import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  Link,
} from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
// qwik-lucia under the hood uses oslo library which is a the library that lucia-auth uses
import { verifyPassword } from 'qwik-lucia';
import { db } from '~/lib/drizzle/db';
import { userTable } from '~/lib/drizzle/schema';
import { handleRequest, lucia } from '~/lib/lucia';

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();
  if (session) {
    throw event.redirect(303, '/');
  }

  return {};
});

export const useLoginAction = routeAction$(
  async (values, event) => {
    const authRequest = handleRequest(event);

    // 1. Find user by username
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, values.username));

    // 2. Check if user exists
    if (!user) {
      return event.fail(401, {
        msg: 'Invalid username or password',
      });
    }
    // 3. Check if password is correct)
    const isPasswordValid = await verifyPassword(
      user.passwordHash,
      values.password
    );

    if (!isPasswordValid) {
      return event.fail(401, {
        msg: 'Invalid username or password',
      });
    }

    // 4. Create session
    const session = await lucia.createSession(user.id, {});
    authRequest.setSession(session);

    throw event.redirect(303, '/');
  },
  zod$({
    username: z.string(),
    password: z.string(),
  })
);

export default component$(() => {
  const loginAction = useLoginAction();
  return (
    <>
      <Form action={loginAction} class="form-control max-w-lg mx-auto mt-32">
        <label for="username" class="label">
          Username
        </label>
        <input id="username" name="username" class="input bg-base-200" />

        <label for="password" class="label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          class="input bg-base-200"
        />

        <button type="submit" class="btn btn-primary my-2">
          Login
        </button>

        <p class="py-4">
          Dont have an account?{' '}
          <Link href="/signup" class="link-primary">
            Signup
          </Link>
        </p>
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Login Page',
  meta: [
    {
      name: 'description',
      content: 'This is the login page',
    },
  ],
};
