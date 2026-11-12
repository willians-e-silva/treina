/** `unspecified`: the user preferred not to say. */
export type Sex = 'female' | 'male' | 'unspecified';

export const SEX_LABELS: Record<Sex, string> = {
  female: 'Feminino',
  male: 'Masculino',
  unspecified: 'Não informar',
};

/** Pickable heights (cm) in the sign-up. */
export const HEIGHT_OPTIONS = range(100, 250);

/** Accepted ages in the sign-up. */
export const AGE_MIN = 13;
export const AGE_MAX = 120;

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * The signed-in user. Accounts created with Google start with only the name
 * and email, so the other fields can be missing (`null`).
 */
export type Profile = {
  name: string;
  email: string;
  /** `YYYY-MM-DD`. */
  birthDate: string | null;
  sex: Sex | null;
  heightCm: number | null;
  /** Latest weigh-in. */
  weightKg: number | null;
};

/**
 * `true` while the profile lacks the body data the estimates need: accounts
 * created with Google start with only the name and email.
 */
export function isProfileIncomplete(profile: Profile) {
  return (
    profile.birthDate === null ||
    profile.sex === null ||
    profile.heightCm === null ||
    profile.weightKg === null
  );
}

/** Profile of the demo mode. */
export const MOCK_PROFILE: Omit<Profile, 'email'> & { weightKg: number } = {
  name: 'Usuário Treina',
  birthDate: '1996-01-01',
  sex: 'male',
  heightCm: 178,
  weightKg: 82,
};

/** Full years on `today` of someone born on `birthDate` (both `YYYY-MM-DD`). */
export function ageOn(birthDate: string, today: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
  const hadBirthday = todayMonth > month || (todayMonth === month && todayDay >= day);
  return todayYear - year - (hadBirthday ? 0 : 1);
}

/** Typed digits as `DD/MM/AAAA`, adding the slashes: `"1004199"` → `"10/04/199"`. */
export function maskDate(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

/** `"10/04/1995"` → `"1995-04-10"` (`YYYY-MM-DD`); `null` when it is not a real date. */
export function parseDate(text: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

const meters = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `178` → `"1,78 m"` */
export function formatHeight(heightCm: number) {
  return `${meters.format(heightCm / 100)} m`;
}

/** `"Usuário Treina"` → `"UT"`. */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Accepted range of body weights, in kg. */
export const WEIGHT_MIN_KG = 30;
export const WEIGHT_MAX_KG = 400;

export function isValidWeight(kg: number) {
  return kg >= WEIGHT_MIN_KG && kg <= WEIGHT_MAX_KG;
}

/** Parses user input like "82", "82,5" or "82.5"; `NaN` when invalid. */
export function parseDecimal(text: string) {
  return text.trim() === '' ? NaN : Number(text.trim().replace(',', '.'));
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
