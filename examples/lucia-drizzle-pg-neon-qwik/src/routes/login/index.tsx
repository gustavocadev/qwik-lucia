import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  Link,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import pg from "pg";
import { verifyPassword } from "qwik-lucia";
import { db } from "~/lib/db";
import { handleRequest, lucia } from "~/lib/lucia";
import { userTable } from "~/lib/schema";

export const useUserLoader = routeLoader$(async ({ sharedMap, redirect }) => {
  const session = sharedMap.get("session");
  if (session) {
    throw redirect(303, "/");
  }

  return {};
});

export const useLoginAction = routeAction$(
  async (values, { cookie, fail, redirect }) => {
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
          message: "Incorrect username or password",
        });
      }

      // 3. validate password
      const isValidPassword = await verifyPassword(
        user.passwordHash,
        values.password,
      );

      if (!isValidPassword) {
        return fail(400, {
          message: "Incorrect username or password",
        });
      }

      // 4. create session
      const session = await lucia.createSession(user.id, {});

      authRequest.setSession(session); // set session cookie
    } catch (e) {
      if (
        e instanceof pg.DatabaseError &&
        (e.message === "AUTH_INVALID_KEY_ID" ||
          e.message === "AUTH_INVALID_PASSWORD")
      ) {
        // user does not exist
        // or invalid password
        return fail(400, {
          message: "Incorrect username or password",
        });
      }
      return fail(500, {
        message: "An unknown error occurred",
      });
    }

    throw redirect(303, "/");
  },
  zod$({
    username: z.string(),
    password: z.string(),
  }),
);

export default component$(() => {
  const loginAction = useLoginAction();
  return (
    <>
      <Form action={loginAction} class="form-control mx-auto mt-32 max-w-lg">
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
          Dont have an account?{" "}
          <Link href="/signup" class="link-primary">
            Signup
          </Link>
        </p>

        {loginAction.value?.message && (
          <p class="font-bold text-error">{loginAction.value.message}</p>
        )}
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: "Login Page",
  meta: [
    {
      name: "description",
      content: "This is the login page",
    },
  ],
};
