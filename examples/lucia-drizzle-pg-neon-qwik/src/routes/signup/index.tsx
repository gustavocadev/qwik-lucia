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
import { generateId } from "lucia";
import pg from "pg";
import { Argon2id } from "oslo/password";
import { db } from "~/lib/db";
import { userTable } from "~/lib/schema";
import { handleRequest } from "~/lib/lucia";

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
      const hashPassword = await new Argon2id().hash(values.password);
      const userId = generateId(15);

      await db.insert(userTable).values({
        id: userId,
        username: values.username,
        password: hashPassword,
      });
    } catch (e) {
      if (
        e instanceof pg.DatabaseError &&
        e.message === "AUTH_DUPLICATE_KEY_ID"
      ) {
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
