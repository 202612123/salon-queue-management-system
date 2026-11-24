'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BarberStatus, TokenItem } from '@/types';
import { 
  UserCheck, 
  Coffee, 
  Clock, 
  Play, 
  CheckCircle, 
  Bell, 
  Users, 
  Scissors,
  UserX,
  AlertCircle,
  Timer
} from 'lucide-react';
import { 
  subscribeToQueue, 
  callNextCustomer, 
  startService, 
  markDone, 
  markNoShow, 
  getRemainingGraceSeconds, 
  formatGraceTimer 
} from '@/lib/queueService';

export default function BarberViewPage() {
  const { language, barbers, updateBarberStatus, services } = useAppStore();

  const [selectedBarberId, setSelectedBarberId] = useState('barber_amit');
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subscribe to live queue changes
  useEffect(() => {
    const unsub = subscribeToQueue(setTokens);
    return () => unsub();
  }, []);

  // Ticker for Grace Timer and Elapsed Service Timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];

  // Find active customer for this barber
  const activeClient = tokens.find(
    (t) =>
      (t.status === 'CALLED' || t.status === 'IN_SERVICE') &&
      (t.assignedBarberId === currentBarber.id || t.chairNumber === currentBarber.chairNumber)
  );

  // Eligible upcoming waiting clients for this stylist in FIFO order
  const upcomingQueue = tokens
    .filter(
      (t) =>
        t.status === 'WAITING' &&
        (t.barberPreference === 'ANY' || t.barberPreference === currentBarber.id)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Handle Call Next Customer (Atomic FIFO selection)
  const handleCallNext = async () => {
    if (activeClient) {
      setNotification({
        type: 'error',
        message:
          language === 'en'
            ? 'A customer is already assigned to this chair. Please complete or mark no-show first.'
            : 'આ ખુરશી પર પહેલેથી જ ગ્રાહક ફાળવેલ છે.',
      });
      return;
    }

    setIsCalling(true);
    setNotification(null);

    try {
      const called = await callNextCustomer(currentBarber.id, currentBarber.chairNumber);
      if (called) {
        setNotification({
          type: 'success',
          message: `${called.displayToken} (${called.customerName}) summoned to Chair ${currentBarber.chairNumber}!`,
        });
      } else {
        setNotification({
          type: 'error',
          message: t('noEligibleCustomer', language),
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Error calling customer',
      });
    } finally {
      setIsCalling(false);
    }
  };

  const handleStartService = async () => {
    if (!activeClient) return;
    try {
      await startService(activeClient.id);
      setNotification({
        type: 'success',
        message: 'Customer seated. Service timer started!',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleMarkDone = async () => {
    if (!activeClient) return;
    try {
      await markDone(activeClient.id);
      setNotification({
        type: 'success',
        message: 'Haircut/service marked DONE. Chair is now free for next client!',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleMarkNoShow = async () => {
    if (!activeClient) return;
    try {
      await markNoShow(activeClient.id);
      setNotification({
        type: 'success',
        message: 'Customer marked as No-Show. Chair is now free.',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Calculate elapsed service seconds for IN_SERVICE client
  const getElapsedSeconds = (startedAt: string | null) => {
    if (!startedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  };

  const activeServices = activeClient
    ? services
        .filter((s) => activeClient.serviceIds?.includes(s.id))
        .map((s) => (language === 'gu' ? s.nameGu : s.nameEn))
        .join(' + ')
    : '';

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Top Station Selector & Break Controls */}
      <div className="bg-white border border-cream-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-cherry">
        
        {/* Barber Profile Selector */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cherry text-white flex items-center justify-center font-mono font-bold text-lg shadow-md shadow-cherry/20">
            {currentBarber.chairNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="bg-cream text-darkText font-bold text-base rounded-xl px-3 py-1.5 border border-cream-border focus:border-cherry outline-none"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {language === 'en' ? b.name : b.nameGu} ({t('chairNumber', language)} {b.chairNumber})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-darkText-subtle font-medium block mt-0.5">
              {language === 'en' ? 'Mirror Station Tablet View' : 'મિરર સ્ટેશન ટેબ્લેટ વ્યુ'}
            </span>
          </div>
        </div>

        {/* Break Modes Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => updateBarberStatus(currentBarber.id, 'AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              currentBarber.status === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            🟢 {t('available', language)}
          </button>

          <button
            onClick={() => updateBarberStatus(currentBarber.id, 'ON_BREAK', 15)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              currentBarber.status === 'ON_BREAK' && currentBarber.currentBreakMinutes === 15
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('teaBreak15', language)}</span>
          </button>

          <button
            onClick={() => updateBarberStatus(currentBarber.id, 'ON_BREAK', 30)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              currentBarber.status === 'ON_BREAK' && currentBarber.currentBreakMinutes === 30
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('lunchBreak30', language)}</span>
          </button>

          <button
            onClick={() => updateBarberStatus(currentBarber.id, 'OFF_DUTY')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              currentBarber.status === 'OFF_DUTY'
                ? 'bg-rose-50 text-rose-800 border border-rose-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            {t('offDuty', language)}
          </button>
        </div>

      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Main Chair Status Hero Card */}
      <div className="bg-white border border-cream-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-cherry">
        
        <div className="flex items-center justify-between border-b border-cream-border pb-4">
          <span className="text-xs uppercase tracking-wider text-darkText-muted font-bold">
            {t('currentlyServing', language)} • Station {currentBarber.chairNumber}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blush-light text-cherry font-mono font-bold border border-blush">
            Chair {currentBarber.chairNumber}
          </span>
        </div>

        {/* Active Client Details Preview */}
        {activeClient ? (
          <div className="space-y-4">
            <div className="text-center py-4 space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                activeClient.status === 'CALLED'
                  ? 'bg-blush-light text-cherry border border-blush animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {activeClient.status === 'CALLED' ? t('statusCalled', language) : t('statusInService', language)}
              </span>

              <div className="text-5xl font-black text-cherry font-mono tracking-tight">
                {activeClient.displayToken}
              </div>

              <p className="text-lg font-bold text-darkText">
                {activeClient.customerName} • <span className="font-mono text-sm text-darkText-muted">{activeClient.phoneNumber}</span>
              </p>

              <p className="text-xs text-darkText-muted font-medium">
                Services: <strong className="text-darkText">{activeServices || `${activeClient.totalDurationMinutes} mins`}</strong> (₹{activeClient.totalPrice})
              </p>
            </div>

            {/* 10-Minute Grace Window Callout (when CALLED) */}
            {activeClient.status === 'CALLED' && activeClient.calledAt && (
              <div className="bg-blush-light border border-blush p-4 rounded-xl flex items-center justify-between text-xs text-cherry">
                <div className="flex items-center gap-2 font-bold">
                  <Bell className="w-4 h-4 text-cherry animate-bounce" />
                  <span>10-Minute Grace Countdown Active</span>
                </div>
                <div className="font-mono font-extrabold text-base bg-white px-3 py-1 rounded-lg border border-blush">
                  ⏱ {formatGraceTimer(getRemainingGraceSeconds(activeClient.calledAt))}
                </div>
              </div>
            )}

            {/* In-Service Stopwatch (when IN_SERVICE) */}
            {activeClient.status === 'IN_SERVICE' && activeClient.startedAt && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <Timer className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>Elapsed Service Duration:</span>
                </div>
                <div className="font-mono font-extrabold text-base bg-white px-3 py-1 rounded-lg border border-emerald-200 text-emerald-800">
                  {formatGraceTimer(getElapsedSeconds(activeClient.startedAt))}
                </div>
              </div>
            )}

            {/* Action Buttons for Active Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {activeClient.status === 'CALLED' && (
                <>
                  <button
                    onClick={handleStartService}
                    className="h-16 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>{t('startService', language)}</span>
                  </button>

                  <button
                    onClick={handleMarkNoShow}
                    className="h-16 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <UserX className="w-5 h-5 text-rose-700" />
                    <span>{t('markNoShow', language)}</span>
                  </button>
                </>
              )}

              {activeClient.status === 'IN_SERVICE' && (
                <button
                  onClick={handleMarkDone}
                  className="sm:col-span-2 h-16 rounded-2xl bg-cherry hover:bg-cherry-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-cherry hover:shadow-cherry-lg transition-all active:scale-[0.98]"
                >
                  <CheckCircle className="w-6 h-6 stroke-[2.5]" />
                  <span>{t('markDone', language)} (Liberate Chair)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8 space-y-2">
              <div className="text-5xl font-extrabold text-cherry font-mono tracking-wider">
                {t('readyForNext', language)}
              </div>
              <p className="text-xs text-darkText-muted font-medium max-w-sm mx-auto">
                {t('noClientSeated', language)}
              </p>
            </div>

            {/* Giant Tactile 64px Tap Action Button */}
            <button
              onClick={handleCallNext}
              disabled={isCalling || currentBarber.status !== 'AVAILABLE'}
              className="w-full h-16 rounded-2xl bg-cherry hover:bg-cherry-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-cherry hover:shadow-cherry-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Bell className="w-5 h-5 stroke-[2.5]" />
              <span>{isCalling ? 'Selecting FIFO Customer...' : t('callNextCustomer', language)}</span>
            </button>
          </div>
        )}

      </div>

      {/* Upcoming Eligible Clients Queue for this Stylist */}
      <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry-sm">
        <div className="flex items-center justify-between border-b border-cream-border pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-cherry">
            <Users className="w-4 h-4 text-rose" />
            <span>{t('upcomingClients', language)}</span>
          </div>
          <span className="text-xs font-bold text-darkText-muted">
            {upcomingQueue.length} Eligible Waiting
          </span>
        </div>

        {upcomingQueue.length === 0 ? (
          <div className="text-center py-6 text-darkText-muted text-xs">
            <Scissors className="w-6 h-6 text-rose/50 mx-auto mb-1" />
            <span>No eligible customers in waiting line right now.</span>
          </div>
        ) : (
          <div className="divide-y divide-cream-border max-h-56 overflow-y-auto">
            {upcomingQueue.map((tok, idx) => (
              <div key={tok.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cherry text-sm">
                    {tok.displayToken}
                  </span>
                  <div>
                    <p className="font-bold text-darkText">{tok.customerName}</p>
                    <p className="text-[10px] text-darkText-muted">
                      {tok.barberPreference === 'ANY' ? 'Any Stylist' : 'Prefers You'} • {tok.totalDurationMinutes}m
                    </p>
                  </div>
                </div>
                <span className="text-darkText-subtle font-mono text-[11px]">
                  Pos #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
