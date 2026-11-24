'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { STUDENT_CREDITS } from '@/lib/constants';
import { 
  Scissors, 
  Clock, 
  Bell, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Sparkles, 
  Coffee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  subscribeToQueue, 
  getRemainingGraceSeconds, 
  formatGraceTimer, 
  calculateEstimatedWaitTime,
  playAudioChime 
} from '@/lib/queueService';
import { TokenItem } from '@/types';

export default function WaitingAreaTvPage() {
  const { language, barbers, services } = useAppStore();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const prevCalledTokenIdsRef = useRef<Set<string>>(new Set());

  // Live Clock & Date update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Real-time queue subscription and audio chime trigger
  useEffect(() => {
    const unsub = subscribeToQueue((allTokens) => {
      setTokens(allTokens);

      // Detect newly called tokens to play chime
      const currentCalledTokens = allTokens.filter((t) => t.status === 'CALLED');
      const newlyCalled = currentCalledTokens.filter(
        (t) => !prevCalledTokenIdsRef.current.has(t.id)
      );

      if (newlyCalled.length > 0 && audioEnabled) {
        playAudioChime();
      }

      prevCalledTokenIdsRef.current = new Set(currentCalledTokens.map((t) => t.id));
    });

    return () => unsub();
  }, [audioEnabled]);

  // Periodic grace period recalculation ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const ticker = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(ticker);
  }, []);

  const waitingTokens = tokens
    .filter((t) => t.status === 'WAITING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Helper to find client seated at a chair station
  const getChairCustomer = (chairNum: number, barberId: string) => {
    // 1. IN_SERVICE at this chair/barber
    const inService = tokens.find(
      (t) =>
        t.status === 'IN_SERVICE' &&
        (t.chairNumber === chairNum || t.assignedBarberId === barberId)
    );
    if (inService) return { token: inService, mode: 'IN_SERVICE' as const };

    // 2. CALLED to this chair/barber
    const called = tokens.find(
      (t) =>
        t.status === 'CALLED' &&
        (t.chairNumber === chairNum || t.assignedBarberId === barberId)
    );
    if (called) return { token: called, mode: 'CALLED' as const };

    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-cream text-darkText min-h-screen select-none overflow-x-hidden font-sans">
      
      {/* Top Header Banner in Deep Cherry */}
      <header className="h-20 bg-cherry text-white px-6 sm:px-8 flex items-center justify-between shadow-cherry shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry flex items-center justify-center shadow-sm">
            <Scissors className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Trim &amp; Tone <span className="text-blush font-light">| Boutique Lounge</span>
            </h1>
            <p className="text-xs text-blush-light">
              {currentDate}
            </p>
          </div>
        </div>

        {/* Live Digital Clock & Audio Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playAudioChime();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              audioEnabled
                ? 'bg-blush-light text-cherry border-blush'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title="Toggle Chime Sound"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cherry" /> : <VolumeX className="w-4 h-4 text-blush" />}
            <span>{audioEnabled ? 'Chime Active' : 'Enable Chime'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200 bg-emerald-900/40 border border-emerald-400/40 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Near-Real-Time</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-xl font-mono font-bold text-blush tracking-wider">
            {currentTime || '04:30 PM'}
          </div>
        </div>
      </header>

      {/* Main Split Grid: Left NOW SERVING (60%), Right UP NEXT (40%) */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 sm:p-8">
        
        {/* Left Section: NOW SERVING */}
        <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <div className="flex items-center gap-3 text-cherry font-black tracking-wider text-xl">
              <Bell className="w-6 h-6 text-cherry animate-pulse" />
              <span>{t('nowServing', language)}</span>
            </div>
            <span className="text-xs font-bold text-darkText-muted uppercase">
              {barbers.length} Active Stations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {barbers.map((barber) => {
              const active = getChairCustomer(barber.chairNumber, barber.id);
              const isOnBreak = barber.status === 'ON_BREAK';
              const isOffDuty = barber.status === 'OFF_DUTY';

              // Service names
              const activeServices = active?.token
                ? services
                    .filter((s) => active.token.serviceIds?.includes(s.id))
                    .map((s) => (language === 'gu' ? s.nameGu : s.nameEn))
                    .join(' + ')
                : '';

              const graceRemaining = active?.token?.calledAt
                ? getRemainingGraceSeconds(active.token.calledAt)
                : 0;

              return (
                <div
                  key={barber.id}
                  className={`border rounded-2xl p-6 flex flex-col justify-between shadow-cherry relative overflow-hidden transition-all ${
                    active?.mode === 'CALLED'
                      ? 'bg-blush-light border-cherry ring-2 ring-cherry/40 animate-pulse'
                      : active?.mode === 'IN_SERVICE'
                      ? 'bg-white border-cream-border ring-1 ring-emerald-500/20'
                      : isOnBreak
                      ? 'bg-amber-50/60 border-amber-200'
                      : isOffDuty
                      ? 'bg-gray-50 border-gray-200 opacity-70'
                      : 'bg-white border-cream-border'
                  }`}
                >
                  {/* Station Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cream border border-cream-border text-darkText">
                      Chair {barber.chairNumber}
                    </span>

                    {active?.mode === 'CALLED' ? (
                      <span className="text-xs font-bold text-cherry bg-white px-2.5 py-1 rounded-full border border-blush animate-bounce">
                        {t('callingNow', language)}
                      </span>
                    ) : active?.mode === 'IN_SERVICE' ? (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                        {language === 'en' ? 'In Service' : 'સેવા ચાલુ'}
                      </span>
                    ) : isOnBreak ? (
                      <span className="text-xs text-amber-800 font-bold flex items-center gap-1 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Coffee className="w-3 h-3 text-amber-700" />
                        <span>Break</span>
                      </span>
                    ) : isOffDuty ? (
                      <span className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                        Off Duty
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{t('available', language)}</span>
                      </span>
                    )}
                  </div>

                  {/* Token Number Hero Display */}
                  <div className="py-5 text-center space-y-1">
                    {active ? (
                      <>
                        <div className="text-6xl font-black text-cherry font-mono tracking-tight">
                          {active.token.displayToken}
                        </div>
                        <p className="text-sm font-bold text-darkText truncate">
                          {active.token.customerName}
                        </p>
                        {active.mode === 'CALLED' && (
                          <div className="inline-block mt-2 font-mono font-extrabold text-sm text-cherry bg-white px-3 py-1 rounded-xl border border-blush">
                            ⏱ Grace: {formatGraceTimer(graceRemaining)}
                          </div>
                        )}
                      </>
                    ) : isOnBreak ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-amber-800 font-mono">
                          {barber.currentBreakMinutes === 30 ? '30m Lunch' : '15m Chai'}
                        </div>
                        <p className="text-xs text-amber-700 font-medium">Temporarily on break</p>
                      </div>
                    ) : isOffDuty ? (
                      <div className="text-2xl font-bold text-gray-500 font-mono">
                        Off Duty
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-4xl font-extrabold text-darkText-muted/60 font-mono">
                          Ready
                        </div>
                        <p className="text-xs text-darkText-subtle font-medium">Ready for next client</p>
                      </div>
                    )}
                  </div>

                  {/* Stylist & Service Footer */}
                  <div className="text-center pt-3 border-t border-cream-border text-xs text-darkText-subtle font-medium flex items-center justify-between">
                    <span>
                      Stylist: <strong className="text-darkText font-bold">{language === 'en' ? barber.name : barber.nameGu}</strong>
                    </span>
                    <span className="truncate max-w-[140px] text-[11px] text-darkText-muted">
                      {activeServices || (active ? `${active.token.totalDurationMinutes}m service` : 'Station idle')}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: UP NEXT */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4 bg-white border border-cream-border rounded-2xl p-6 shadow-cherry">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <div className="flex items-center gap-2 text-cherry font-black tracking-wider text-xl">
              <Clock className="w-6 h-6 text-cherry" />
              <span>{t('upNext', language)}</span>
            </div>
            <span className="text-xs text-darkText-muted font-bold uppercase">
              {waitingTokens.length} Waiting (FIFO)
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[560px] pr-1">
            {waitingTokens.length === 0 ? (
              <div className="text-center py-20 text-darkText-muted space-y-2">
                <Scissors className="w-10 h-10 text-rose/50 mx-auto" />
                <p className="text-sm font-bold text-darkText">
                  {language === 'en' ? 'No customers waiting in line.' : 'કતારમાં કોઈ ગ્રાહકો નથી.'}
                </p>
                <p className="text-xs text-darkText-subtle">
                  {language === 'en'
                    ? 'Scan QR code at salon entrance to join queue.'
                    : 'કતારમાં જોડાવા પ્રવેશ દ્વાર પર QR કોડ સ્કેન કરો.'}
                </p>
              </div>
            ) : (
              waitingTokens.map((item, index) => {
                const itemWait = calculateEstimatedWaitTime(tokens, item.id, barbers);
                const itemServices = services
                  .filter((s) => item.serviceIds?.includes(s.id))
                  .map((s) => (language === 'gu' ? s.nameGu : s.nameEn))
                  .join(', ');

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl flex items-center justify-between transition-all border ${
                      index === 0
                        ? 'bg-blush-light border-blush shadow-sm ring-1 ring-cherry/30'
                        : 'bg-cream border-cream-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center shrink-0">
                        <span className="text-2xl font-black font-mono text-cherry block">
                          {item.displayToken}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-darkText-muted">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-darkText truncate max-w-[160px]">
                          {item.customerName}
                        </p>
                        <p className="text-[11px] text-darkText-muted truncate max-w-[180px]">
                          {itemServices || `${item.totalDurationMinutes} mins`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-cherry font-mono block">
                        ~{itemWait.minutes}m
                      </span>
                      <span className="text-[10px] text-darkText-subtle font-medium">
                        {t('estimatedWaitTime', language)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Announcement Ticker in Soft Blush */}
      <div className="h-10 bg-blush-light border-t border-blush px-6 flex items-center justify-between text-xs text-cherry font-semibold shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Volume2 className="w-4 h-4 text-cherry shrink-0 animate-pulse" />
          <span className="truncate">
            {t('tvTicker', language)}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] shrink-0">
          <Wifi className="w-3.5 h-3.5 text-rose" />
          <span>Wi-Fi: <strong>SalonGuest</strong> | Pass: <strong>TrimTone2026</strong></span>
        </div>
      </div>

      {/* Bottom Academic Credits Bar (TV Screen Specific) */}
      <div className="bg-white border-t border-cream-border py-2 px-6 text-center text-[11px] text-darkText-muted shrink-0">
        <span>Developed by: <strong className="text-cherry">{STUDENT_CREDITS.developerName}</strong></span>
        <span className="mx-2 text-rose">•</span>
        <span>Student ID: <strong className="font-mono text-darkText">{STUDENT_CREDITS.studentId}</strong></span>
        <span className="mx-2 text-rose">•</span>
        <span>Course: <strong className="text-darkText">{STUDENT_CREDITS.course}</strong></span>
        <span className="mx-2 text-rose">•</span>
        <span>Institute: <strong className="text-darkText">{STUDENT_CREDITS.institute}</strong></span>
      </div>

    </div>
  );
}
