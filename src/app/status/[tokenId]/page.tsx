'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { QueueStatus } from '@/types';
import { 
  Clock, 
  Users, 
  UserCheck, 
  CheckCircle, 
  RotateCw,
  Bell,
  ArrowLeft
} from 'lucide-react';

export default function TokenStatusPage() {
  const params = useParams();
  const tokenId = (params?.tokenId as string) || 'A-101';
  const { language } = useAppStore();

  const [currentStatus, setCurrentStatus] = useState<QueueStatus>('WAITING');
  const [minutesAhead, setMinutesAhead] = useState(18);
  const [peopleAhead, setPeopleAhead] = useState(2);

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
            {t('statusCalled', language)} (10m Grace Active)
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
            <CheckCircle className="w-3.5 h-3.5" />
            {t('statusDone', language)}
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            {t('statusNoShow', language)}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            {t('statusCancelled', language)}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-2xl mx-auto w-full space-y-6">
      
      {/* Back Link */}
      <Link href="/status" className="inline-flex items-center gap-1.5 text-xs text-darkText-muted hover:text-cherry font-semibold transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 text-rose" />
        <span>{language === 'en' ? 'Back to lookup' : 'પાછા જાઓ'}</span>
      </Link>

      {/* Main Token Status Hero Card */}
      <div className="bg-white border border-cream-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-cherry relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-border pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-darkText-muted font-bold block mb-0.5">
              {language === 'en' ? 'Your Token Number' : 'તમારો ટોકન નંબર'}
            </span>
            <div className="text-4xl font-extrabold text-cherry tracking-tight font-mono">
              {tokenId}
            </div>
          </div>
          <div>
            {getStatusBadge(currentStatus)}
          </div>
        </div>

        {/* 10-Minute Grace Alert (When CALLED) */}
        {currentStatus === 'CALLED' && (
          <div className="bg-blush-light border border-blush p-4 rounded-xl flex items-start gap-3 text-cherry">
            <Bell className="w-5 h-5 text-cherry shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="block text-sm font-bold text-cherry mb-0.5">
                {language === 'en' ? 'Your Turn Has Arrived! Proceed to Chair' : 'તમારો વારો આવી ગયો છે! ખુરશી પાસે આવો'}
              </strong>
              <p className="text-xs text-darkText-muted">
                {language === 'en'
                  ? 'Please reach your assigned chair within 10 minutes. Grace timer is calculated from the database called_at timestamp.'
                  : 'કૃપા કરીને ૧૦ મિનિટમાં ખુરશી પાસે પહોંચો.'}
              </p>
            </div>
          </div>
        )}

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-cream p-4 rounded-xl border border-cream-border">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-rose" />
              <span>{t('estimatedWaitTime', language)}</span>
            </div>
            <p className="text-xl font-bold text-cherry">
              ~{minutesAhead} <span className="text-xs font-medium text-darkText-muted">{t('minutesRemaining', language)}</span>
            </p>
          </div>

          <div className="bg-cream p-4 rounded-xl border border-cream-border">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-medium">
              <Users className="w-3.5 h-3.5 text-rose" />
              <span>{t('peopleAhead', language)}</span>
            </div>
            <p className="text-xl font-bold text-cherry">
              {peopleAhead} <span className="text-xs font-medium text-darkText-muted">Ahead</span>
            </p>
          </div>

          <div className="bg-cream p-4 rounded-xl border border-cream-border col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-darkText-muted text-xs mb-1 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-rose" />
              <span>Stylist</span>
            </div>
            <p className="text-sm font-bold text-darkText truncate">
              Amit (Chair 2)
            </p>
          </div>
        </div>

        {/* Selected Services Summary */}
        <div className="bg-cream p-4 rounded-xl border border-cream-border text-xs text-darkText space-y-2">
          <span className="text-darkText-muted font-medium block">
            {language === 'en' ? 'Requested Services & Bill:' : 'પસંદ કરેલ સેવાઓ:'}
          </span>
          <div className="flex justify-between items-center text-sm font-bold text-darkText">
            <span>Classic Haircut + Beard Trim</span>
            <span className="text-cherry font-extrabold text-base">₹400</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => alert('Near-realtime stream will synchronize automatically via Supabase in Phase 2!')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blush-light hover:bg-blush border border-blush text-xs font-bold text-cherry flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-rose" />
            <span>{t('refreshStatus', language)}</span>
          </button>

          {currentStatus === 'WAITING' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel your queue token?')) {
                  setCurrentStatus('CANCELLED');
                }
              }}
              className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 transition-colors"
            >
              {t('cancelMyToken', language)}
            </button>
          )}

          {currentStatus === 'NO_SHOW' && (
            <Link
              href="/join"
              className="flex-1 py-2.5 px-4 rounded-xl bg-cherry text-white text-xs font-bold flex items-center justify-center gap-2 shadow-cherry"
            >
              <span>{t('rejoinQueue', language)}</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
