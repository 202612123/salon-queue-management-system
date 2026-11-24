'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { QueueStatus, TokenItem } from '@/types';
import { 
  Clock, 
  Users, 
  UserCheck, 
  CheckCircle, 
  RotateCw,
  Bell,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  Scissors
} from 'lucide-react';
import { 
  fetchQueueEntries, 
  subscribeToQueue, 
  cancelToken, 
  getRemainingGraceSeconds, 
  formatGraceTimer, 
  calculateEstimatedWaitTime 
} from '@/lib/queueService';

export default function TokenStatusPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.tokenId as string) || '';
  const { language, barbers, services } = useAppStore();

  const [token, setToken] = useState<TokenItem | null>(null);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [graceSeconds, setGraceSeconds] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  // Subscribe to live queue changes
  useEffect(() => {
    const unsub = subscribeToQueue((allTokens) => {
      setTokens(allTokens);
      // Match by ID or display token
      const found = allTokens.find(
        (t) =>
          t.id === rawId ||
          t.displayToken.toLowerCase() === rawId.toLowerCase()
      );
      if (found) {
        setToken(found);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [rawId]);

  // Real-time 10-Minute grace period countdown timer when CALLED
  useEffect(() => {
    if (token?.status === 'CALLED' && token.calledAt) {
      const updateTimer = () => {
        const remaining = getRemainingGraceSeconds(token.calledAt);
        setGraceSeconds(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [token?.status, token?.calledAt]);

  const handleCancel = async () => {
    if (!token) return;
    if (
      !confirm(
        language === 'en'
          ? 'Are you sure you want to cancel your queue token?'
          : 'શું તમે તમારો ટોકન રદ કરવા માંગો છો?'
      )
    ) {
      return;
    }

    setIsCancelling(true);
    try {
      const updated = await cancelToken(token.id);
      setToken(updated);
    } catch (err: any) {
      alert(err.message || 'Error cancelling token');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefresh = async () => {
    const fresh = await fetchQueueEntries();
    setTokens(fresh);
    const found = fresh.find(
      (t) => t.id === rawId || t.displayToken.toLowerCase() === rawId.toLowerCase()
    );
    if (found) setToken(found);
  };

  // Status Badge Helper
  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {t('statusWaiting', language)}
          </span>
        );
      case 'CALLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-light text-cherry border border-blush animate-pulse">
            <Bell className="w-3.5 h-3.5 text-cherry" />
            {t('statusCalled', language)}
          </span>
        );
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {t('statusInService', language)}
          </span>
        );
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blush-light text-cherry border border-blush">
            <CheckCircle className="w-3.5 h-3.5 text-cherry" />
            {t('statusDone', language)}
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle className="w-3.5 h-3.5" />
            {t('statusNoShow', language)}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {t('statusCancelled', language)}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blush border-t-cherry rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-darkText-muted font-bold">
            {language === 'en' ? 'Connecting to live salon stream...' : 'લાઇવ કતાર સાથે કનેક્ટ થઈ રહ્યું છે...'}
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 py-16 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-cherry">
          {language === 'en' ? 'Token Not Found' : 'ટોકન મળ્યું નથી'}
        </h1>
        <p className="text-xs text-darkText-muted">
          {language === 'en'
            ? 'We could not locate this token in our active queue records.'
            : 'આ ટોકન કતાર યાદીમાં મળ્યો નથી.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/status"
            className="px-4 py-2 rounded-xl bg-white border border-cream-border text-xs font-bold text-cherry"
          >
            {language === 'en' ? 'Search Again' : 'ફરીથી શોધો'}
          </Link>
          <Link
            href="/join"
            className="px-4 py-2 rounded-xl bg-cherry text-white text-xs font-bold shadow-cherry"
          >
            {t('joinQueueNow', language)}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate wait time & position ahead
  const waitCalc = calculateEstimatedWaitTime(tokens, token.id, barbers);

  // Assigned barber name
  const assignedBarber = barbers.find((b) => b.id === token.assignedBarberId);
  const preferredBarber = barbers.find((b) => b.id === token.barberPreference);

  // Selected service names
  const tokenServices = services.filter((s) => token.serviceIds?.includes(s.id));

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-2xl mx-auto w-full space-y-6">
      
      {/* Top Navigation & Realtime Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/status"
          className="inline-flex items-center gap-1.5 text-xs text-darkText-muted hover:text-cherry font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose" />
          <span>{language === 'en' ? 'Back to lookup' : 'પાછા જાઓ'}</span>
        </Link>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{t('nearRealtimeActive', language)}</span>
        </span>
      </div>

      {/* Main Token Status Hero Card */}
      <div className="bg-white border border-cream-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-cherry relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-border pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-darkText-muted font-bold block mb-0.5">
              {language === 'en' ? 'Your Token Number' : 'તમારો ટોકન નંબર'}
            </span>
            <div className="text-5xl font-extrabold text-cherry tracking-tight font-mono">
              {token.displayToken}
            </div>
            <p className="text-xs text-darkText-subtle font-medium mt-1">
              {token.customerName} • {token.phoneNumber}
            </p>
          </div>
          <div>
            {getStatusBadge(token.status)}
          </div>
        </div>

        {/* 10-Minute Grace Alert (When CALLED) */}
        {token.status === 'CALLED' && (
          <div className="bg-blush-light border border-blush p-5 rounded-2xl space-y-3 shadow-cherry-sm animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cherry font-extrabold text-sm">
                <Bell className="w-5 h-5 text-cherry animate-bounce" />
                <span>{language === 'en' ? 'Your Turn Has Arrived!' : 'તમારો વારો આવી ગયો છે!'}</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-white border border-blush font-mono font-extrabold text-cherry text-sm">
                ⏱ {formatGraceTimer(graceSeconds)}
              </div>
            </div>
            <p className="text-xs text-darkText-muted leading-relaxed">
              {language === 'en'
                ? `Please proceed to Chair ${token.chairNumber || (assignedBarber ? assignedBarber.chairNumber : '1')} within 10 minutes. The grace countdown is calculated from the database timestamp.`
                : `કૃપા કરીને ૧૦ મિનિટમાં ખુરશી ${token.chairNumber || '૧'} પાસે પહોંચો.`}
            </p>
          </div>
        )}

        {/* IN_SERVICE Hero Banner */}
        {token.status === 'IN_SERVICE' && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-900">
            <Scissors className="w-5 h-5 text-emerald-700 animate-spin" />
            <div>
              <strong className="block text-xs font-bold">
                {language === 'en' ? 'Service In Progress' : 'સેવા ચાલુ છે'}
              </strong>
              <p className="text-[11px] text-emerald-800">
                {language === 'en'
                  ? `Seated at Chair ${token.chairNumber || '1'} with ${assignedBarber ? assignedBarber.name : 'Stylist'}. Enjoy your grooming session!`
                  : `ખુરશી પર સેવા ચાલુ છે.`}
              </p>
            </div>
          </div>
        )}

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-cream p-4 rounded-xl border border-cream-border">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-rose" />
              <span>{t('estimatedWaitTime', language)}</span>
            </div>
            <p className="text-2xl font-black text-cherry font-mono">
              ~{waitCalc.minutes} <span className="text-xs font-semibold text-darkText-muted">{t('minutesRemaining', language)}</span>
            </p>
          </div>

          <div className="bg-cream p-4 rounded-xl border border-cream-border">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-bold">
              <Users className="w-3.5 h-3.5 text-rose" />
              <span>{t('peopleAhead', language)}</span>
            </div>
            <p className="text-2xl font-black text-cherry font-mono">
              {waitCalc.peopleAhead} <span className="text-xs font-semibold text-darkText-muted">{language === 'en' ? 'Ahead' : 'આગળ'}</span>
            </p>
          </div>

          <div className="bg-cream p-4 rounded-xl border border-cream-border col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-bold">
              <UserCheck className="w-3.5 h-3.5 text-rose" />
              <span>{language === 'en' ? 'Stylist / Chair' : 'વાળંદ / ચેર'}</span>
            </div>
            <p className="text-sm font-bold text-darkText truncate">
              {assignedBarber
                ? `${language === 'en' ? assignedBarber.name : assignedBarber.nameGu} (Chair ${assignedBarber.chairNumber})`
                : preferredBarber
                ? `${language === 'en' ? preferredBarber.name : preferredBarber.nameGu} (Pref)`
                : t('anyAvailableBarber', language)}
            </p>
          </div>
        </div>

        {/* Selected Services Summary */}
        <div className="bg-cream p-4 rounded-xl border border-cream-border text-xs text-darkText space-y-2">
          <div className="flex justify-between items-center text-darkText-muted font-bold">
            <span>{language === 'en' ? 'Requested Services' : 'પસંદ કરેલ સેવાઓ'}</span>
            <span>{language === 'en' ? 'Estimated Total' : 'કુલ અંદાજિત કિંમત'}</span>
          </div>
          <div className="divide-y divide-cream-border">
            {tokenServices.map((s) => (
              <div key={s.id} className="py-1.5 flex justify-between items-center text-xs">
                <span className="font-semibold text-darkText">
                  {language === 'en' ? s.nameEn : s.nameGu} ({s.durationMinutes}m)
                </span>
                <span className="font-mono font-bold text-cherry">₹{s.priceInr}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-cream-border flex justify-between items-center text-sm font-extrabold text-darkText">
            <span>{language === 'en' ? 'Grand Total:' : 'કુલ રકમ:'}</span>
            <span className="text-cherry text-lg font-mono">₹{token.totalPrice}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRefresh}
            className="flex-1 py-3 px-4 rounded-xl bg-blush-light hover:bg-blush border border-blush text-xs font-bold text-cherry flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-cherry" />
            <span>{t('refreshStatus', language)}</span>
          </button>

          {token.status === 'WAITING' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="py-3 px-5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : t('cancelMyToken', language)}
            </button>
          )}

          {(token.status === 'NO_SHOW' || token.status === 'CANCELLED' || token.status === 'DONE') && (
            <Link
              href="/join"
              className="flex-1 py-3 px-4 rounded-xl bg-cherry hover:bg-cherry-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-cherry transition-all active:scale-95"
            >
              <span>{t('rejoinQueue', language)}</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
