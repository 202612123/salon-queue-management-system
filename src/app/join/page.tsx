'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  User, 
  Phone, 
  Scissors, 
  Check, 
  Clock, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Info,
  Lock
} from 'lucide-react';
import { 
  createQueueEntry, 
  checkIsOnlineJoiningOpen, 
  calculateEstimatedWaitTime, 
  subscribeToQueue 
} from '@/lib/queueService';
import { TokenItem } from '@/types';

export default function JoinQueuePage() {
  const { language, services, barbers, settings } = useAppStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv_haircut']);
  const [barberPreference, setBarberPreference] = useState<'ANY' | string>('ANY');
  const [errorMessage, setErrorMessage] = useState('');
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToQueue(setTokens);
    return () => unsub();
  }, []);

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.priceInr, 0);

  const onlineStatus = checkIsOnlineJoiningOpen(settings);
  const waitCalc = calculateEstimatedWaitTime(tokens, null, barbers);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    // Check if online registration is closed
    if (!onlineStatus.isOpen) {
      setErrorMessage(onlineStatus.reason || t('onlineQueueClosed', language));
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(t('enterName', language));
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      setErrorMessage(t('invalidPhone', language));
      return;
    }

    if (selectedServiceIds.length === 0) {
      setErrorMessage(t('selectAtLeastOneService', language));
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await createQueueEntry({
        customerName: customerName.trim(),
        phoneNumber: cleanPhone,
        serviceIds: selectedServiceIds,
        totalDurationMinutes: totalDuration,
        totalPrice: totalPrice,
        barberPreference,
        isWalkIn: false,
      });

      router.push(`/status/${token.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(
        err.message?.includes('active queue entry')
          ? t('phoneAlreadyActive', language)
          : err.message || 'Unable to join queue. Please try again.'
      );
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-cherry tracking-tight">
          {t('joinQueueNow', language)}
        </h1>
        <p className="text-sm text-darkText-muted">
          {language === 'en'
            ? 'Select your services and get an instant digital token number.'
            : 'તમારી સેવાઓ પસંદ કરો અને ત્વરિત ડિજિટલ ટોકન મેળવો.'}
        </p>
      </div>

      {/* Online Cutoff / Operating Status Banner */}
      {onlineStatus.isOpen ? (
        <div className="bg-blush-light border border-blush p-3.5 rounded-xl mb-6 flex items-center justify-between gap-3 text-xs text-cherry font-medium shadow-cherry-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cherry shrink-0" />
            <span>
              {language === 'en'
                ? `Online queue closes at ${onlineStatus.cutoffTime} (30 mins before closing). Walk-ins accepted at reception until ${settings.closeTime}.`
                : `ઓનલાઇન કતાર ${onlineStatus.cutoffTime} વાગ્યા સુધી ખુલ્લી રહેશે. ડેસ્ક પર ${settings.closeTime} સુધી વોક-ઇન સ્વીકાર્ય છે.`}
            </span>
          </div>
          <span className="hidden sm:inline-block font-bold text-cherry shrink-0">
            Est. Wait: ~{waitCalc.minutes}m
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl mb-6 flex items-start gap-3 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-sm mb-1 text-amber-900">
              {language === 'en' ? 'Online Queue Registration Closed' : 'ઓનલાઇન કતાર બંધ છે'}
            </strong>
            <p className="text-amber-800">
              {onlineStatus.reason || t('onlineQueueClosed', language)}
            </p>
          </div>
        </div>
      )}

      {/* Form Card in Warm Clean White */}
      <form onSubmit={handleSubmit} className="bg-white border border-cream-border rounded-2xl p-6 sm:p-8 space-y-7 shadow-cherry">
        
        {/* Error Message Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Customer Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-cherry uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blush-light border border-blush text-cherry flex items-center justify-center text-[10px] font-bold">1</span>
            {language === 'en' ? 'Customer Identification' : 'ગ્રાહકની માહિતી'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                {t('fullName', language)} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-rose absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Bhavin Patel"
                  required
                  disabled={!onlineStatus.isOpen}
                  className="w-full bg-cream border border-cream-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-darkText focus:outline-none focus:border-cherry focus:bg-white transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">
                {t('phoneNumber', language)} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-rose absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9825012345"
                  required
                  disabled={!onlineStatus.isOpen}
                  className="w-full bg-cream border border-cream-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-darkText focus:outline-none focus:border-cherry focus:bg-white transition-colors disabled:opacity-60 font-mono"
                />
              </div>
              <p className="text-[10px] text-darkText-subtle mt-1 font-medium">
                {language === 'en' ? 'Only 1 active token allowed per phone' : 'એક નંબર પર માત્ર એક જ સક્રિય ટોકન માન્ય'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Service Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-cherry uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blush-light border border-blush text-cherry flex items-center justify-center text-[10px] font-bold">2</span>
              {t('selectServices', language)}
            </h2>
            <span className="text-xs text-darkText-muted font-bold">
              {selectedServiceIds.length} {language === 'en' ? 'Selected' : 'પસંદ કરેલ'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => onlineStatus.isOpen && toggleService(service.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between select-none ${
                    isSelected
                      ? 'bg-blush-light border-cherry shadow-sm'
                      : 'bg-cream border-cream-border hover:border-blush hover:bg-cream-muted'
                  } ${!onlineStatus.isOpen ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="space-y-1 pr-2">
                    <p className="text-sm font-bold text-darkText">
                      {language === 'en' ? service.nameEn : service.nameGu}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-darkText-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-rose" />
                        {service.durationMinutes} {t('minutesRemaining', language)}
                      </span>
                      <span>•</span>
                      <span className="text-cherry font-extrabold font-mono text-sm">₹{service.priceInr}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-cherry border-cherry text-white'
                        : 'border-cream-border bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Stylist Preference */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-cherry uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blush-light border border-blush text-cherry flex items-center justify-center text-[10px] font-bold">3</span>
            {t('barberPreference', language)}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!onlineStatus.isOpen}
              onClick={() => setBarberPreference('ANY')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                barberPreference === 'ANY'
                  ? 'bg-blush-light border-cherry text-darkText font-bold shadow-sm'
                  : 'bg-cream border-cream-border text-darkText-muted hover:border-blush'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cherry">{t('anyAvailableBarber', language)}</span>
                {barberPreference === 'ANY' && <Check className="w-4 h-4 text-cherry" />}
              </div>
              <p className="text-[11px] text-darkText-muted">
                {language === 'en' ? 'Fastest FIFO turn by earliest free stylist' : 'સૌથી ઝડપી કતાર વારો'}
              </p>
            </button>

            {barbers.map((barber) => {
              const isSelected = barberPreference === barber.id;
              return (
                <button
                  key={barber.id}
                  type="button"
                  disabled={!onlineStatus.isOpen}
                  onClick={() => setBarberPreference(barber.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-blush-light border-cherry text-darkText font-bold shadow-sm'
                      : 'bg-cream border-cream-border text-darkText-muted hover:border-blush'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-darkText">
                      {language === 'en' ? barber.name : barber.nameGu} ({t('chairNumber', language)} {barber.chairNumber})
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cherry" />}
                  </div>
                  <p className="text-[11px] text-darkText-subtle flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose" />
                    <span>{language === 'en' ? 'Locked to stylist (No reassign)' : 'માત્ર આ વાળંદ માટે'}</span>
                  </p>
                </button>
              );
            })}
          </div>

          {barberPreference !== 'ANY' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {language === 'en'
                  ? 'Notice: You selected a preferred stylist. Your token is locked to this stylist and cannot be reassigned.'
                  : 'સૂચના: તમે ચોક્કસ વાળંદ પસંદ કર્યા છે. તમારો ટોકન અન્ય વાળંદને ફાળવી શકાશે નહીં.'}
              </span>
            </div>
          )}
        </div>

        {/* Step 4: Summary Box & Submit */}
        <div className="bg-cream border border-cream-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-darkText-muted font-bold block">
              {t('estimatedTotal', language)} &amp; Duration:
            </span>
            <div className="text-lg font-bold text-darkText flex items-center gap-2">
              <span className="text-cherry font-extrabold text-2xl font-mono">₹{totalPrice}</span>
              <span className="text-cream-border">•</span>
              <span className="text-sm font-semibold text-darkText-muted">
                {totalDuration} {t('minutesRemaining', language)}
              </span>
            </div>
            <p className="text-[11px] text-darkText-subtle">
              {t('estimatedWaitTime', language)}: <strong className="text-cherry">~{waitCalc.minutes} {t('minutesRemaining', language)}</strong> ({waitCalc.peopleAhead} {t('peopleAhead', language)})
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !onlineStatus.isOpen}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-cherry hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{isSubmitting ? 'Generating Token...' : t('confirmAndGetToken', language)}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </form>
    </div>
  );
}
