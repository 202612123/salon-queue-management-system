'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { INITIAL_BARBERS } from '@/lib/constants';
import { BarberStatus } from '@/types';
import { 
  UserCheck, 
  Coffee, 
  Clock, 
  Play, 
  CheckCircle, 
  Bell, 
  Users
} from 'lucide-react';

export default function BarberViewPage() {
  const { language } = useAppStore();

  const [selectedBarberId, setSelectedBarberId] = useState('barber_amit');
  const [barberStatus, setBarberStatus] = useState<BarberStatus>('AVAILABLE');
  const [isServing, setIsServing] = useState(false);

  const currentBarber = INITIAL_BARBERS.find((b) => b.id === selectedBarberId) || INITIAL_BARBERS[1];

  const handleCallNext = () => {
    alert(
      language === 'en'
        ? `Phase 2: Atomic RPC call_next_customer('${selectedBarberId}') will select the earliest FIFO eligible customer from Supabase!`
        : `આગામી ગ્રાહક બોલાવવા માટે તૈયાર.`
    );
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Top Station Selector & Break Toggles */}
      <div className="bg-white border border-cream-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-cherry">
        
        {/* Barber Profile Selector */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cherry text-white flex items-center justify-center font-bold text-lg shadow-md shadow-cherry/20">
            {currentBarber.chairNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="bg-cream text-darkText font-bold text-base rounded-xl px-3 py-1.5 border border-cream-border focus:border-cherry outline-none"
              >
                {INITIAL_BARBERS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {language === 'en' ? b.name : b.nameGu} ({t('chairNumber', language)} {b.chairNumber})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-darkText-subtle font-medium block mt-0.5">
              {language === 'en' ? 'Mirror Station Tablet View' : 'મિરર સ્ટેશન વ્યુ'}
            </span>
          </div>
        </div>

        {/* Break Modes */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setBarberStatus('AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
              barberStatus === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            🟢 Available
          </button>

          <button
            onClick={() => setBarberStatus('ON_BREAK')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
              barberStatus === 'ON_BREAK'
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>15m Chai Break</span>
          </button>

          <button
            onClick={() => setBarberStatus('OFF_DUTY')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
              barberStatus === 'OFF_DUTY'
                ? 'bg-rose-50 text-rose-800 border border-rose-300 shadow-sm'
                : 'text-darkText-muted hover:text-darkText bg-cream'
            }`}
          >
            Off Duty
          </button>
        </div>

      </div>

      {/* Main Chair Status Hero Card */}
      <div className="bg-white border border-cream-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-cherry">
        
        <div className="flex items-center justify-between border-b border-cream-border pb-4">
          <span className="text-xs uppercase tracking-wider text-darkText-muted font-bold">
            {language === 'en' ? 'Current Station Customer' : 'હાલના ગ્રાહક'}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blush-light text-cherry font-mono font-bold border border-blush">
            Chair {currentBarber.chairNumber}
          </span>
        </div>

        {/* Active Client Details Preview */}
        <div className="text-center py-8 space-y-3">
          <div className="text-5xl font-extrabold text-cherry font-mono tracking-wider">
            Ready
          </div>
          <p className="text-sm text-darkText-muted font-medium">
            {language === 'en'
              ? 'No client seated right now. Click below to call the next customer.'
              : 'ખુરશી ખાલી છે. આગામી ગ્રાહકને બોલાવવા નીચે ક્લિક કરો.'}
          </p>
        </div>

        {/* Giant Tactile 64px Tap Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-cream-border">
          <button
            onClick={handleCallNext}
            className="h-16 rounded-2xl bg-cherry hover:bg-cherry-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-cherry hover:shadow-cherry-lg active:scale-[0.98] transition-all"
          >
            <Bell className="w-5 h-5 stroke-[2.5]" />
            <span>{t('callNextCustomer', language)}</span>
          </button>

          <button
            onClick={() => setIsServing(!isServing)}
            className="h-16 rounded-2xl bg-cream hover:bg-cream-muted border border-cream-border text-darkText font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Play className="w-4 h-4 text-emerald-700" />
            <span>{language === 'en' ? 'Start Service Timer' : 'સેવા શરૂ કરો'}</span>
          </button>
        </div>

      </div>

      {/* Upcoming Clients Queue for this Stylist */}
      <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-3 shadow-cherry-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-cherry">
          <Users className="w-4 h-4 text-rose" />
          <span>{language === 'en' ? 'Upcoming Eligible Clients' : 'આગામી લાઇન'}</span>
        </div>
        <p className="text-xs text-darkText-muted">
          {language === 'en'
            ? 'Displays customers who chose this stylist or Any Available in strict FIFO sequence.'
            : 'FIFO ક્રમ અનુસાર આ વાળંદ અથવા કોઈપણ ઉપલબ્ધ વાળંદ પસંદ કરેલ ગ્રાહકોની યાદી.'}
        </p>
      </div>

    </div>
  );
}
