import type { Profile, Sex } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

/** The signed-in account, as the session knows it. */
export type SessionUser = {
  id: string;
  email: string;
  /** Demo mode: the profile, kept in memory instead of loaded. */
  demoProfile?: Profile;
};

const SEXES: readonly string[] = ['female', 'male', 'unspecified'] satisfies Sex[];

/**
 * Profile of the signed-in account: the `profiles` row, the email of the
 * account and, as the current weight, the latest weigh-in (I-15).
 */
export async function loadProfile(user: SessionUser): Promise<Profile> {
  if (user.demoProfile) return user.demoProfile;

  const [profile, weighIn] = await Promise.all([
    supabase.from('profiles').select('name, birth_date, sex, height_cm').eq('id', user.id).single(),
    supabase
      .from('weigh_ins')
      .select('kg')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (profile.error) throw profile.error;
  if (weighIn.error) throw weighIn.error;

  const { name, birth_date, sex, height_cm } = profile.data;
  return {
    name,
    email: user.email,
    birthDate: birth_date,
    sex: sex && SEXES.includes(sex) ? (sex as Sex) : null,
    heightCm: height_cm,
    weightKg: weighIn.data ? Number(weighIn.data.kg) : null,
  };
}
