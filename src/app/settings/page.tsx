'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { INITIAL_SERVICES, INITIAL_BARBERS } from '@/lib/constants';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Clock, 
  Scissors, 
  ShieldCheck, 
  Save, 
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const { language } = useAppStore();
  const [activeTab, setActiveTab] = useState<'metrics' | 'roster' | 'services' | 'operations'>('metrics');

  const handleSave = () => {
    alert(language === 'en' ? 'Settings saved in local store!' : 'સેટિંગ્સ સેવ થઈ ગયા!');
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush-light text-cherry border border-blush flex items-center justify-center">
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-cherry tracking-tight">
              {t('navSettings', language)}
            </h1>
            <p className="text-xs text-darkText-muted">
              {language === 'en'
                ? 'Owner Administration, Service Pricing & Queue Configuration'
                : 'સલૂન સંચાલન, સેવા કિંમત અને કતાર સેટિંગ્સ'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-xs flex items-center gap-2 shadow-cherry transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('saveSettings', language)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-border pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
            activeTab === 'metrics'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {language === 'en' ? 'Daily Metrics' : 'દૈનિક ગણતરી'}
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
            activeTab === 'roster'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {language === 'en' ? 'Barber Roster' : 'વાળંદ લિસ્ટ'}
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
            activeTab === 'services'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {language === 'en' ? 'Service Menu & Pricing' : 'સેવા અને કિંમત'}
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition-colors ${
            activeTab === 'operations'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {language === 'en' ? 'Queue Rules' : 'કતાર નિયમો'}
        </button>
      </div>

      {/* Tab 1: Daily Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {language === 'en' ? 'Clients Served (DONE)' : 'કુલ સેવા પૂર્ણ'}
              </span>
              <p className="text-2xl font-black text-cherry">42</p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">↑ 12% vs yesterday</span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {language === 'en' ? 'Avg. Wait Time' : 'સરેરાશ પ્રતીક્ષા સમય'}
              </span>
              <p className="text-2xl font-black text-cherry">19.4 <span className="text-xs font-medium text-darkText-muted">mins</span></p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Fast Turnaround</span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {language === 'en' ? 'No-Show / Cancelled' : 'ગેરહાજર / રદ'}
              </span>
              <p className="text-2xl font-black text-darkText-muted">3</p>
              <span className="text-[10px] text-darkText-subtle mt-1 block">Low cancellation</span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {language === 'en' ? 'Gross Revenue' : 'કુલ કમાણી'}
              </span>
              <p className="text-2xl font-black text-emerald-700">₹16,450</p>
              <span className="text-[10px] text-darkText-subtle mt-1 block">Today's billing</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Barber Roster */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry">
          <h2 className="text-sm font-bold text-cherry">
            {language === 'en' ? 'Active Barber Staff & Station Chairs' : 'હાજર વાળંદ સ્ટાફ'}
          </h2>
          <div className="divide-y divide-cream-border">
            {INITIAL_BARBERS.map((barber) => (
              <div key={barber.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-darkText text-sm">
                    {language === 'en' ? barber.name : barber.nameGu}
                  </p>
                  <p className="text-darkText-muted text-[11px] font-medium">Chair {barber.chairNumber}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {barber.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Service Menu & Pricing */}
      {activeTab === 'services' && (
        <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry">
          <h2 className="text-sm font-bold text-cherry">
            {language === 'en' ? 'Salon Services Catalog (₹ INR)' : 'સલૂન સેવાઓ અને કિંમત'}
          </h2>
          <div className="divide-y divide-cream-border">
            {INITIAL_SERVICES.map((service) => (
              <div key={service.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-darkText text-sm">
                    {language === 'en' ? service.nameEn : service.nameGu}
                  </p>
                  <p className="text-darkText-muted text-[11px] font-medium">{service.durationMinutes} mins</p>
                </div>
                <div className="text-right font-mono font-bold text-cherry text-base">
                  ₹{service.priceInr}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Queue Rules */}
      {activeTab === 'operations' && (
        <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry text-xs">
          <h2 className="text-sm font-bold text-cherry mb-2">
            {language === 'en' ? 'Core Queue Operational Parameters' : 'મુખ્ય કતાર સેટિંગ્સ'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cream p-4 rounded-xl border border-cream-border">
              <span className="text-darkText-muted block mb-1 font-medium">No-Show Grace Period</span>
              <strong className="text-cherry text-sm font-bold">10 Minutes (Database called_at)</strong>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border">
              <span className="text-darkText-muted block mb-1 font-medium">Online Queue Cutoff</span>
              <strong className="text-cherry text-sm font-bold">30 Minutes Before Closing (8:30 PM)</strong>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border">
              <span className="text-darkText-muted block mb-1 font-medium">Queue Sequencing Rule</span>
              <strong className="text-cherry text-sm font-bold">Strict FIFO with Barber/Any Matching</strong>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border">
              <span className="text-darkText-muted block mb-1 font-medium">Single Active Entry Constraint</span>
              <strong className="text-cherry text-sm font-bold">1 Token per Mobile Number</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
