'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Users, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  Search, 
  Tv, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { 
  subscribeToQueue, 
  calculateEstimatedWaitTime, 
  checkIsOnlineJoiningOpen 
} from '@/lib/queueService';
import { TokenItem } from '@/types';

export default function HomePage() {
  const { language, barbers, settings, activeTokenId } = useAppStore();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [activeUserToken, setActiveUserToken] = useState<TokenItem | null>(null);

  // Subscribe to live queue changes
  useEffect(() => {
    const unsubscribe = subscribeToQueue((fetchedTokens) => {
      setTokens(fetchedTokens);
      if (activeTokenId) {
        const found = fetchedTokens.find(
          (t) =>
            t.id === activeTokenId &&
            (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_SERVICE')
        );
        setActiveUserToken(found || null);
      }
    });
    return () => unsubscribe();
  }, [activeTokenId]);

  // Compute live queue metrics
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const workingBarbers = barbers.filter(
    (b) => b.status === 'AVAILABLE' || (b as any).status === 'BUSY'
  );
  const waitCalc = calculateEstimatedWaitTime(tokens, null, barbers);
  const onlineStatus = checkIsOnlineJoiningOpen(settings);

  return (
    <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto w-full">
      
      {/* Operating Status Banner in Soft Blush */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-blush p-3.5 rounded-2xl mb-8 shadow-cherry-sm">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            {settings.isOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            )}
          </span>
          <span className={`text-xs font-bold tracking-wide uppercase ${settings.isOpen ? 'text-emerald-700' : 'text-rose-700'}`}>
            {settings.isOpen ? t('salonOpen', language) : t('salonClosed', language)}
          </span>
          <span className="text-cream-border">|</span>
          <span className="text-xs text-darkText font-medium">
            {language === 'en'
              ? `Open Today: ${settings.openTime} – ${settings.closeTime}`
              : `આજે ખુલ્લું: ${settings.openTime} થી ${settings.closeTime}`}
          </span>
        </div>
        <div className="text-[11px] text-cherry bg-blush-light border border-blush px-3 py-1 rounded-full font-semibold">
          {language === 'en'
            ? `Online Queue Closes at ${onlineStatus.cutoffTime} (Walk-ins until ${settings.closeTime})`
            : `ઓનલાઇન કતાર ${onlineStatus.cutoffTime} વાગ્યે બંધ થશે (${settings.closeTime} સુધી વોક-ઇન)`}
        </div>
      </div>

      {/* Returning User Active Token Banner */}
      {activeUserToken && (
        <div className="bg-blush-light border border-cherry/30 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cherry text-white flex items-center justify-center font-bold font-mono text-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-cherry uppercase tracking-wider">
                {language === 'en' ? 'Active Token In Queue' : 'તમારું સક્રિય ટોકન'}
              </p>
              <p className="text-sm font-extrabold text-darkText">
                {activeUserToken.displayToken} • {activeUserToken.customerName}
                <span className="ml-2 text-xs font-bold text-cherry px-2 py-0.5 rounded-full bg-white border border-blush">
                  {t(
                    activeUserToken.status === 'WAITING'
                      ? 'statusWaiting'
                      : activeUserToken.status === 'CALLED'
                      ? 'statusCalled'
                      : 'statusInService',
                    language
                  )}
                </span>
              </p>
            </div>
          </div>
          <Link
            href={`/status/${activeUserToken.id}`}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cherry text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-cherry hover:bg-cherry-hover transition-colors"
          >
            <span>{t('navStatus', language)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush-light border border-blush text-cherry text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose" />
          <span>MSc IT Vibe Coding Lab Project • DAU (DAIICT)</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="text-darkText">Smart Boutique </span>
          <span className="cherry-gradient-text">Salon Queue</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-darkText-muted font-normal leading-relaxed">
          {language === 'en'
            ? 'Effortless walk-in check-in, real-time wait-time tracking, and automated stylist dispatch designed for modern grooming lounges.'
            : 'ઝડપી વોક-ઇન ચેક-ઇન, લાઈવ પ્રતીક્ષા સમય ટ્રેકિંગ અને આધુનિક સલૂન માટે વાળંદ ડિસ્પેચ સિસ્ટમ.'}
        </p>
      </div>

      {/* Live Salon Status Glance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-cream-border p-5 rounded-2xl flex items-center gap-4 boutique-card">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry flex items-center justify-center shrink-0 border border-blush">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs text-darkText-muted font-semibold">
              {language === 'en' ? 'Currently Waiting' : 'કતારમાં ગ્રાહકો'}
            </p>
            <p className="text-2xl font-extrabold text-cherry tracking-tight">
              {waitingTokens.length}{' '}
              <span className="text-xs font-medium text-darkText-subtle">
                {language === 'en' ? 'Clients' : 'ગ્રાહકો'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-cream-border p-5 rounded-2xl flex items-center gap-4 boutique-card">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry flex items-center justify-center shrink-0 border border-blush">
            <Clock className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs text-darkText-muted font-semibold">
              {t('estimatedWaitTime', language)}
            </p>
            <p className="text-2xl font-extrabold text-cherry tracking-tight">
              ~{waitCalc.minutes}{' '}
              <span className="text-xs font-medium text-darkText-subtle">
                {t('minutesRemaining', language)}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-cream-border p-5 rounded-2xl flex items-center gap-4 boutique-card">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry flex items-center justify-center shrink-0 border border-blush">
            <UserCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs text-darkText-muted font-semibold">
              {language === 'en' ? 'Stylists On Duty' : 'હાજર વાળંદ'}
            </p>
            <p className="text-2xl font-extrabold text-cherry tracking-tight">
              {workingBarbers.length}{' '}
              <span className="text-xs font-medium text-darkText-subtle">
                {language === 'en' ? `of ${barbers.length}` : `કુલ ${barbers.length}`}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Online Queue Cutoff Alert Notice */}
      {!onlineStatus.isOpen && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-8 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-900 mb-0.5">
              {language === 'en' ? 'Online Queue Joining Notice' : 'ઓનલાઇન કતાર સૂચના'}
            </strong>
            <span>
              {onlineStatus.reason || t('onlineQueueClosed', language)}
            </span>
          </div>
        </div>
      )}

      {/* Main Action CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <Link
          href="/join"
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cherry hover:shadow-cherry-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span>{t('joinQueueNow', language)}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </Link>

        <Link
          href="/status"
          className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-blush-light text-cherry border border-blush font-bold text-sm flex items-center justify-center gap-2 shadow-cherry-sm transition-all"
        >
          <Search className="w-4 h-4 text-rose" />
          <span>{t('trackExistingToken', language)}</span>
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="border-t border-cream-border pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-darkText-muted">
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-cream-border shadow-cherry-sm">
            <CheckCircle2 className="w-5 h-5 text-cherry shrink-0 mt-0.5" />
            <div>
              <strong className="text-darkText block text-sm mb-1 font-bold">
                {language === 'en' ? 'Strict FIFO Fairness' : 'FIFO ક્રમ નિયમ'}
              </strong>
              <span>
                {language === 'en'
                  ? 'First-In, First-Out queue ordering guarantees zero queue jumping.'
                  : 'પ્રથમ આવેલા ગ્રાહકને પ્રથમ પ્રાથમિકતા મળે છે.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-cream-border shadow-cherry-sm">
            <ShieldCheck className="w-5 h-5 text-cherry shrink-0 mt-0.5" />
            <div>
              <strong className="text-darkText block text-sm mb-1 font-bold">
                {language === 'en' ? '10-Min Grace Period' : '૧૦ મિનિટ ગ્રેસ પીરિયડ'}
              </strong>
              <span>
                {language === 'en'
                  ? 'Database called_at timestamp ensures fair 10-minute return window.'
                  : 'ટોકન બોલાવ્યા પછી ૧૦ મિનિટનો સમય મળે છે.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-cream-border shadow-cherry-sm">
            <Tv className="w-5 h-5 text-cherry shrink-0 mt-0.5" />
            <div>
              <strong className="text-darkText block text-sm mb-1 font-bold">
                {language === 'en' ? 'Live Lounge TV Sync' : 'લાઇવ ટીવી ડિસ્પ્લે'}
              </strong>
              <span>
                {language === 'en'
                  ? 'High-contrast large screen board for waiting area with audio chime.'
                  : 'લાઉન્જ ટીવી પર ઑડિયો ચાઇમ સાથે લાઇવ ટોકન ડિસ્પ્લે.'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
