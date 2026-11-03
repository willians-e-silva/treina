import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

import type { SessionUser } from '@/data/profile';
import { AuthError, IS_AUTH_MOCKED, normalizeEmail, toAuthError } from '@/lib/auth';
import { signInWithGoogle, signOutFromGoogle } from '@/lib/google-auth';
import { MOCK_PROFILE, type Profile } from '@/lib/profile';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/** Sign-up data: the account step and the body data step. */
export type NewAccount = {
  name: string;
  email: string;
  password: string;
  /** `YYYY-MM-DD`. */
  birthDate: string;
  sex: NonNullable<Profile['sex']>;
  heightCm: number;
  weightKg: number;
};

type SessionContextValue = {
  /** Id of the signed-in account; `null` while signed out. */
  session: string | null;
  user: SessionUser | null;
  /** `true` while the saved session is read when the app opens. */
  restoring: boolean;
  /** Profile of the signed-in user, once the main flow loaded it. */
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  /** Rejects with an `AuthError` (reason `email_not_confirmed` if it still needs confirming). */
  signIn: (email: string, password: string) => Promise<void>;
  /**
   * Creates the account. Resolves to `needsConfirmation` when the email must be
   * confirmed with the emailed link first; otherwise the user is signed in.
   */
  signUp: (account: NewAccount) => Promise<{ needsConfirmation: boolean }>;
  /** Sends the confirmation link again. */
  resendConfirmation: (email: string) => Promise<void>;
  /** Signs in with the `code` of a confirmation link opened in the app. */
  completeEmailLink: (link: AuthLink) => Promise<void>;
  /** Resolves to `false` if the user cancelled the Google prompt. */
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => void;
  /** Updates the signed-in user's current weight on screen. */
  setWeight: (kg: number) => void;
  /** Emails a link to reset the password; never tells whether the email has an account. */
  requestPasswordReset: (email: string) => Promise<void>;
  /**
   * Opens the reset with the `code` of the emailed link and resolves to the
   * account's email. Rejects with an `AuthError` when the link expired.
   */
  startPasswordReset: (link: AuthLink) => Promise<string>;
  /** Sets the new password after `startPasswordReset`; the user then signs in with it. */
  resetPassword: (password: string) => Promise<void>;
  /** Leaves a reset that was verified but not finished. */
  cancelPasswordReset: () => void;
  /** Email whose password was just reset, for the login to confirm it. */
  passwordResetEmail: string | null;
};

export { IS_AUTH_MOCKED } from '@/lib/auth';
const DEMO_EMAIL = 'usuario@exemplo.com';

/** Before any request to Supabase Auth: fails clearly when `.env.local` lacks the keys. */
function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthError(
      'O app não está configurado para entrar: faltam as chaves do Supabase no .env.local.',
    );
  }
}

/** Query of an auth link opened in the app (`treina://…?code=…&sb_flow_id=…`). */
export type AuthLink = { code: string; flowId?: string };

// Where the links in auth emails open the app; listed in
// `auth.additional_redirect_urls` (supabase/config.toml).
const CONFIRMED_URL = Linking.createURL('/auth/callback');
const RESET_URL = Linking.createURL('/forgot-password/new-password');

// A code works once, so a screen that asks again for the same link (e.g. its
// effect running twice in development) gets the first answer.
const exchanges = new Map<string, ReturnType<typeof exchangeOnce>>();

async function exchangeOnce({ code, flowId }: AuthLink) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );
  if (error) throw toAuthError(error, 'Não foi possível abrir o link. Peça um novo.');
  return data;
}

