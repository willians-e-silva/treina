import { isAuthApiError, isAuthError } from '@supabase/supabase-js';

/**
 * Demo mode (`EXPO_PUBLIC_AUTH_MODE=demo`): signing in and up always works
 * without Supabase, with any email and password, and data stays in memory.
 * Off by default; password reset is not available in it.
 */
export const IS_AUTH_MOCKED = process.env.EXPO_PUBLIC_AUTH_MODE === 'demo';

export const PASSWORD_MIN_LENGTH = 6;
/** Wait before another email can be sent (`auth.email.max_frequency`). */
export const RESEND_DELAY_S = 60;

/** Accounts are keyed by email, regardless of case and surrounding spaces (I-09). */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Message for a password that is too short, or `null` when it is valid. */
export function validatePassword(password: string) {
  return password.length < PASSWORD_MIN_LENGTH
    ? `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`
    : null;
}

/** `email_not_confirmed`: the account exists but its email was not confirmed yet. */
export type AuthErrorReason = 'email_not_confirmed';

/** Error whose message can be shown to the user as is. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly reason?: AuthErrorReason,
  ) {
    super(message);
  }
}

const EXPIRED_LINK = 'O link expirou ou já foi usado. Peça um novo.';

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email ou senha incorretos.',
  email_not_confirmed: 'Confirme seu email para entrar.',
  user_already_exists: 'Já existe uma conta com este email.',
  email_exists: 'Já existe uma conta com este email.',
  otp_expired: EXPIRED_LINK,
  flow_state_expired: EXPIRED_LINK,
  flow_state_not_found: EXPIRED_LINK,
  bad_code_verifier: 'Abra o link no mesmo celular em que você o pediu.',
  same_password: 'A nova senha precisa ser diferente da atual.',
  weak_password: 'Escolha uma senha mais forte.',
  email_address_invalid: 'Informe um email válido.',
  over_email_send_rate_limit: 'Muitos emails enviados. Aguarde alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  signup_disabled: 'Novos cadastros estão desativados no momento.',
};

/** Message for an error `code` sent back in an auth link (e.g. `otp_expired`). */
export function linkErrorMessage(code: string | undefined) {
  return (code && MESSAGES[code]) || EXPIRED_LINK;
}

/**
 * `AuthError` with a message in Portuguese for an error of Supabase Auth.
 * Anything else (e.g. no connection) gets `fallback`.
 */
export function toAuthError(error: unknown, fallback: string) {
  if (error instanceof AuthError) return error;
  if (isAuthApiError(error) && error.code && MESSAGES[error.code]) {
    return new AuthError(
      MESSAGES[error.code],
      error.code === 'email_not_confirmed' ? 'email_not_confirmed' : undefined,
    );
  }
  if (isAuthError(error) && error.name === 'AuthPKCECodeVerifierMissingError') {
    return new AuthError(MESSAGES.bad_code_verifier);
  }
  if (isAuthError(error) && error.status === 0) {
    return new AuthError('Sem conexão. Verifique sua internet e tente novamente.');
  }
  return new AuthError(fallback);
}
