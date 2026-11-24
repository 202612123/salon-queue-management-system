import { supabase } from './supabase';
import { TokenItem, QueueStatus, BarberProfile, SalonSettings } from '@/types';
import { useAppStore } from './store';

// In-memory cache for offline/resilience
let cachedTokens: TokenItem[] = [];

export function formatDisplayToken(tokenNumber: number, isWalkIn?: boolean): string {
  const prefix = isWalkIn ? 'W-' : 'A-';
  return `${prefix}${100 + tokenNumber}`;
}

export function mapRowToToken(row: any): TokenItem {
  const tokenNumber = Number(row.token_number) || 1;
  const isLocked = Boolean(row.barber_preference && row.barber_preference !== 'ANY');
  const isWalkIn = Boolean(row.is_walk_in);
  const displayToken = formatDisplayToken(tokenNumber, isWalkIn);

  return {
    id: row.id,
    tokenNumber,
    displayToken,
    customerName: row.customer_name || 'Customer',
    phoneNumber: row.phone_number || '',
    serviceIds: Array.isArray(row.service_ids) ? row.service_ids : [],
    totalDurationMinutes: Number(row.total_duration_minutes) || 0,
    totalPrice: Number(row.total_price) || 0,
    barberPreference: row.barber_preference || 'ANY',
    isLockedToBarber: isLocked,
    assignedBarberId: row.assigned_barber_id || null,
    chairNumber: row.chair_number ? Number(row.chair_number) : null,
    status: (row.status as QueueStatus) || 'WAITING',
    createdAt: row.created_at || new Date().toISOString(),
    calledAt: row.called_at || null,
    startedAt: row.started_at || null,
    doneAt: row.done_at || null,
    isWalkIn,
  };
}

/**
 * Fetch all queue entries from Supabase (or fallback to cache)
 */
export async function fetchQueueEntries(): Promise<TokenItem[]> {
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error, using cache:', error.message);
      return cachedTokens;
    }

    if (data) {
      const mapped = data.map(mapRowToToken);
      cachedTokens = mapped;
      useAppStore.getState().setTokens(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Network error during fetchQueueEntries, using cache:', err);
  }

  return cachedTokens;
}

/**
 * Subscribe to realtime queue changes using Supabase Realtime WebSockets
 */
export function subscribeToQueue(onUpdate: (tokens: TokenItem[]) => void): () => void {
  // Initial fetch
  fetchQueueEntries().then(onUpdate);

  // Set up Supabase Realtime channel
  const channel = supabase
    .channel('queue_entries_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'queue_entries' },
      async () => {
        const tokens = await fetchQueueEntries();
        onUpdate(tokens);
      }
    )
    .subscribe();

  // Periodic fallback refresh every 5 seconds to ensure synchronization
  const interval = setInterval(async () => {
    const tokens = await fetchQueueEntries();
    onUpdate(tokens);
  }, 5000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(interval);
  };
}

/**
 * Check if a phone number already has an active token (WAITING, CALLED, IN_SERVICE)
 */
export async function checkActivePhone(phoneNumber: string): Promise<boolean> {
  const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
  if (!cleanPhone) return false;

  // Check from fresh DB query first
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('id, status')
      .eq('phone_number', cleanPhone)
      .in('status', ['WAITING', 'CALLED', 'IN_SERVICE']);

    if (!error && data && data.length > 0) {
      return true;
    }
  } catch (err) {
    console.warn('DB check error, checking cached tokens:', err);
  }

  // Fallback check against in-memory tokens
  return cachedTokens.some(
    (t) =>
      t.phoneNumber === cleanPhone &&
      (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_SERVICE')
  );
}

/**
 * Create a new customer token
 */
export async function createQueueEntry(params: {
  customerName: string;
  phoneNumber: string;
  serviceIds: string[];
  totalDurationMinutes: number;
  totalPrice: number;
  barberPreference: 'ANY' | string;
  isWalkIn?: boolean;
}): Promise<TokenItem> {
  const cleanPhone = params.phoneNumber.trim().replace(/\D/g, '');

  // 1. Single active token rule check
  const hasActive = await checkActivePhone(cleanPhone);
  if (hasActive) {
    throw new Error('A phone number can have only one active queue entry.');
  }

  const payload: any = {
    customer_name: params.customerName.trim(),
    phone_number: cleanPhone,
    service_ids: params.serviceIds,
    total_duration_minutes: params.totalDurationMinutes,
    total_price: params.totalPrice,
    barber_preference: params.barberPreference,
    status: 'WAITING',
  };

  const { data, error } = await supabase
    .from('queue_entries')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // If unique constraint violation
    if (error.code === '23505') {
      throw new Error('A phone number can have only one active queue entry.');
    }
    throw new Error(error.message);
  }

  const token = mapRowToToken(data);
  token.isWalkIn = Boolean(params.isWalkIn);

  // Update in-memory list and store
  cachedTokens = [...cachedTokens, token];
  useAppStore.getState().upsertToken(token);
  useAppStore.getState().setActiveTokenId(token.id);

  return token;
}

