import type { Cookie } from '@builder.io/qwik-city';
import type { Session, Lucia } from 'lucia';

const handleRequest = ({ cookie }: { cookie: Cookie }, lucia: Lucia) => {
  /**
   * Validates the user session
   * @returns The user and session
   * @example
   * ```ts
   * const { user, session } = await validateUser();
   * if (user) {
   *  console.log('User is logged in');
   * }
   * ```
   * @example
   * ```ts
   * const { user, session } = await validateUser();
   * if (!user) {
   * console.log('User is not logged in');
   * }
   * ```
   */
  const validateUser = async () => {
    const sessionId = cookie.get(lucia.sessionCookieName);
    const sessionIdValue = sessionId?.value;

    if (!sessionIdValue) {
      return { user: null, session: null };
    }

    const { session, user } = await lucia.validateSession(sessionIdValue);

    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookie.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      });
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookie.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      });
    }

    return {
      user,
      session,
    };
  };

  /**
   * Sets the session cookie
   * @param session - The session to set
   * @returns void
   */
  const setSession = (session: Session) => {
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookie.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });
  };

  /**
   * Removes the session cookie from the database and from the browser
   * @returns void
   */
  const invalidateSessionCookie = async (session: Session) => {
    // Remove the session from the db
    await lucia.invalidateSession(session.id);

    // Remove the session cookie from the cookies
    const sessionCookie = lucia.createBlankSessionCookie();
    cookie.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });
  };

  return {
    validateUser,
    setSession,
    invalidateSessionCookie,
  };
};

/**
 * Configures the Qwik Lucia library
 * @param lucia - The Lucia instance
 * @returns The handleRequest function
 */
export const qwikLuciaConfig = (lucia: Lucia) => {
  return {
    handleRequest: ({ cookie }: { cookie: Cookie }) => {
      return handleRequest({ cookie }, lucia);
    },
  };
};
