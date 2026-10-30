import { MOCK_DASHBOARD } from './dashboard-data';

/** `unspecified`: the user preferred not to say. */
export type Sex = 'female' | 'male' | 'unspecified';

export const SEX_LABELS: Record<Sex, string> = {
  female: 'Feminino',
  male: 'Masculino',
  unspecified: 'Não informar',
};

/** Pickable ages and heights (cm) in the sign-up. */
export const AGE_OPTIONS = range(13, 120);
export const HEIGHT_OPTIONS = range(100, 250);

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export type Profile = {
  name: string;
  email: string;
  age: number;
  sex: Sex;
  heightCm: number;
  /** Current weight. */
  weightKg: number;
};

/**
 * TEMPORARY: profile shown for accounts that signed in without signing up in
 * this session, until there is a backend. The weight follows the latest mock
 * weigh-in, so it matches the home dashboard.
 */
export const MOCK_PROFILE: Omit<Profile, 'email'> = {
  name: 'Usuário Treina',
  age: 30,
  sex: 'male',
  heightCm: 178,
  weightKg: MOCK_DASHBOARD.weight[MOCK_DASHBOARD.weight.length - 1].kg,
};

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

/** Parses user input like "82", "82,5" or "82.5"; `NaN` when invalid. */
export function parseDecimal(text: string) {
  return text.trim() === '' ? NaN : Number(text.trim().replace(',', '.'));
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
