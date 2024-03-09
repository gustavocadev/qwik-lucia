import { component$, Slot } from '@builder.io/qwik';
import { type RequestHandler, routeLoader$ } from '@builder.io/qwik-city';
import { handleRequest } from '~/lib/lucia';

// Run on every request
export const onRequest: RequestHandler = async ({ cookie, sharedMap }) => {
  const authRequest = handleRequest({ cookie });
  const { user, session } = await authRequest.validateUser();

  // share the user and session with the rest of the app
  sharedMap.set('user', user);
  sharedMap.set('session', session);
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  return (
    <>
      <main>
        <Slot />
      </main>
    </>
  );
});
