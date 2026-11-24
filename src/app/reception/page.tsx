'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
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
  Lock,
  Scissors,
  Coffee,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  fetchQueueEntries, 
  subscribeToQueue, 
  createQueueEntry, 
  callNextCustomer, 
  startService, 
  markDone, 
  markNoShow, 
  cancelToken, 
  reassignBarber, 
  getRemainingGraceSeconds, 
  formatGraceTimer 
} from '@/lib/queueService';
import { TokenItem, QueueStatus } from '@/types';

export default function ReceptionDashboardPage() {
  const { language, barbers, services, settings } = useAppStore();

  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fast Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv_haircut']);
  const [barberPref, setBarberPref] = useState('ANY');

  // Reassign Modal State
  const [reassignModalToken, setReassignModalToken] = useState<TokenItem | null>(null);
  const [newSelectedBarberId, setNewSelectedBarberId] = useState('');

  // Realtime subscription
  useEffect(() => {
    const unsub = subscribeToQueue(setTokens);
    return () => unsub();
  }, []);

  // Grace timer ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const ticker = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(ticker);
  }, []);

  const totalDuration = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.priceInr, 0);

  // Filtered queue tokens
  const filteredTokens = tokens.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!walkInName.trim()) {
      setActionError(t('enterName', language));
      return;
    }

    if (selectedServices.length === 0) {
      setActionError(t('selectAtLeastOneService', language));
      return;
    }

    const cleanPhone = walkInPhone.trim().replace(/\D/g, '') || `99900${Math.floor(10000 + Math.random() * 90000)}`;

    setIsSubmitting(true);
    try {
      const newToken = await createQueueEntry({
        customerName: walkInName.trim(),
        phoneNumber: cleanPhone,
        serviceIds: selectedServices,
        totalDurationMinutes: totalDuration,
        totalPrice,
        barberPreference: barberPref,
        isWalkIn: true,
      });

      setWalkInName('');
      setWalkInPhone('');
      setSelectedServices(['srv_haircut']);
      setBarberPref('ANY');
      setActionSuccess(`${newToken.displayToken} created for ${newToken.customerName}!`);
    } catch (err: any) {
      setActionError(err.message || 'Error creating walk-in token');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallNextForBarber = async (barberId: string, chairNumber: number) => {
    setActionError('');
    setActionSuccess('');
    try {
      const called = await callNextCustomer(barberId, chairNumber);
      if (called) {
        setActionSuccess(`Called ${called.displayToken} (${called.customerName}) to Chair ${chairNumber}!`);
      } else {
        setActionError(t('noEligibleCustomer', language));
      }
    } catch (err: any) {
      setActionError(err.message || 'Error calling customer');
    }
  };

  const handleStartService = async (tokenId: string) => {
    setActionError('');
    try {
      await startService(tokenId);
      setActionSuccess('Customer seated in chair. Service timer started.');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleMarkDone = async (tokenId: string) => {
    setActionError('');
    try {
      await markDone(tokenId);
      setActionSuccess('Service completed successfully!');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleMarkNoShow = async (tokenId: string) => {
    setActionError('');
    try {
      await markNoShow(tokenId);
      setActionSuccess('Token marked as No-Show.');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCancel = async (tokenId: string) => {
    setActionError('');
    try {
      await cancelToken(tokenId);
      setActionSuccess('Token cancelled successfully.');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleOpenReassignModal = (tok: TokenItem) => {
    setActionError('');
    if (tok.isLockedToBarber) {
      setActionError(t('reassignLockedWarning', language));
      return;
    }
    setReassignModalToken(tok);
    setNewSelectedBarberId(barbers[0]?.id || '');
  };

  const handleExecuteReassign = async () => {
    if (!reassignModalToken || !newSelectedBarberId) return;
    const targetBarber = barbers.find((b) => b.id === newSelectedBarberId);
    if (!targetBarber) return;

    try {
      await reassignBarber(
        reassignModalToken.id,
        targetBarber.id,
        targetBarber.chairNumber
      );
      setActionSuccess(`Reassigned ${reassignModalToken.displayToken} to ${targetBarber.name}!`);
      setReassignModalToken(null);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            WAITING
          </span>
        );
      case 'CALLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blush-light text-cherry border border-blush animate-pulse">
            <Bell className="w-3 h-3 text-cherry" />
            CALLED
          </span>
        );
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            SERVING
          </span>
        );
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blush-light text-cherry border border-blush">
            <Check className="w-3 h-3 text-cherry" />
            DONE
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
            NO_SHOW
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            CANCELLED
          </span>
        );
    }
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
            <span>Walk-ins Open until {settings.closeTime}</span>
          </span>
        </div>
      </div>

      {/* Notifications Alert Bar */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center justify-between shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      {/* Grid: Left Walk-in Panel, Center/Right Queue Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Fast Walk-In Entry Form (< 15 seconds) */}
        <div className="lg:col-span-4 bg-white border border-cream-border rounded-2xl p-5 space-y-5 h-fit shadow-cherry">
          <div className="flex items-center justify-between border-b border-cream-border pb-3">
            <div className="flex items-center gap-2 text-cherry font-bold text-sm">
              <UserPlus className="w-4 h-4 text-rose" />
              <span>{t('fastWalkIn', language)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-darkText-muted bg-cream px-2 py-0.5 rounded border border-cream-border">
              &lt; 15s Desk
            </span>
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
                className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText focus:outline-none focus:border-cherry focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1">
                {t('phoneNumber', language)} (Optional for Walk-In)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText focus:outline-none focus:border-cherry focus:bg-white transition-colors font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-darkText">
                  {t('selectServices', language)}
                </label>
                <span className="text-[11px] font-mono text-cherry font-bold">
                  ₹{totalPrice} • {totalDuration}m
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {services.map((s) => (
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
                        ? 'bg-blush-light border-cherry text-cherry font-bold shadow-sm'
                        : 'bg-cream border-cream-border text-darkText-muted hover:border-blush'
                    }`}
                  >
                    {language === 'en' ? s.nameEn : s.nameGu} (₹{s.priceInr})
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
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {language === 'en' ? b.name : b.nameGu} ({t('chairNumber', language)} {b.chairNumber})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-cherry transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Issuing...' : `${t('issueToken', language)} (Enter)`}</span>
            </button>
          </form>
        </div>

        {/* Right Column (8 cols): Station Status Matrix & Live FIFO Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Barber Station Status Cards with Call Next Action */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {barbers.map((barber) => {
              const active = tokens.find(
                (t) =>
                  (t.status === 'CALLED' || t.status === 'IN_SERVICE') &&
                  (t.chairNumber === barber.chairNumber || t.assignedBarberId === barber.id)
              );

              const isOnBreak = barber.status === 'ON_BREAK';

              return (
                <div
                  key={barber.id}
                  className={`border p-3.5 rounded-2xl space-y-2 shadow-cherry-sm transition-all ${
                    active?.status === 'CALLED'
                      ? 'bg-blush-light border-cherry ring-1 ring-cherry'
                      : active?.status === 'IN_SERVICE'
                      ? 'bg-white border-emerald-300'
                      : isOnBreak
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-cream-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cherry font-bold">
                      Chair {barber.chairNumber}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active?.status === 'IN_SERVICE'
                          ? 'bg-emerald-600'
                          : active?.status === 'CALLED'
                          ? 'bg-cherry animate-ping'
                          : isOnBreak
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    ></span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-darkText truncate">
                      {language === 'en' ? barber.name : barber.nameGu}
                    </p>
                    <p className="text-[10px] text-darkText-muted truncate font-medium">
                      {active
                        ? `${active.displayToken} (${active.status})`
                        : isOnBreak
                        ? 'On Chai Break'
                        : 'Chair Available'}
                    </p>
                  </div>

                  {/* Fast Action on Chair */}
                  {!active && !isOnBreak && barber.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => handleCallNextForBarber(barber.id, barber.chairNumber)}
                      className="w-full py-1.5 px-2 rounded-lg bg-cherry hover:bg-cherry-hover text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Call Next</span>
                    </button>
                  ) : active?.status === 'CALLED' ? (
                    <button
                      onClick={() => handleStartService(active.id)}
                      className="w-full py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  ) : active?.status === 'IN_SERVICE' ? (
                    <button
                      onClick={() => handleMarkDone(active.id)}
                      className="w-full py-1.5 px-2 rounded-lg bg-cherry hover:bg-cherry-hover text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" />
                      <span>Done</span>
                    </button>
                  ) : (
                    <div className="h-6"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live FIFO Queue Table */}
          <div className="bg-white border border-cream-border rounded-2xl p-5 space-y-4 shadow-cherry overflow-hidden">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-border pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cherry">
                <Users className="w-4 h-4 text-rose" />
                <span>{language === 'en' ? 'Live FIFO Queue' : 'લાઇવ કતાર યાદી'}</span>
                <span className="text-xs text-darkText-muted font-normal">
                  ({filteredTokens.length} records)
                </span>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
                {['ALL', 'WAITING', 'CALLED', 'IN_SERVICE', 'DONE'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      statusFilter === filter
                        ? 'bg-cherry text-white shadow-sm'
                        : 'text-darkText-muted hover:text-cherry bg-cream'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Table View */}
            {filteredTokens.length === 0 ? (
              <div className="text-center py-12 text-darkText-muted space-y-2">
                <Users className="w-8 h-8 mx-auto text-rose/70 mb-2" />
                <p className="text-xs font-bold text-darkText">
                  {language === 'en' ? 'No tokens matching this filter.' : 'આ ફિલ્ટરમાં કોઈ ટોકન નથી.'}
                </p>
                <p className="text-[11px] text-darkText-subtle">
                  Use the walk-in form on the left to issue a new token.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-cream-border text-darkText-muted font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Token #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Services</th>
                      <th className="py-2.5 px-3">Barber</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Grace / Wait</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-border">
                    {filteredTokens.map((tok) => {
                      const graceLeft = tok.calledAt
                        ? getRemainingGraceSeconds(tok.calledAt)
                        : 0;

                      const assigned = barbers.find((b) => b.id === tok.assignedBarberId);
                      const preferred = barbers.find((b) => b.id === tok.barberPreference);

                      return (
                        <tr key={tok.id} className="hover:bg-cream/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-extrabold text-cherry text-sm">
                            {tok.displayToken}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-darkText block">{tok.customerName}</span>
                            <span className="text-[10px] text-darkText-subtle font-mono">{tok.phoneNumber}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="block font-medium text-darkText truncate max-w-[150px]">
                              {tok.serviceIds?.length} services
                            </span>
                            <span className="font-mono text-cherry font-bold text-[11px]">
                              ₹{tok.totalPrice} • {tok.totalDurationMinutes}m
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {tok.isLockedToBarber ? (
                              <span className="inline-flex items-center gap-1 font-bold text-cherry bg-blush-light px-2 py-0.5 rounded text-[10px] border border-blush" title="Locked to barber">
                                <Lock className="w-2.5 h-2.5" />
                                {preferred?.name || 'Specific'}
                              </span>
                            ) : assigned ? (
                              <span className="font-semibold text-darkText">
                                {assigned.name} (Chair {assigned.chairNumber})
                              </span>
                            ) : (
                              <span className="text-darkText-muted">Any Available</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {getStatusBadge(tok.status)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {tok.status === 'CALLED' ? (
                              <span className="text-cherry font-bold">
                                ⏱ {formatGraceTimer(graceLeft)}
                              </span>
                            ) : tok.status === 'WAITING' ? (
                              <span className="text-darkText-muted">In Queue</span>
                            ) : tok.status === 'IN_SERVICE' ? (
                              <span className="text-emerald-700 font-bold">Serving</span>
                            ) : (
                              <span className="text-darkText-subtle">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {tok.status === 'WAITING' && (
                                <>
                                  <button
                                    onClick={() => handleCancel(tok.id)}
                                    title="Cancel Token"
                                    className="p-1 rounded text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenReassignModal(tok)}
                                    title={tok.isLockedToBarber ? 'Locked: Cannot reassign specific barber' : 'Reassign Barber'}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                      tok.isLockedToBarber
                                        ? 'opacity-40 cursor-not-allowed bg-cream text-darkText-muted'
                                        : 'bg-white border-cream-border hover:border-blush text-darkText'
                                    }`}
                                  >
                                    {tok.isLockedToBarber ? <Lock className="w-3 h-3 inline mr-1" /> : null}
                                    Reassign
                                  </button>
                                </>
                              )}

                              {tok.status === 'CALLED' && (
                                <>
                                  <button
                                    onClick={() => handleStartService(tok.id)}
                                    className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px]"
                                  >
                                    Seat
                                  </button>
                                  <button
                                    onClick={() => handleMarkNoShow(tok.id)}
                                    title="Mark No-Show"
                                    className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200"
                                  >
                                    No-Show
                                  </button>
                                </>
                              )}

                              {tok.status === 'IN_SERVICE' && (
                                <button
                                  onClick={() => handleMarkDone(tok.id)}
                                  className="px-2.5 py-1 rounded bg-cherry hover:bg-cherry-hover text-white font-bold text-[10px]"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Reassign Barber Modal */}
      {reassignModalToken && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-cream-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-cherry">
            <h3 className="text-sm font-bold text-cherry">
              Reassign Barber for {reassignModalToken.displayToken}
            </h3>
            <p className="text-xs text-darkText-muted">
              Select the new barber station for customer {reassignModalToken.customerName}.
            </p>
            <select
              value={newSelectedBarberId}
              onChange={(e) => setNewSelectedBarberId(e.target.value)}
              className="w-full bg-cream border border-cream-border rounded-xl px-3 py-2 text-xs text-darkText font-medium"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (Chair {b.chairNumber} - {b.status})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReassignModalToken(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-darkText-muted bg-cream"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cherry hover:bg-cherry-hover shadow-cherry"
              >
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
