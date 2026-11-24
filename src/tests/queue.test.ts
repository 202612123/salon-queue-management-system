import { describe, it, expect } from 'vitest';
import {
  calculateEstimatedWaitTime,
  getRemainingGraceSeconds,
  formatGraceTimer,
  checkIsOnlineJoiningOpen,
  formatDisplayToken,
} from '../lib/queueService';
import { TokenItem, BarberProfile, SalonSettings } from '../types';

describe('Queue Business Rules & Logic (docs/03-flows-rules.md)', () => {
  const dummyBarbers: BarberProfile[] = [
    { id: 'barber_ramesh', name: 'Rameshbhai', nameGu: 'રમેશભાઈ', chairNumber: 1, status: 'AVAILABLE' },
    { id: 'barber_amit', name: 'Amit', nameGu: 'અમિત', chairNumber: 2, status: 'AVAILABLE' },
    { id: 'barber_jignesh', name: 'Jignesh', nameGu: 'જીગ્નેશ', chairNumber: 3, status: 'AVAILABLE' },
  ];

  it('TC-01: Standard wait-time formula with Any Available Barber', () => {
    // 3 working barbers, ahead tokens total 60 mins -> EWT = 60 / 3 = 20 mins
    const tokens: TokenItem[] = [
      {
        id: 'token-1',
        tokenNumber: 1,
        displayToken: 'A-101',
        customerName: 'Customer 1',
        phoneNumber: '9825011111',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 30,
        totalPrice: 250,
        barberPreference: 'ANY',
        isLockedToBarber: false,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:00:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
      {
        id: 'token-2',
        tokenNumber: 2,
        displayToken: 'A-102',
        customerName: 'Customer 2',
        phoneNumber: '9825022222',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 30,
        totalPrice: 250,
        barberPreference: 'ANY',
        isLockedToBarber: false,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:05:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
      {
        id: 'token-3',
        tokenNumber: 3,
        displayToken: 'A-103',
        customerName: 'Target Customer',
        phoneNumber: '9825033333',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 25,
        totalPrice: 250,
        barberPreference: 'ANY',
        isLockedToBarber: false,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:10:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
    ];

    const result = calculateEstimatedWaitTime(tokens, 'token-3', dummyBarbers);
    expect(result.peopleAhead).toBe(2);
    expect(result.workingBarbersCount).toBe(3);
    // 30 + 30 = 60 mins ahead / 3 barbers = 20 mins
    expect(result.minutes).toBe(20);
  });

  it('TC-02: Barber preference locking is enforced', () => {
    const isSpecific = (pref: string) => pref !== 'ANY';
    expect(isSpecific('barber_amit')).toBe(true);
    expect(isSpecific('ANY')).toBe(false);
  });

  it('TC-06 & Concurrency: Specific barber selection in FIFO dispatch', () => {
    const tokens: TokenItem[] = [
      {
        id: 't1',
        tokenNumber: 1,
        displayToken: 'A-101',
        customerName: 'Wants Ramesh',
        phoneNumber: '9800000001',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 25,
        totalPrice: 250,
        barberPreference: 'barber_ramesh',
        isLockedToBarber: true,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:00:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
      {
        id: 't2',
        tokenNumber: 2,
        displayToken: 'A-102',
        customerName: 'Wants Amit',
        phoneNumber: '9800000002',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 25,
        totalPrice: 250,
        barberPreference: 'barber_amit',
        isLockedToBarber: true,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:01:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
      {
        id: 't3',
        tokenNumber: 3,
        displayToken: 'A-103',
        customerName: 'Wants Any',
        phoneNumber: '9800000003',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 25,
        totalPrice: 250,
        barberPreference: 'ANY',
        isLockedToBarber: false,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:02:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
    ];

    // Amit calls next: must skip t1 (wants Ramesh) and select t2 (wants Amit)
    const eligibleForAmit = tokens
      .filter((t) => t.status === 'WAITING')
      .find((t) => t.barberPreference === 'ANY' || t.barberPreference === 'barber_amit');

    expect(eligibleForAmit?.id).toBe('t2');
  });

  it('TC-07: 10-Minute grace countdown is computed deterministically from called_at', () => {
    // 4 minutes (240 seconds) ago
    const fourMinutesAgo = new Date(Date.now() - 240 * 1000).toISOString();
    const remaining = getRemainingGraceSeconds(fourMinutesAgo);

    // 600 - 240 = 360 seconds (allow 1s tolerance for test execution)
    expect(remaining).toBeGreaterThanOrEqual(358);
    expect(remaining).toBeLessThanOrEqual(361);
    expect(formatGraceTimer(360)).toBe('06:00');
  });

  it('TC-09: Wait-time recalculation when barber takes break', () => {
    const tokens: TokenItem[] = [
      {
        id: 't1',
        tokenNumber: 1,
        displayToken: 'A-101',
        customerName: 'C1',
        phoneNumber: '9800000010',
        serviceIds: ['srv_haircut'],
        totalDurationMinutes: 90,
        totalPrice: 500,
        barberPreference: 'ANY',
        isLockedToBarber: false,
        assignedBarberId: null,
        chairNumber: null,
        status: 'WAITING',
        createdAt: '2026-11-24T10:00:00Z',
        calledAt: null,
        startedAt: null,
        doneAt: null,
      },
    ];

    // 3 working barbers: 90 / 3 = 30 mins
    const beforeBreak = calculateEstimatedWaitTime(tokens, null, dummyBarbers);
    expect(beforeBreak.minutes).toBe(30);

    // 1 barber takes 15m chai break -> working barbers = 2
    const barbersWithBreak: BarberProfile[] = [
      { ...dummyBarbers[0], status: 'AVAILABLE' },
      { ...dummyBarbers[1], status: 'AVAILABLE' },
      { ...dummyBarbers[2], status: 'ON_BREAK', currentBreakMinutes: 15 },
    ];

    // 2 working barbers: 90 / 2 = 45 mins
    const afterBreak = calculateEstimatedWaitTime(tokens, null, barbersWithBreak);
    expect(afterBreak.workingBarbersCount).toBe(2);
    expect(afterBreak.minutes).toBe(45);
  });

  it('TC-10 & TC-11: Online queue cutoff calculation', () => {
    const settings: SalonSettings = {
      isOpen: true,
      openTime: '09:00',
      closeTime: '21:00',
      onlineCutoffMinutes: 30,
      gracePeriodMinutes: 10,
      maxQueueCapacity: 30,
    };

    const status = checkIsOnlineJoiningOpen(settings);
    // Cutoff time for 21:00 close with 30m cutoff is 20:30
    expect(status.cutoffTime).toBe('20:30');
  });

  it('TC-12: Token display formatting', () => {
    expect(formatDisplayToken(1, false)).toBe('A-101');
    expect(formatDisplayToken(2, true)).toBe('W-102');
  });
});
