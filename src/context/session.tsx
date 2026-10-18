import { createContext, use, useState, type PropsWithChildren } from 'react';

import { signInWithGoogle, signOutFromGoogle } from '@/lib/google-auth';

type SessionContextValue = {
  session: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves to `false` if the user cancelled the Google prompt. */
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => void;
};

/**
 * TEMPORARY: while `true`, email sign-in skips validation and always succeeds,
 * so the main flow can be reached without a backend. Set to `false` (or remove)
 * once the real auth request is in place.
 */
export const IS_AUTH_MOCKED = true;
const MOCK_EMAIL = 'usuario@exemplo.com';

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);

  async function signIn(email: string, password: string) {
    if (IS_AUTH_MOCKED) {
      setSession(email || MOCK_EMAIL);
      return;
    }
    // TODO: replace with a real auth request.
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }
    setSession(email);
  }

  async function handleSignInWithGoogle() {
    const user = await signInWithGoogle();
    if (!user) {
      return false;
    }
    // TODO: send user.idToken to your backend to verify it and create a session.
    setSession(user.email);
    return true;
  }

  function signOut() {
    setSession(null);
    signOutFromGoogle();
  }

  return (
    <SessionContext
      value={{ session, signIn, signInWithGoogle: handleSignInWithGoogle, signOut }}>
      {children}
    </SessionContext>
  );
}
