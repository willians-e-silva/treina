import Constants, { ExecutionEnvironment } from 'expo-constants';

export type GoogleUser = {
  email: string;
  name: string | null;
  idToken: string | null;
};

export class GoogleSignInError extends Error {}

// The native module is missing in Expo Go, so it is loaded lazily to keep the
// login screen working there (the Google button just reports it is unavailable).
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');
let googleSignin: GoogleSigninModule | null = null;

function getGoogleSignin() {
  if (isExpoGo) {
    return null;
  }
  if (!googleSignin) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleSignin = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    googleSignin.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }
  return googleSignin;
}

// Shown in Expo Go too; tapping it there explains a development build is needed.
export const isGoogleSignInAvailable = true;

/** Returns the signed-in user, or `null` if the user cancelled. */
export async function signInWithGoogle(): Promise<GoogleUser | null> {
  const lib = getGoogleSignin();
  if (!lib) {
    throw new GoogleSignInError('Login com Google requer um development build.');
  }
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = lib;

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return null;
    }
    const { user, idToken } = response.data;
    return { email: user.email, name: user.name, idToken };
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          return null;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new GoogleSignInError('Google Play Services indisponível ou desatualizado.');
      }
    }
    throw new GoogleSignInError('Não foi possível entrar com o Google.');
  }
}

export async function signOutFromGoogle() {
  const lib = getGoogleSignin();
  if (!lib) {
    return;
  }
  try {
    await lib.GoogleSignin.signOut();
  } catch {
    // Local session is cleared regardless.
  }
}
