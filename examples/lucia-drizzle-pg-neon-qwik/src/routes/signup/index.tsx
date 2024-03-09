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
import pg from "pg";
import { db } from "~/lib/db";
import { userTable } from "~/lib/schema";
import { hashPassword } from "qwik-lucia";

export const useUserLoader = routeLoader$(async ({ redirect, sharedMap }) => {
  const session = sharedMap.get("session");
  if (session) {
    throw redirect(303, "/");
  }

  return {};
});

export const useSignupUser = routeAction$(
  async (values, { fail, redirect}) => {
    try {
      const passwordHash = await hashPassword(values.password);

      await db.insert(userTable).values({
        username: values.username,
        password: passwordHash,
      });
    } catch (e) {
      if (
        e instanceof pg.DatabaseError &&
        e.message === "AUTH_DUPLICATE_KEY_ID"
      ) {
        return fail(400, {
          message: "Username already taken",
        });
      }
      return fail(500, {
        message: "An unknown error occurred",
      });
    }

    // redirect to
    // make sure you don't throw inside a try/catch block!
    throw redirect(303, "/");
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
