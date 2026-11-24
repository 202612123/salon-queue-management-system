export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED' | 'NO_SHOW';

export type BarberStatus = 'AVAILABLE' | 'ON_BREAK' | 'OFF_DUTY';

export type Language = 'en' | 'gu';

export interface ServiceItem {
  id: string;
  nameEn: string;
  nameGu: string;
  durationMinutes: number;
  priceInr: number;
  category: 'hair' | 'beard' | 'spa' | 'color';
}

export interface BarberProfile {
  id: string;
  name: string;
  nameGu: string;
  chairNumber: number;
  status: BarberStatus;
  currentBreakMinutes?: number;
}

export interface TokenItem {
  id: string;
  tokenNumber: number;
  displayToken: string;
  customerName: string;
  phoneNumber: string;
  serviceIds: string[];
  totalDurationMinutes: number;
  totalPrice: number;
  barberPreference: 'ANY' | string;
  isLockedToBarber: boolean;
  assignedBarberId: string | null;
  chairNumber: number | null;
  status: QueueStatus;
  createdAt: string;
  calledAt: string | null;
  startedAt: string | null;
  doneAt: string | null;
  isWalkIn?: boolean;
}

export interface SalonSettings {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  onlineCutoffMinutes: number;
  gracePeriodMinutes: number;
  maxQueueCapacity: number;
}
