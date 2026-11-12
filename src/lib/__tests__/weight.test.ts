import { describe, expect, it } from '@jest/globals';

import { upsertWeighIn, weighInPeriods, weighInsInRange } from '../weight';

describe('upsertWeighIn', () => {
  const entries = [
    { date: '2026-11-01', kg: 80 },
    { date: '2026-11-05', kg: 79 },
  ];

  it('inserts in date order', () => {
    expect(upsertWeighIn(entries, { date: '2026-11-03', kg: 79.5 })).toEqual([
      { date: '2026-11-01', kg: 80 },
      { date: '2026-11-03', kg: 79.5 },
      { date: '2026-11-05', kg: 79 },
    ]);
  });

  it('replaces the weigh-in of the same day', () => {
    expect(upsertWeighIn(entries, { date: '2026-11-05', kg: 78 })).toEqual([
      { date: '2026-11-01', kg: 80 },
      { date: '2026-11-05', kg: 78 },
    ]);
  });
});

describe('weighInsInRange', () => {
  it('covers the last 30 days, today included', () => {
    const entries = [
      { date: '2026-10-13', kg: 81 },
      { date: '2026-10-14', kg: 80 },
      { date: '2026-11-12', kg: 79 },
    ];
    expect(weighInsInRange(entries, 30, '2026-11-12').map((entry) => entry.date)).toEqual([
      '2026-10-14',
      '2026-11-12',
    ]);
  });
});

describe('weighInPeriods', () => {
  it('splits by calendar month', () => {
    const entries = [
      { date: '2026-10-30', kg: 80 },
      { date: '2026-11-01', kg: 79 },
      { date: '2026-11-02', kg: 79 },
    ];
    expect(weighInPeriods(entries)).toEqual([
      { month: '2026-10', start: 0, end: 0 },
      { month: '2026-11', start: 1, end: 2 },
    ]);
  });
});
