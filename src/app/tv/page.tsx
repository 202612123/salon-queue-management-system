'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { INITIAL_BARBERS, STUDENT_CREDITS } from '@/lib/constants';
import { Scissors, Clock, Bell, Volume2, Wifi, Sparkles } from 'lucide-react';

export default function WaitingAreaTvPage() {
  const { language } = useAppStore();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-cream text-darkText min-h-screen select-none overflow-hidden">
      
      {/* Top Header Banner in Deep Cherry */}
      <header className="h-20 bg-cherry text-white px-8 flex items-center justify-between shadow-cherry">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry flex items-center justify-center shadow-sm">
            <Scissors className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Trim &amp; Tone <span className="text-blush font-light">| Boutique Lounge</span>
            </h1>
            <p className="text-xs text-blush-light">
              {language === 'en' ? 'Lounge Queue Display System' : 'વેઇટિંગ લાઉન્જ કતાર બોર્ડ'}
            </p>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-200 bg-emerald-900/40 border border-emerald-400/40 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Near-Real-Time Stream Active</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-lg font-mono font-bold text-blush">
            {currentTime || '04:30 PM'}
          </div>
        </div>
      </header>

      {/* Main Split Grid: Left NOW SERVING (60%), Right UP NEXT (40%) */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-8">
        
        {/* Left Section: NOW SERVING */}
        <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center gap-3 text-cherry font-black tracking-wider text-xl border-b border-cream-border pb-3">
            <Bell className="w-6 h-6 text-cherry" />
            <span>{t('nowServing', language)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {INITIAL_BARBERS.map((barber) => (
              <div
                key={barber.id}
                className="bg-white border border-cream-border rounded-2xl p-6 flex flex-col justify-between shadow-cherry relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blush-light text-cherry border border-blush">
                    Chair {barber.chairNumber}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    {language === 'en' ? 'Serving' : 'સેવા ચાલુ'}
                  </span>
                </div>

                <div className="py-4 text-center space-y-1">
                  <div className="text-5xl font-black text-cherry font-mono tracking-tight">
                    {barber.chairNumber === 1 ? 'A-101' : barber.chairNumber === 2 ? 'W-102' : 'Ready'}
                  </div>
                  <p className="text-xs text-darkText-muted font-medium">
                    {language === 'en' ? 'Stylist: ' : 'વાળંદ: '}
                    <strong className="text-darkText font-bold">{language === 'en' ? barber.name : barber.nameGu}</strong>
                  </p>
                </div>

                <div className="text-center pt-2 border-t border-cream-border text-[11px] text-darkText-subtle font-medium">
                  {barber.chairNumber === 1 ? "Classic Haircut • ~15 mins left" : barber.chairNumber === 2 ? "Beard Trim • ~10 mins left" : "Available for next customer"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: UP NEXT */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4 bg-white border border-cream-border rounded-2xl p-6 shadow-cherry">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <div className="flex items-center gap-2 text-cherry font-black tracking-wider text-xl">
              <Clock className="w-6 h-6 text-cherry" />
              <span>{t('upNext', language)}</span>
            </div>
            <span className="text-xs text-darkText-muted font-bold">
              FIFO Sequence
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="bg-blush-light border border-blush p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black font-mono text-cherry">A-103</span>
                <div>
                  <p className="text-xs font-bold text-darkText">Bhavin Patel</p>
                  <p className="text-[11px] text-darkText-muted font-medium">Haircut + Beard Trim</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cherry">~15 mins</span>
                <span className="block text-[10px] text-darkText-subtle">Est. Wait</span>
              </div>
            </div>

            <div className="bg-cream border border-cream-border p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono text-darkText">W-104</span>
                <div>
                  <p className="text-xs font-bold text-darkText">Aarav Shah</p>
                  <p className="text-[11px] text-darkText-muted font-medium">Royal Shave</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-darkText">~22 mins</span>
                <span className="block text-[10px] text-darkText-subtle">Est. Wait</span>
              </div>
            </div>

            <div className="bg-cream border border-cream-border p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono text-darkText-muted">A-105</span>
                <div>
                  <p className="text-xs font-bold text-darkText">Chirag Dave</p>
                  <p className="text-[11px] text-darkText-muted font-medium">D-Tan Face Glow</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-darkText-muted">~30 mins</span>
                <span className="block text-[10px] text-darkText-subtle">Est. Wait</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Announcement Ticker in Soft Blush */}
      <div className="h-10 bg-blush-light border-t border-blush px-6 flex items-center justify-between text-xs text-cherry font-semibold">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cherry shrink-0 animate-pulse" />
          <span className="truncate">
            {t('tvTicker', language)}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] shrink-0">
          <Wifi className="w-3.5 h-3.5 text-rose" />
          <span>Wi-Fi: SalonGuest</span>
        </div>
      </div>

    </div>
  );
}
