'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Search, Clock, ArrowRight, AlertCircle, Ticket } from 'lucide-react';
import { fetchQueueEntries } from '@/lib/queueService';
import { TokenItem } from '@/types';

export default function StatusLookupPage() {
  const router = useRouter();
  const { language, activeTokenId } = useAppStore();
  const [tokenInput, setTokenInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentToken, setRecentToken] = useState<TokenItem | null>(null);

  useEffect(() => {
    if (activeTokenId) {
      fetchQueueEntries().then((tokens) => {
        const found = tokens.find((t) => t.id === activeTokenId);
        if (found) setRecentToken(found);
      });
    }
  }, [activeTokenId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = tokenInput.trim();
    if (!query) return;

    setErrorMessage('');
    setIsSearching(true);

    const tokens = await fetchQueueEntries();

    // 1. Direct ID match
    let match = tokens.find((t) => t.id.toLowerCase() === query.toLowerCase());

    // 2. Display token match (e.g. A-101 or W-102)
    if (!match) {
      match = tokens.find(
        (t) => t.displayToken.toLowerCase() === query.toLowerCase()
      );
    }

    // 3. Number match (e.g. 101 -> token_number 1)
    if (!match) {
      const parsedNum = parseInt(query.replace(/\D/g, ''), 10);
      if (!isNaN(parsedNum)) {
        match = tokens.find(
          (t) =>
            t.tokenNumber === parsedNum ||
            t.tokenNumber === parsedNum - 100 ||
            t.phoneNumber.endsWith(query)
        );
      }
    }

    // 4. Phone number match
    if (!match) {
      const cleanPhone = query.replace(/\D/g, '');
      if (cleanPhone.length >= 4) {
        match = tokens
          .filter((t) => t.phoneNumber.includes(cleanPhone))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
      }
    }

    setIsSearching(false);

    if (match) {
      router.push(`/status/${match.id}`);
    } else {
      setErrorMessage(t('tokenNotFound', language));
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 max-w-md mx-auto w-full">
      <div className="w-full bg-white border border-cream-border rounded-2xl p-7 shadow-cherry space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blush-light text-cherry border border-blush flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-cherry tracking-tight">
            {t('trackExistingToken', language)}
          </h1>
          <p className="text-xs text-darkText-muted">
            {language === 'en'
              ? 'Enter your Token ID (e.g. A-101) or 10-digit mobile number to check real-time status.'
              : 'તમારો ટોકન નંબર અથવા મોબાઈલ નંબર દાખલ કરી તમારું લાઇવ સ્ટેટસ જુઓ.'}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-darkText mb-1.5">
              {language === 'en' ? 'Token Number or Mobile Phone' : 'ટોકન અથવા મોબાઈલ નંબર'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-rose absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. A-101 or 9825012345"
                className="w-full bg-cream border border-cream-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-darkText focus:outline-none focus:border-cherry focus:bg-white transition-colors font-mono uppercase font-bold tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3.5 rounded-xl bg-cherry hover:bg-cherry-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-cherry transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isSearching ? 'Searching...' : t('refreshStatus', language)}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {recentToken && (
          <div className="border-t border-cream-border pt-4">
            <p className="text-[11px] text-darkText-muted font-bold uppercase mb-2">
              {language === 'en' ? 'Recent Active Token:' : 'તમારું તાજેતરનું ટોકન:'}
            </p>
            <button
              onClick={() => router.push(`/status/${recentToken.id}`)}
              className="w-full p-3 rounded-xl bg-blush-light border border-blush hover:border-cherry text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-cherry" />
                <div>
                  <span className="font-mono font-bold text-cherry text-sm block">
                    {recentToken.displayToken}
                  </span>
                  <span className="text-[11px] text-darkText-muted">
                    {recentToken.customerName}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-cherry bg-white px-2 py-0.5 rounded-full border border-blush">
                {recentToken.status}
              </span>
            </button>
          </div>
        )}

        <div className="border-t border-cream-border pt-4 text-center">
          <p className="text-[11px] text-darkText-subtle">
            {language === 'en'
              ? 'Lost your token? Please visit the salon reception desk for assistance.'
              : 'ટોકન ભૂલી ગયા છો? કૃપા કરીને રિસેપ્શન ડેસ્ક પર સંપર્ક કરો.'}
          </p>
        </div>

      </div>
    </div>
  );
}
