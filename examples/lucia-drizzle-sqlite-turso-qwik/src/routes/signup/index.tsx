import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  routeLoader$,
  Link,
} from "@builder.io/qwik-city";
import { LibsqlError } from "@libsql/client/lib-esm/node";

import { db } from "~/lib/db";
import { handleRequest, lucia } from "~/lib/lucia";
import { userTable } from "~/lib/schema";
import { hashPassword } from "qwik-lucia";

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();

  if (session) {
    throw event.redirect(303, "/");
  }

  return {};
});

export const useSignupUser = routeAction$(
  async (values, event) => {
    try {
      const authRequest = handleRequest(event);

      const passwordHash = await hashPassword(values.password);
      const [user] = await db
        .insert(userTable)
        .values({
          passwordHash,
          username: values.username,
        })
        .returning({
          id: userTable.id,
        });

      const session = await lucia.createSession(user.id, {});
      authRequest.setSession(session); // set session cookie
    } catch (e) {
      // check for unique constraint error in user table
      if (e instanceof LibsqlError && e.code === "SQLITE_CONSTRAINT") {
        return event.fail(400, {
          message: "Username already taken",
        });
      }
      return event.fail(500, {
        message: "An unknown error occurred",
      });
    }

    // redirect to
    // make sure you don't throw inside a try/catch block!
    throw event.redirect(303, "/");
  },
  zod$({
    username: z.string().min(2),
    password: z.string().min(5),
  }),
);

export default component$(() => {
  const signupUserAction = useSignupUser();
  return (
    <>
      <Form
        action={signupUserAction}
        class="form-control mx-auto mt-32 max-w-lg"
      >
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
          Already have an account?{" "}
          <Link href="/login/" class="link-primary">
            Login
          </Link>
        </p>

        {signupUserAction.value?.message && (
          <p class="font-bold text-error">{signupUserAction.value.message}</p>
        )}
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: "Signup Page",
  meta: [
    {
      name: "description",
      content: "This is the signup page",
    },
  ],
};