function exchange(link: AuthLink) {
  let pending = exchanges.get(link.code);
  if (!pending) {
    pending = exchangeOnce(link);
    exchanges.set(link.code, pending);
  }
  return pending;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

function toSessionUser(user: User): SessionUser {
  return { id: user.id, email: user.email ?? '' };
}

function demoUser(profile: Profile): SessionUser {
  return { id: `demo:${profile.email}`, email: profile.email, demoProfile: profile };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [restoring, setRestoring] = useState(!IS_AUTH_MOCKED);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null);
  // Email of a password reset in progress. Opening its link signs Supabase
  // in, but the app stays signed out until the new password is set.
  const recovery = useRef<string | null>(null);

  // Id of `user`, read by handlers that run before a re-render.
  const userId = useRef<string | null>(null);

  function changeUser(next: SessionUser | null) {
    if (userId.current === (next?.id ?? null)) return;
    userId.current = next?.id ?? null;
    setUser(next);
    // Another account, or none: its profile is loaded again by the main flow.
    setProfile(null);
  }

  const onAuthChange = useEffectEvent((session: Session | null) => {
    setRestoring(false);
    if (recovery.current) return;
    changeUser(session ? toSessionUser(session.user) : null);
  });

  useEffect(() => {
    if (IS_AUTH_MOCKED) return;
    // Fires first with the session saved on the device (`INITIAL_SESSION`),
    // then on every sign-in, sign-out and token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => onAuthChange(session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const key = normalizeEmail(email);
    if (IS_AUTH_MOCKED) {
      changeUser(demoUser({ ...MOCK_PROFILE, email: key || DEMO_EMAIL }));
      setPasswordResetEmail(null);
      return;
    }
    assertConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email: key, password });
    if (error) throw toAuthError(error, 'Não foi possível entrar. Tente novamente.');
    setPasswordResetEmail(null);
  }

  async function signUp({ password, ...account }: NewAccount) {
    const email = normalizeEmail(account.email);
    if (IS_AUTH_MOCKED) {
      const { name, birthDate, sex, heightCm, weightKg } = account;
      changeUser(demoUser({ name, email, birthDate, sex, heightCm, weightKg }));
      return { needsConfirmation: false };
    }
    assertConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: CONFIRMED_URL,
        // Read by the `on_auth_user_created` trigger to create the profile
        // and the first weigh-in (supabase/migrations/…_new_user_profile.sql).
        data: {
          name: account.name,
          birth_date: account.birthDate,
          sex: account.sex,
          height_cm: account.heightCm,
          weight_kg: account.weightKg,
        },
      },
    });
    if (error) throw toAuthError(error, 'Não foi possível criar a conta. Tente novamente.');
    // With email confirmation on, an existing email gets a user without
    // identities instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      throw new AuthError('Já existe uma conta com este email. Entre com ela ou recupere a senha.');
    }
    return { needsConfirmation: !data.session };
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: CONFIRMED_URL },
    });
    if (error) throw toAuthError(error, 'Não foi possível reenviar o email.');
  }

  async function completeEmailLink(link: AuthLink) {
    assertConfigured();
    // The session it creates signs the user in through `onAuthStateChange`.
    await exchange(link);
  }

  async function handleSignInWithGoogle() {
    const google = await signInWithGoogle();
    if (!google) {
      return false;
    }
    if (IS_AUTH_MOCKED) {
      const email = normalizeEmail(google.email);
      changeUser(demoUser({ ...MOCK_PROFILE, email, name: google.name || MOCK_PROFILE.name }));
      return true;
    }
    if (!google.idToken) {
      throw new AuthError('O Google não devolveu os dados de acesso. Tente novamente.');
    }
    assertConfigured();
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: google.idToken,
    });
    if (error) throw toAuthError(error, 'Não foi possível entrar com o Google.');
    return true;
  }

  function setWeight(weightKg: number) {
    setProfile((current) => current && { ...current, weightKg });
  }

  function signOut() {
    changeUser(null);
    signOutFromGoogle();
    if (!IS_AUTH_MOCKED) {
      supabase.auth.signOut().catch((error: unknown) => {
        // The session is already gone from the screen; the token expires on its own.
        console.warn('Failed to sign out from Supabase', error);
      });
    }
  }

  async function requestPasswordReset(email: string) {
    if (IS_AUTH_MOCKED) {
      throw new AuthError('A recuperação de senha não está disponível no modo demo.');
    }
    assertConfigured();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: RESET_URL,
    });
    if (error) throw toAuthError(error, 'Não foi possível enviar o email. Tente novamente.');
  }

  async function startPasswordReset(link: AuthLink) {
    assertConfigured();
    // Placeholder until the account's email is known: keeps the session the
    // link creates away from the app.
    recovery.current = 'pending';
    try {
      const { user } = await exchange(link);
      recovery.current = normalizeEmail(user.email ?? '');
      return recovery.current;
    } catch (error) {
      recovery.current = null;
      throw error;
    }
  }

  async function resetPassword(password: string) {
    const email = recovery.current;
    if (!email) {
      throw new AuthError('O código expirou. Peça um novo para redefinir a senha.');
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw toAuthError(error, 'Não foi possível alterar a senha.');
    // Signs out every device, so the old password no longer keeps anyone in.
    await supabase.auth.signOut().catch(() => undefined);
    recovery.current = null;
    setPasswordResetEmail(email);
  }

  function cancelPasswordReset() {
    if (!recovery.current) return;
    supabase.auth
      .signOut({ scope: 'local' })
      .catch(() => undefined)
      .finally(() => {
        recovery.current = null;
      });
  }

  return (
    <SessionContext
      value={{
        session: user?.id ?? null,
        user,
        restoring,
        profile,
        setProfile,
        signIn,
        signUp,
        resendConfirmation,
        completeEmailLink,
        signInWithGoogle: handleSignInWithGoogle,
        signOut,
        setWeight,
        requestPasswordReset,
        startPasswordReset,
        resetPassword,
        cancelPasswordReset,
        passwordResetEmail,
      }}>
      {children}
    </SessionContext>
  );
}
