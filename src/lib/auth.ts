export const PASSWORD_MIN_LENGTH = 6;
export const RESET_CODE_LENGTH = 6;
/** How long a password reset code stays valid. */
export const RESET_CODE_TTL_MS = 10 * 60 * 1000;
/** Wait before another reset code can be requested. */
export const RESET_RESEND_DELAY_S = 60;

/** Accounts are keyed by email, regardless of case and surrounding spaces. */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Message for a password that is too short, or `null` when it is valid. */
export function validatePassword(password: string) {
  return password.length < PASSWORD_MIN_LENGTH
    ? `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`
    : null;
}

/** Error whose message can be shown to the user as is. */
export class AuthError extends Error {}

export function randomResetCode() {
  return String(Math.floor(Math.random() * 10 ** RESET_CODE_LENGTH)).padStart(
    RESET_CODE_LENGTH,
    '0',
  );
}
