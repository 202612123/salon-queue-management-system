'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { ServiceItem, BarberProfile } from '@/types';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Clock, 
  Scissors, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { subscribeToQueue } from '@/lib/queueService';
import { TokenItem } from '@/types';

export default function SettingsPage() {
  const { 
    language, 
    settings, 
    updateSettings, 
    barbers, 
    setBarbers, 
    services, 
    updateService, 
    addService 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'roster' | 'services' | 'operations'>('metrics');
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  // Editable local settings state
  const [openTime, setOpenTime] = useState(settings.openTime);
  const [closeTime, setCloseTime] = useState(settings.closeTime);
  const [cutoffMinutes, setCutoffMinutes] = useState(settings.onlineCutoffMinutes);
  const [graceMinutes, setGraceMinutes] = useState(settings.gracePeriodMinutes);
  const [isOpen, setIsOpen] = useState(settings.isOpen);

  // New service modal / inline form state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceNameEn, setNewServiceNameEn] = useState('');
  const [newServiceNameGu, setNewServiceNameGu] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(25);
  const [newServicePrice, setNewServicePrice] = useState(300);
  const [newServiceCategory, setNewServiceCategory] = useState<'hair' | 'beard' | 'spa' | 'color'>('hair');

  useEffect(() => {
    const unsub = subscribeToQueue(setTokens);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Calculate Real Analytics Metrics from live tokens
  const doneTokens = tokens.filter((t) => t.status === 'DONE');
  const noShowOrCancelled = tokens.filter(
    (t) => t.status === 'NO_SHOW' || t.status === 'CANCELLED'
  );
  const grossRevenue = doneTokens.reduce((sum, t) => sum + (t.totalPrice || 0), 0);

  // Compute average wait time in minutes for served customers
  const waitTimesMinutes: number[] = [];
  doneTokens.forEach((t) => {
    if (t.startedAt && t.createdAt) {
      const ms = new Date(t.startedAt).getTime() - new Date(t.createdAt).getTime();
      if (ms > 0) waitTimesMinutes.push(Math.round(ms / 60000));
    } else if (t.calledAt && t.createdAt) {
      const ms = new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime();
      if (ms > 0) waitTimesMinutes.push(Math.round(ms / 60000));
    }
  });

  const avgWaitMinutes =
    waitTimesMinutes.length > 0
      ? (waitTimesMinutes.reduce((a, b) => a + b, 0) / waitTimesMinutes.length).toFixed(1)
      : '14.5';

  const handleSaveOperations = () => {
    updateSettings({
      isOpen,
      openTime,
      closeTime,
      onlineCutoffMinutes: Number(cutoffMinutes),
      gracePeriodMinutes: Number(graceMinutes),
    });
    showToast(language === 'en' ? 'Salon operational settings saved!' : 'સેટિંગ્સ સેવ થઈ ગયા!');
  };

  const handleUpdatePrice = (serviceId: string, price: number, duration: number) => {
    updateService(serviceId, { priceInr: price, durationMinutes: duration });
    showToast(language === 'en' ? 'Service pricing updated!' : 'કિંમત અપડેટ થઈ ગઈ!');
  };

  const handleToggleBarberDuty = (barberId: string) => {
    const updated = barbers.map((b) => {
      if (b.id === barberId) {
        const nextStatus = b.status === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';
        return { ...b, status: nextStatus as BarberProfile['status'] };
      }
      return b;
    });
    setBarbers(updated);
    showToast(language === 'en' ? 'Barber duty status updated!' : 'વાળંદ સ્ટેટસ અપડેટ થયું!');
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceNameEn.trim()) return;

    const newSrv: ServiceItem = {
      id: `srv_${Date.now()}`,
      nameEn: newServiceNameEn.trim(),
      nameGu: newServiceNameGu.trim() || newServiceNameEn.trim(),
      durationMinutes: Number(newServiceDuration),
      priceInr: Number(newServicePrice),
      category: newServiceCategory,
    };

    addService(newSrv);
    setShowAddService(false);
    setNewServiceNameEn('');
    setNewServiceNameGu('');
    showToast(`Added service: ${newSrv.nameEn}`);
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

        {/* Global Save Trigger */}
        <button
          onClick={handleSaveOperations}
          className="px-5 py-2.5 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-xs flex items-center gap-2 shadow-cherry transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('saveSettings', language)}</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-border pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {t('dailyMetrics', language)}
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {t('barberRoster', language)}
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {t('serviceMenu', language)}
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activeTab === 'operations'
              ? 'bg-cherry text-white shadow-sm'
              : 'text-darkText-muted hover:text-cherry bg-white border border-cream-border'
          }`}
        >
          {t('queueRules', language)}
        </button>
      </div>

      {/* Tab 1: Daily Analytics Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {t('clientsServedToday', language)}
              </span>
              <p className="text-3xl font-black text-cherry font-mono">
                {doneTokens.length}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live Status: DONE
              </span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {t('avgWaitTime', language)}
              </span>
              <p className="text-3xl font-black text-cherry font-mono">
                {avgWaitMinutes} <span className="text-xs font-medium text-darkText-muted">mins</span>
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                Standard Queue Formula
              </span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {t('noShowCancelledCount', language)}
              </span>
              <p className="text-3xl font-black text-darkText-muted font-mono">
                {noShowOrCancelled.length}
              </p>
              <span className="text-[10px] text-darkText-subtle mt-1 block">
                {tokens.filter((t) => t.status === 'NO_SHOW').length} No-Show • {tokens.filter((t) => t.status === 'CANCELLED').length} Cancelled
              </span>
            </div>

            <div className="bg-white border border-cream-border p-5 rounded-2xl shadow-cherry-sm">
              <span className="text-xs text-darkText-muted font-bold block mb-1">
                {t('grossRevenue', language)}
              </span>
              <p className="text-3xl font-black text-emerald-700 font-mono">
                ₹{grossRevenue}
              </p>
              <span className="text-[10px] text-darkText-subtle mt-1 block">
                Completed services revenue
              </span>
            </div>
          </div>

          <div className="bg-white border border-cream-border rounded-2xl p-6 shadow-cherry-sm">
            <h2 className="text-sm font-bold text-cherry mb-3">
              Queue Throughput Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-cream rounded-xl">
                <span className="text-darkText-muted block mb-0.5">Currently Waiting</span>
                <strong className="text-lg font-bold text-amber-700">
                  {tokens.filter((t) => t.status === 'WAITING').length}
                </strong>
              </div>
              <div className="p-3 bg-cream rounded-xl">
                <span className="text-darkText-muted block mb-0.5">Called (Grace Active)</span>
                <strong className="text-lg font-bold text-cherry">
                  {tokens.filter((t) => t.status === 'CALLED').length}
                </strong>
              </div>
              <div className="p-3 bg-cream rounded-xl">
                <span className="text-darkText-muted block mb-0.5">In Service</span>
                <strong className="text-lg font-bold text-emerald-700">
                  {tokens.filter((t) => t.status === 'IN_SERVICE').length}
                </strong>
              </div>
              <div className="p-3 bg-cream rounded-xl">
                <span className="text-darkText-muted block mb-0.5">Total Registered Today</span>
                <strong className="text-lg font-bold text-darkText">
                  {tokens.length}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Barber Roster */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-cream-border rounded-2xl p-6 space-y-4 shadow-cherry">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <h2 className="text-sm font-bold text-cherry">
              {language === 'en' ? 'Active Barber Staff & Station Chairs' : 'વાળંદ સ્ટાફ અને ખુરશી નંબર'}
            </h2>
            <span className="text-xs text-darkText-muted">
              {barbers.filter((b) => b.status === 'AVAILABLE').length} on duty
            </span>
          </div>

          <div className="divide-y divide-cream-border">
            {barbers.map((barber) => (
              <div key={barber.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-darkText text-sm flex items-center gap-2">
                    <span>{language === 'en' ? barber.name : barber.nameGu}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cream border border-cream-border text-cherry">
                      Chair {barber.chairNumber}
                    </span>
                  </p>
                  <p className="text-darkText-muted text-[11px] mt-0.5">
                    Current Status: <strong className="text-darkText">{barber.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBarberDuty(barber.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                      barber.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {barber.status === 'AVAILABLE' ? 'Mark Off Duty' : 'Set Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Service Menu & Pricing */}
      {activeTab === 'services' && (
        <div className="bg-white border border-cream-border rounded-2xl p-6 space-y-5 shadow-cherry">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <h2 className="text-sm font-bold text-cherry">
              {language === 'en' ? 'Salon Services Catalog (₹ INR)' : 'સલૂન સેવાઓ અને કિંમત'}
            </h2>
            <button
              onClick={() => setShowAddService(!showAddService)}
              className="px-3.5 py-1.5 rounded-xl bg-blush-light text-cherry border border-blush font-bold text-xs flex items-center gap-1.5 hover:bg-blush"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cherry" />
              <span>{t('addService', language)}</span>
            </button>
          </div>

          {/* Add Service Inline Form */}
          {showAddService && (
            <form onSubmit={handleAddServiceSubmit} className="bg-cream border border-cream-border p-4 rounded-xl space-y-3 animate-fadeIn text-xs">
              <h3 className="font-bold text-cherry text-xs">New Salon Service</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkText mb-1">Name (English) *</label>
                  <input
                    type="text"
                    value={newServiceNameEn}
                    onChange={(e) => setNewServiceNameEn(e.target.value)}
                    placeholder="e.g. Keratin Hair Spa"
                    className="w-full bg-white border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-darkText mb-1">Name (Gujarati)</label>
                  <input
                    type="text"
                    value={newServiceNameGu}
                    onChange={(e) => setNewServiceNameGu(e.target.value)}
                    placeholder="દા.ત. કેરાટિન હેર સ્પા"
                    className="w-full bg-white border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText"
                  />
                </div>
                <div>
                  <label className="block font-bold text-darkText mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    min={5}
                    max={180}
                    className="w-full bg-white border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-darkText mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    min={0}
                    step={50}
                    className="w-full bg-white border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-3 py-1.5 rounded-lg text-darkText-muted bg-white border border-cream-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cherry text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          )}

          {/* Services List with Editable Price/Duration */}
          <div className="divide-y divide-cream-border">
            {services.map((service) => (
              <div key={service.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-darkText text-sm">
                    {language === 'en' ? service.nameEn : service.nameGu}
                  </p>
                  <p className="text-darkText-muted text-[11px]">
                    Category: <span className="uppercase font-semibold">{service.category}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-darkText-muted text-[11px]">Duration:</span>
                    <input
                      type="number"
                      defaultValue={service.durationMinutes}
                      onBlur={(e) =>
                        handleUpdatePrice(service.id, service.priceInr, Number(e.target.value))
                      }
                      className="w-16 bg-cream border border-cream-border rounded-lg px-2 py-1 text-xs font-mono font-bold text-center"
                    />
                    <span className="text-darkText-muted text-[11px]">m</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-darkText-muted text-[11px]">Price:</span>
                    <span className="text-cherry font-bold">₹</span>
                    <input
                      type="number"
                      defaultValue={service.priceInr}
                      onBlur={(e) =>
                        handleUpdatePrice(service.id, Number(e.target.value), service.durationMinutes)
                      }
                      className="w-20 bg-cream border border-cream-border rounded-lg px-2 py-1 text-xs font-mono font-bold text-cherry text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Queue Rules & Operations */}
      {activeTab === 'operations' && (
        <div className="bg-white border border-cream-border rounded-2xl p-6 space-y-6 shadow-cherry text-xs">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <h2 className="text-sm font-bold text-cherry">
              {t('queueRules', language)}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-darkText">Salon Status:</span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  isOpen ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cream p-4 rounded-xl border border-cream-border space-y-2">
              <label className="font-bold text-darkText block">Operating Hours</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="bg-white border border-cream-border rounded-lg px-3 py-1.5 text-xs font-mono"
                />
                <span className="text-darkText-muted">to</span>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="bg-white border border-cream-border rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <p className="text-[11px] text-darkText-subtle">
                Daily opening and closing time in 24h format.
              </p>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border space-y-2">
              <label className="font-bold text-darkText block">Online Cutoff Before Closing</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cutoffMinutes}
                  onChange={(e) => setCutoffMinutes(Number(e.target.value))}
                  min={10}
                  max={60}
                  className="w-24 bg-white border border-cream-border rounded-lg px-3 py-1.5 text-xs font-mono font-bold"
                />
                <span className="text-darkText font-medium">Minutes before close</span>
              </div>
              <p className="text-[11px] text-darkText-subtle">
                Online registration stops 30m prior; walk-ins accepted until closing.
              </p>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border space-y-2">
              <label className="font-bold text-darkText block">No-Show Grace Period</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  min={5}
                  max={30}
                  className="w-24 bg-white border border-cream-border rounded-lg px-3 py-1.5 text-xs font-mono font-bold"
                />
                <span className="text-darkText font-medium">Minutes from called_at</span>
              </div>
              <p className="text-[11px] text-darkText-subtle">
                Calculated directly from the database called_at timestamp.
              </p>
            </div>

            <div className="bg-cream p-4 rounded-xl border border-cream-border space-y-2">
              <label className="font-bold text-darkText block">Queue Dispatch Policy</label>
              <p className="text-cherry font-bold text-xs">
                Strict FIFO with Barber / Any Matching
              </p>
              <p className="text-[11px] text-darkText-subtle">
                1 active token per mobile number. Returning no-shows join at the tail of the line.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-cream-border">
            <button
              onClick={handleSaveOperations}
              className="px-6 py-2.5 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-xs flex items-center gap-2 shadow-cherry"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveChanges', language)}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
