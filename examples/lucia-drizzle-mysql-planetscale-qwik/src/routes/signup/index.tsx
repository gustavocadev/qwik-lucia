import { component$ } from '@builder.io/qwik';
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  routeLoader$,
  Link,
} from '@builder.io/qwik-city';
import { generateId } from 'lucia';
import { hashPassword } from 'qwik-lucia';
import { db } from '~/lib/drizzle/db';
import { userTable } from '~/lib/drizzle/schema';
import { handleRequest, lucia } from '~/lib/lucia';

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const session = await authRequest.validateUser();
  if (session) {
    throw event.redirect(303, '/');
  }

  return {};
});

export const useSignupUser = routeAction$(
  async (values, event) => {
    const authRequest = handleRequest(event);

    // 1. Hash the password
    const passwordHash = await hashPassword(values.password);
    // 2. generate user id
    const userId = generateId(15);
    // 3. create user
    await db.insert(userTable).values({
      id: userId,
      username: values.username,
      firstName: values.firstName,
      passwordHash: passwordHash,
      lastName: values.lastName,
    });
    // 4. create session
    const session = await lucia.createSession(userId, {});
    authRequest.setSession(session);

    // redirect to home page
    throw event.redirect(303, '/');
  },
  zod$({
    username: z.string().min(2),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  })
);

export default component$(() => {
  const signupUserAction = useSignupUser();
  return (
    <>
      <Form
        action={signupUserAction}
        class="form-control max-w-lg mx-auto mt-32"
      >
        <label for="firstName" class="label">
          Nombres
        </label>
        <input
          type="text"
          name="firstName"
          class="input bg-base-200"
          id="firstName"
        />

        <label for="lastName" class="label">
          Apellidos
        </label>
        <input
          type="text"
          name="lastName"
          class="input bg-base-200"
          id="lastName"
        />

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
          Signup
        </button>

        <p class="py-4">
          Already have an account?{' '}
          <Link href="/login/" class="link-primary">
            Login
          </Link>
        </p>
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Signup Page',
  meta: [
    {
      name: 'description',
      content: 'This is the signup page',
    },
  ],
};
