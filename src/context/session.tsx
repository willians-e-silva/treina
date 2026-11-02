import { createContext, use, useState, type PropsWithChildren } from 'react';

import { AuthError, normalizeEmail, randomResetCode, RESET_CODE_TTL_MS } from '@/lib/auth';
import { signInWithGoogle, signOutFromGoogle } from '@/lib/google-auth';
import { MOCK_PROFILE, type Profile } from '@/lib/profile';

export type NewAccount = Profile & { password: string };

type SessionContextValue = {
  session: string | null;
  /** Profile of the signed-in user; `null` while signed out. */
  profile: Profile | null;
  /** Rejects with an `AuthError` when the email or password is wrong. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Creates the account and signs in with it. */
  signUp: (account: NewAccount) => Promise<void>;
  /** Whether an account with this email already exists. */
  hasAccount: (email: string) => boolean;
  /** Resolves to `false` if the user cancelled the Google prompt. */
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => void;
  /** Updates the signed-in user's current weight. */
  setWeight: (kg: number) => void;
  /**
   * Sends a code to reset the password. TEMPORARY: resolves to the code,
   * since no email is sent yet.
   */
  requestPasswordReset: (email: string) => Promise<string>;
  /** Rejects with an `AuthError` when the code is wrong or expired. */
  verifyResetCode: (email: string, code: string) => Promise<void>;
  /** Sets the new password; the user then signs in with it. */
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  /** Email whose password was just reset, for the login to confirm it. */
  passwordResetEmail: string | null;
};

/**
 * TEMPORARY: while `true`, signing in with an email that has no account in
 * this session always succeeds, so the main flow can be reached without a
 * backend. Accounts created in the app still need their password. Set to
 * `false` (or remove) once the real auth request is in place.
 */
export const IS_AUTH_MOCKED = true;
const MOCK_EMAIL = 'usuario@exemplo.com';
const WRONG_CREDENTIALS = 'Email ou senha incorretos.';
const WRONG_CODE = 'Código inválido ou expirado. Confira o código ou peça um novo.';

type Account = { profile: Profile; password: string };
type PasswordReset = { email: string; code: string; expiresAt: number };

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

/** TEMPORARY: stands in for the network round trip of the auth requests. */
function delay() {
  return new Promise((resolve) => setTimeout(resolve, 600));
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // TEMPORARY: accounts created in this session, so signing in again with the
  // same email checks its password and shows its profile. Lost when the app restarts.
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [reset, setReset] = useState<PasswordReset | null>(null);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null);

  function startSession(email: string, name?: string | null) {
    setSession(email);
    setProfile(
      accounts[email]?.profile ?? { ...MOCK_PROFILE, email, name: name || MOCK_PROFILE.name },
    );
    setPasswordResetEmail(null);
  }

  async function signIn(email: string, password: string) {
    const key = normalizeEmail(email);
    const account = accounts[key];
    if (!account && IS_AUTH_MOCKED) {
      startSession(key || MOCK_EMAIL);
      return;
    }
    // TODO: replace with a real auth request.
    await delay();
    if (!account || account.password !== password) {
      throw new AuthError(WRONG_CREDENTIALS);
    }
    startSession(key);
  }

  async function signUp({ password, ...account }: NewAccount) {
    // TODO: replace with a real sign-up request that also sends the password.
    await delay();
    const key = normalizeEmail(account.email);
    if (accounts[key]) {
      throw new AuthError('Já existe uma conta com este email.');
    }
    const created = { ...account, email: key };
    setAccounts((current) => ({ ...current, [key]: { profile: created, password } }));
    setSession(key);
    setProfile(created);
    setPasswordResetEmail(null);
  }

  function hasAccount(email: string) {
    return !!accounts[normalizeEmail(email)];
  }

  async function handleSignInWithGoogle() {
    const user = await signInWithGoogle();
    if (!user) {
      return false;
    }
    // TODO: send user.idToken to your backend to verify it and create a session.
    startSession(normalizeEmail(user.email), user.name);
    return true;
  }

  function setWeight(weightKg: number) {
    setProfile((current) => current && { ...current, weightKg });
    setAccounts((current) => {
      const account = session ? current[session] : undefined;
      if (!session || !account) return current;
      return { ...current, [session]: { ...account, profile: { ...account.profile, weightKg } } };
    });
  }

  function signOut() {
    setSession(null);
    setProfile(null);
    signOutFromGoogle();
  }

  // TODO: replace the reset steps below with the backend's endpoints. The flow
  // never tells whether the email has an account, so it cannot be used to find
  // out who uses the app.
  async function requestPasswordReset(email: string) {
    await delay();
    const code = randomResetCode();
    setReset({ email: normalizeEmail(email), code, expiresAt: Date.now() + RESET_CODE_TTL_MS });
    return code;
  }

  function checkResetCode(email: string, code: string) {
    if (
      !reset ||
      reset.email !== normalizeEmail(email) ||
      reset.code !== code.trim() ||
      Date.now() > reset.expiresAt
    ) {
      throw new AuthError(WRONG_CODE);
    }
  }

  async function verifyResetCode(email: string, code: string) {
    await delay();
    checkResetCode(email, code);
  }

  async function resetPassword(email: string, code: string, password: string) {
    await delay();
    checkResetCode(email, code);
    const key = normalizeEmail(email);
    setAccounts((current) =>
      current[key] ? { ...current, [key]: { ...current[key], password } } : current,
    );
    setReset(null);
    setPasswordResetEmail(key);
  }

  return (
    <SessionContext
      value={{
        session,
        profile,
        signIn,
        signUp,
        hasAccount,
        signInWithGoogle: handleSignInWithGoogle,
        signOut,
        setWeight,
        requestPasswordReset,
        verifyResetCode,
        resetPassword,
        passwordResetEmail,
      }}>
      {children}
    </SessionContext>
  );
}
