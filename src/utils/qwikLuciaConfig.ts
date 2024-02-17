import type {
  RequestEventAction,
  RequestEventLoader,
} from '@builder.io/qwik-city';
import type { Session, Lucia } from 'lucia';

const handleRequest = (
  event: RequestEventLoader | RequestEventAction,
  lucia: Lucia
) => {
  const sessionId = event.cookie.get(lucia.sessionCookieName);

  const validateUser = async () => {
    const sessionIdValue = sessionId?.value;

    if (!sessionIdValue) {
      return { user: null, session: null };
    }

    const { session, user } = await lucia.validateSession(sessionIdValue);

    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookie.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      });
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      event.cookie.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      });
    }

    return {
      user,
      session,
    };
  };

  const setSession = (session: Session) => {
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookie.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });
  };

  const logout = async () => {
    const sessionCookie = lucia.createBlankSessionCookie();

    event.cookie.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });
  };

  return {
    validateUser,
    setSession,
    logout,
  };
};

export const qwikLuciaConfig = (lucia: Lucia) => {
  return {
    handleRequest: (event: RequestEventLoader | RequestEventAction) => {
      return handleRequest(event, lucia);
    },
  };
};