/**
 * Atomic FIFO Call Next Customer
 */
export async function callNextCustomer(
  barberId: string,
  chairNumber: number
): Promise<TokenItem | null> {
  const allTokens = await fetchQueueEntries();

  // Find the earliest WAITING FIFO customer matching barber or ANY
  const eligibleToken = allTokens
    .filter((t) => t.status === 'WAITING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .find((t) => t.barberPreference === 'ANY' || t.barberPreference === barberId);

  if (!eligibleToken) {
    return null;
  }

  const now = new Date().toISOString();

  // Optimistic update
  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      status: 'CALLED',
      assigned_barber_id: barberId,
      chair_number: chairNumber,
      called_at: now,
    })
    .eq('id', eligibleToken.id)
    .eq('status', 'WAITING')
    .select()
    .single();

  if (error || !data) {
    // If conflict / already called by someone else, retry once
    const refreshed = await fetchQueueEntries();
    const retryToken = refreshed
      .filter((t) => t.status === 'WAITING')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .find((t) => t.barberPreference === 'ANY' || t.barberPreference === barberId);

    if (!retryToken) return null;

    const retryRes = await supabase
      .from('queue_entries')
      .update({
        status: 'CALLED',
        assigned_barber_id: barberId,
        chair_number: chairNumber,
        called_at: now,
      })
      .eq('id', retryToken.id)
      .eq('status', 'WAITING')
      .select()
      .single();

    if (retryRes.data) {
      const resToken = mapRowToToken(retryRes.data);
      useAppStore.getState().upsertToken(resToken);
      playAudioChime();
      return resToken;
    }
    return null;
  }

  const updatedToken = mapRowToToken(data);
  useAppStore.getState().upsertToken(updatedToken);
  playAudioChime();
  return updatedToken;
}

/**
 * Barber starts customer service
 */
export async function startService(tokenId: string): Promise<TokenItem> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      status: 'IN_SERVICE',
      started_at: now,
    })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const updated = mapRowToToken(data);
  useAppStore.getState().upsertToken(updated);
  return updated;
}

/**
 * Barber marks customer service DONE
 */
export async function markDone(tokenId: string): Promise<TokenItem> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      status: 'DONE',
      done_at: now,
    })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const updated = mapRowToToken(data);
  useAppStore.getState().upsertToken(updated);
  return updated;
}

/**
 * Mark a token as NO_SHOW
 */
export async function markNoShow(tokenId: string): Promise<TokenItem> {
  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      status: 'NO_SHOW',
    })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const updated = mapRowToToken(data);
  useAppStore.getState().upsertToken(updated);
  return updated;
}

/**
 * Cancel a waiting token
 */
export async function cancelToken(tokenId: string): Promise<TokenItem> {
  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      status: 'CANCELLED',
    })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const updated = mapRowToToken(data);
  useAppStore.getState().upsertToken(updated);
  return updated;
}

/**
 * Reassign barber (Allowed ONLY if customer chose ANY barber)
 */
export async function reassignBarber(
  tokenId: string,
  newBarberId: string,
  newChairNumber: number
): Promise<TokenItem> {
  // Check token immutability rule
  const token = cachedTokens.find((t) => t.id === tokenId);
  if (token && token.isLockedToBarber) {
    throw new Error(
      'Customer requested a specific barber. Reassignment is not permitted.'
    );
  }

  const { data, error } = await supabase
    .from('queue_entries')
    .update({
      assigned_barber_id: newBarberId,
      chair_number: newChairNumber,
    })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const updated = mapRowToToken(data);
  useAppStore.getState().upsertToken(updated);
  return updated;
}

/**
 * Calculate remaining 10-minute grace period seconds
 */
export function getRemainingGraceSeconds(calledAt: string | null): number {
  if (!calledAt) return 0;
  const calledTimeMs = new Date(calledAt).getTime();
  const nowMs = Date.now();
  const elapsedSeconds = Math.floor((nowMs - calledTimeMs) / 1000);
  const remainingSeconds = 600 - elapsedSeconds; // 10 minutes = 600 seconds
  return Math.max(0, remainingSeconds);
}

