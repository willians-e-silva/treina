import { createContext, use, useState, type PropsWithChildren } from 'react';

import { signInWithGoogle, signOutFromGoogle } from '@/lib/google-auth';
import { MOCK_PROFILE, type Profile } from '@/lib/profile';

export type NewAccount = Profile & { password: string };

type SessionContextValue = {
  session: string | null;
  /** Profile of the signed-in user; `null` while signed out. */
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Creates the account and signs in with it. */
  signUp: (account: NewAccount) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  // TEMPORARY: accounts created in this session, so signing in again with the
  // same email shows its profile. Lost when the app restarts.
  const [accounts, setAccounts] = useState<Record<string, Profile>>({});

  function startSession(email: string, name?: string | null) {
    setSession(email);
    setProfile(accounts[email] ?? { ...MOCK_PROFILE, email, name: name || MOCK_PROFILE.name });
  }

  async function signIn(email: string, password: string) {
    if (IS_AUTH_MOCKED) {
      startSession(email || MOCK_EMAIL);
      return;
    }
    // TODO: replace with a real auth request.
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }
    startSession(email);
  }

  async function signUp({ password: _password, ...account }: NewAccount) {
    // TODO: replace with a real sign-up request that also sends the password.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setAccounts((current) => ({ ...current, [account.email]: account }));
    setSession(account.email);
    setProfile(account);
  }

  async function handleSignInWithGoogle() {
    const user = await signInWithGoogle();
    if (!user) {
      return false;
    }
    // TODO: send user.idToken to your backend to verify it and create a session.
    startSession(user.email, user.name);
    return true;
  }

  function signOut() {
    setSession(null);
    setProfile(null);
    signOutFromGoogle();
  }

  return (
    <SessionContext
      value={{
        session,
        profile,
        signIn,
        signUp,
        signInWithGoogle: handleSignInWithGoogle,
        signOut,
      }}>
      {children}
    </SessionContext>
  );
}
