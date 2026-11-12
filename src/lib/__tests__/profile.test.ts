import { describe, expect, it } from '@jest/globals';

import {
  ageOn,
  getInitials,
  isProfileIncomplete,
  isValidWeight,
  maskDate,
  parseDate,
  parseDecimal,
  type Profile,
} from '../profile';

const complete: Profile = {
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  birthDate: '1995-04-10',
  sex: 'female',
  heightCm: 165,
  weightKg: 60,
};

describe('isProfileIncomplete', () => {
  it('is false when every body field is known', () => {
    expect(isProfileIncomplete(complete)).toBe(false);
  });

  it.each(['birthDate', 'sex', 'heightCm', 'weightKg'] as const)('is true without %s', (field) => {
    expect(isProfileIncomplete({ ...complete, [field]: null })).toBe(true);
  });
});

describe('ageOn', () => {
  it('counts a birthday only once it is reached', () => {
    expect(ageOn('1995-04-10', '2026-04-09')).toBe(30);
    expect(ageOn('1995-04-10', '2026-04-10')).toBe(31);
  });
});

describe('dates', () => {
  it('masks typed digits', () => {
    expect(maskDate('1004199')).toBe('10/04/199');
    expect(maskDate('10a04b1995c')).toBe('10/04/1995');
  });

  it('parses only real dates', () => {
    expect(parseDate('10/04/1995')).toBe('1995-04-10');
    expect(parseDate('31/02/2000')).toBeNull();
    expect(parseDate('1995-04-10')).toBeNull();
  });
});

describe('numbers', () => {
  it('parses commas and dots', () => {
    expect(parseDecimal('82,5')).toBe(82.5);
    expect(parseDecimal(' 82.5 ')).toBe(82.5);
    expect(parseDecimal('')).toBeNaN();
  });

  it('accepts weights from 30 to 400 kg', () => {
    expect(isValidWeight(29.9)).toBe(false);
    expect(isValidWeight(30)).toBe(true);
    expect(isValidWeight(400)).toBe(true);
    expect(isValidWeight(NaN)).toBe(false);
  });

  it('builds initials from the first and last names', () => {
    expect(getInitials('Usuário Treina')).toBe('UT');
    expect(getInitials('  ana  ')).toBe('A');
  });
});
