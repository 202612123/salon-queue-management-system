'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { INITIAL_SERVICES, INITIAL_BARBERS } from '@/lib/constants';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Phone, 
  Clock, 
  Check, 
  Filter, 
  RotateCw,
  Bell,
  Play,
  CheckCircle2,
  UserX,
  Lock
} from 'lucide-react';

export default function ReceptionDashboardPage() {
  const { language } = useAppStore();

  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv_haircut']);
  const [barberPref, setBarberPref] = useState('ANY');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    alert(`Fast walk-in token for ${walkInName} will be recorded in Supabase in Phase 2!`);
    setWalkInName('');
    setWalkInPhone('');
  };

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush-light text-cherry border border-blush flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-cherry tracking-tight">
              {t('navReception', language)}
            </h1>
            <p className="text-xs text-darkText-muted">
              {language === 'en'
                ? 'Front-Desk Queue Controller & Fast Walk-in Entry'
                : 'રિસેપ્શન કતાર કંટ્રોલર અને વોક-ઇન મેનેજમેન્ટ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            {language === 'en' ? 'Live Desk Active' : 'ડેસ્ક સક્રિય છે'}
          </span>
        </div>
      </div>

      {/* Grid: Left Walk-in Panel, Center/Right Queue Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Fast Walk-In Entry Form */}
        <div className="lg:col-span-4 bg-white border border-cream-border rounded-2xl p-5 space-y-5 h-fit shadow-cherry">
          <div className="flex items-center gap-2 text-cherry font-bold text-sm border-b border-cream-border pb-3">
            <UserPlus className="w-4 h-4 text-rose" />
            <span>{t('fastWalkIn', language)}</span>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                {t('fullName', language)} *
              </label>
              <input
                type="text"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText focus:outline-none focus:border-cherry focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                {t('phoneNumber', language)} (Optional)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText focus:outline-none focus:border-cherry focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                {t('selectServices', language)}
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {INITIAL_SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSelectedServices((prev) =>
                        prev.includes(s.id) ? prev.filter((i) => i !== s.id) : [...prev, s.id]
                      )
                    }
                    className={`text-left p-2 rounded-lg border text-[11px] truncate transition-colors ${
                      selectedServices.includes(s.id)
                        ? 'bg-blush-light border-cherry text-cherry font-bold'
                        : 'bg-cream border-cream-border text-darkText-muted'
                    }`}
                  >
                    {language === 'en' ? s.nameEn : s.nameGu}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                {t('barberPreference', language)}
              </label>
              <select
                value={barberPref}
                onChange={(e) => setBarberPref(e.target.value)}
                className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText focus:outline-none focus:border-cherry focus:bg-white font-medium"
              >
                <option value="ANY">{t('anyAvailableBarber', language)}</option>
                {INITIAL_BARBERS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {language === 'en' ? b.name : b.nameGu} ({t('chairNumber', language)} {b.chairNumber})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-cherry transition-all active:scale-95"
            >
              <span>{t('issueToken', language)} (Enter)</span>
            </button>
          </form>
        </div>

        {/* Right Column (8 cols): Queue Table & Barber Chairs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Barber Station Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INITIAL_BARBERS.map((barber) => (
              <div
                key={barber.id}
                className="bg-white border border-cream-border p-3.5 rounded-2xl space-y-1.5 shadow-cherry-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cherry font-bold">
                    Chair {barber.chairNumber}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </div>
                <p className="text-xs font-bold text-darkText truncate">
                  {language === 'en' ? barber.name : barber.nameGu}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  {barber.status === 'AVAILABLE' ? 'Available' : 'On Break'}
                </p>
              </div>
            ))}
          </div>

          {/* Live FIFO Queue Table */}
          <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-border pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cherry">
                <Users className="w-4 h-4 text-rose" />
                <span>{language === 'en' ? 'Live FIFO Queue' : 'લાઇવ કતાર યાદી'}</span>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 text-xs">
                {['ALL', 'WAITING', 'CALLED', 'IN_SERVICE', 'DONE'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      statusFilter === filter
                        ? 'bg-cherry text-white'
                        : 'text-darkText-muted hover:text-cherry bg-cream'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Queue State */}
            <div className="text-center py-12 text-darkText-muted space-y-2">
              <Users className="w-8 h-8 mx-auto text-rose/70 mb-2" />
              <p className="text-xs font-bold text-darkText">
                {language === 'en'
                  ? 'Queue is currently empty. Ready for new customers.'
                  : 'કતાર ખાલી છે. નવા ગ્રાહકો માટે તૈયાર.'}
              </p>
              <p className="text-[11px] text-darkText-subtle">
                {language === 'en'
                  ? 'Use the walk-in form on the left or scan QR code at entrance.'
                  : 'ડાબી બાજુના ફોર્મ દ્વારા નવું ટોકન બનાવો.'}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