/**
 * Format grace seconds into MM:SS
 */
export function formatGraceTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Standard Waiting-Time Formula:
 * Estimated Wait Time = (Total Estimated Service Duration of Customers Ahead) / (Number of Working Barbers)
 */
export function calculateEstimatedWaitTime(
  tokens: TokenItem[],
  targetTokenId: string | null,
  barbers: BarberProfile[]
): { minutes: number; workingBarbersCount: number; peopleAhead: number } {
  // Working barbers: AVAILABLE or BUSY. Exclude ON_BREAK and OFF_DUTY.
  const workingBarbers = barbers.filter(
    (b) => b.status === 'AVAILABLE' || (b as any).status === 'BUSY'
  );
  const workingBarbersCount = workingBarbers.length;

  // Active tokens waiting
  const waitingTokens = tokens
    .filter((t) => t.status === 'WAITING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (!targetTokenId) {
    // Total wait time for a new joiner
    const totalDurationAhead = waitingTokens.reduce(
      (sum, t) => sum + t.totalDurationMinutes,
      0
    );

    if (workingBarbersCount === 0) {
      return { minutes: 0, workingBarbersCount: 0, peopleAhead: waitingTokens.length };
    }

    const minutes = Math.max(
      5,
      Math.ceil(totalDurationAhead / workingBarbersCount)
    );
    return {
      minutes,
      workingBarbersCount,
      peopleAhead: waitingTokens.length,
    };
  }

  // Position of target token
  const targetIndex = waitingTokens.findIndex((t) => t.id === targetTokenId);

  if (targetIndex === -1) {
    // Check if called or in service
    const targetToken = tokens.find((t) => t.id === targetTokenId);
    if (targetToken?.status === 'CALLED' || targetToken?.status === 'IN_SERVICE') {
      return { minutes: 0, workingBarbersCount, peopleAhead: 0 };
    }
    return { minutes: 0, workingBarbersCount, peopleAhead: 0 };
  }

  // Tokens ahead in FIFO sequence
  const aheadTokens = waitingTokens.slice(0, targetIndex);
  const totalDurationAhead = aheadTokens.reduce(
    (sum, t) => sum + t.totalDurationMinutes,
    0
  );

  if (workingBarbersCount === 0) {
    return { minutes: 0, workingBarbersCount: 0, peopleAhead: aheadTokens.length };
  }

  const minutes = Math.ceil(totalDurationAhead / workingBarbersCount);
  return {
    minutes,
    workingBarbersCount,
    peopleAhead: aheadTokens.length,
  };
}

/**
 * Check if online queue registration is allowed based on salon timings & 30-min cutoff
 */
export function checkIsOnlineJoiningOpen(settings: SalonSettings): {
  isOpen: boolean;
  reason?: string;
  cutoffTime: string;
} {
  if (!settings.isOpen) {
    return {
      isOpen: false,
      reason: 'Salon is currently closed.',
      cutoffTime: 'Closed',
    };
  }

  const now = new Date();
  const [closeH, closeM] = settings.closeTime.split(':').map(Number);
  const [openH, openM] = settings.openTime.split(':').map(Number);

  // Calculate closing cutoff time (e.g. 21:00 - 30 mins = 20:30)
  const cutoffTotalMinutes = closeH * 60 + closeM - settings.onlineCutoffMinutes;
  const cutoffH = Math.floor(cutoffTotalMinutes / 60);
  const cutoffM = cutoffTotalMinutes % 60;
  const cutoffTime = `${String(cutoffH).padStart(2, '0')}:${String(cutoffM).padStart(2, '0')}`;

  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const openTotalMinutes = openH * 60 + openM;

  if (currentTotalMinutes < openTotalMinutes) {
    return {
      isOpen: false,
      reason: `Salon opens at ${settings.openTime}.`,
      cutoffTime,
    };
  }

  if (currentTotalMinutes >= cutoffTotalMinutes) {
    return {
      isOpen: false,
      reason: `Online queue closed 30 minutes before closing (at ${cutoffTime}). Walk-ins accepted at desk until ${settings.closeTime}.`,
      cutoffTime,
    };
  }

  return { isOpen: true, cutoffTime };
}

/**
 * Synthesizes a boutique lounge chime sound using Web Audio API
 */
export function playAudioChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Dual chime tones: C5 (523.25 Hz) then E5 (659.25 Hz)
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.6); // C5
    playTone(659.25, now + 0.25, 0.8); // E5
  } catch (err) {
    // Non-blocking if audio blocked by browser autoplay policy
    console.debug('Audio chime unable to play:', err);
  }
}
