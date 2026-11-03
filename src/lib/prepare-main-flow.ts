import { loadProfile, type SessionUser } from '@/data/profile';
import type { Profile } from '@/lib/profile';

/**
 * Work that must finish before the main tabs are shown after a login or when
 * the app opens with a saved session: loads the user's profile. It runs once
 * per sign-in, while the loading screen is visible; a thrown error shows the
 * retry screen. Add real requests here — never an artificial delay.
 */
export async function prepareMainFlow(user: SessionUser): Promise<Profile> {
  return loadProfile(user);
}
