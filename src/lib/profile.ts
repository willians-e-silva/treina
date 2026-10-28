import { MOCK_DASHBOARD } from './dashboard-data';
import { fromDateKey } from './exercises';

export type Profile = {
  name: string;
  /** `YYYY-MM-DD`; the age is derived from it so it stays current. */
  birthDate: string;
  heightCm: number;
  /** Latest weigh-in. */
  weightKg: number;
};

/**
 * TEMPORARY: static profile until there is a backend. The weight follows the
 * latest mock weigh-in, so it matches the home dashboard.
 */
export const MOCK_PROFILE: Profile = {
  name: 'Usuário Treina',
  birthDate: '1996-04-12',
  heightCm: 178,
  weightKg: MOCK_DASHBOARD.weight[MOCK_DASHBOARD.weight.length - 1].kg,
};

/** Whole years from `birthDate` until `today`. */
export function getAge(birthDate: string, today = new Date()) {
  const birth = fromDateKey(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  return hadBirthday ? age : age - 1;
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
