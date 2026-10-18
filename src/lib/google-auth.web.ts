// The free @react-native-google-signin package has no web implementation,
// so the Google button is hidden on web.
export type GoogleUser = {
  email: string;
  name: string | null;
  idToken: string | null;
};

export class GoogleSignInError extends Error {}

export const isGoogleSignInAvailable = false;

export async function signInWithGoogle(): Promise<GoogleUser | null> {
  throw new GoogleSignInError('Login com Google não está disponível na web.');
}

export async function signOutFromGoogle() {}
