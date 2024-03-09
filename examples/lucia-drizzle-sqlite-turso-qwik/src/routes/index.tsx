import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { handleRequest } from "~/lib/lucia";

export const useUserLoader = routeLoader$(async ({ sharedMap, redirect }) => {
  const session = sharedMap.get('session')
  if (!session) {
    throw redirect(303, "/login");
  }

  return sharedMap.get('user');
});

export const useLogoutUserAction = routeAction$(async (values, { cookie, redirect, sharedMap }) => {
  const authRequest = handleRequest({ cookie });
  const session = sharedMap.get('session');

  if (!session) throw redirect(302, "/login");

  // Remove the session from the database and from the cookie - Logout
  await authRequest.invalidateSessionCookie(session);

  throw redirect(302, "/login");
});

export default component$(() => {
  const userLoader = useUserLoader();
  const logoutUserAction = useLogoutUserAction();
  return (
    <div class="m-8">
      <pre>
        <code>{JSON.stringify(userLoader.value, null, 2)}</code>
      </pre>
      <h1>Protected Page</h1>
      <h1 class="text-3xl">
        if you see this, it means that you have successfully authenticated
      </h1>

      <Form action={logoutUserAction}>
        <button class="btn btn-error" type="submit">
          Logout
        </button>
      </Form>
    </div>
  );
});
