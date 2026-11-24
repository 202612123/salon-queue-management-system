import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, SalonSettings, BarberProfile, ServiceItem, TokenItem } from '@/types';
import { DEFAULT_SALON_SETTINGS, INITIAL_BARBERS, INITIAL_SERVICES } from './constants';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;

  activeTokenId: string | null;
  setActiveTokenId: (id: string | null) => void;

  settings: SalonSettings;
  updateSettings: (newSettings: Partial<SalonSettings>) => void;

  barbers: BarberProfile[];
  setBarbers: (barbers: BarberProfile[]) => void;
  updateBarberStatus: (barberId: string, status: BarberProfile['status'], breakMins?: number) => void;

  services: ServiceItem[];
  setServices: (services: ServiceItem[]) => void;
  updateService: (serviceId: string, updates: Partial<ServiceItem>) => void;
  addService: (newService: ServiceItem) => void;

  tokens: TokenItem[];
  setTokens: (tokens: TokenItem[]) => void;
  upsertToken: (token: TokenItem) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'en' ? 'gu' : 'en' })),

      activeTokenId: null,
      setActiveTokenId: (activeTokenId) => set({ activeTokenId }),

      settings: DEFAULT_SALON_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      barbers: INITIAL_BARBERS,
      setBarbers: (barbers) => set({ barbers }),
      updateBarberStatus: (barberId, status, breakMins) =>
        set((state) => ({
          barbers: state.barbers.map((b) =>
            b.id === barberId
              ? { ...b, status, currentBreakMinutes: breakMins ?? b.currentBreakMinutes }
              : b
          ),
        })),

      services: INITIAL_SERVICES,
      setServices: (services) => set({ services }),
      updateService: (serviceId, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, ...updates } : s
          ),
        })),
      addService: (newService) =>
        set((state) => ({ services: [...state.services, newService] })),

      tokens: [],
      setTokens: (tokens) => set({ tokens }),
      upsertToken: (token) =>
        set((state) => {
          const index = state.tokens.findIndex((t) => t.id === token.id);
          if (index >= 0) {
            const next = [...state.tokens];
            next[index] = token;
            return { tokens: next };
          }
          return { tokens: [...state.tokens, token] };
        }),
    }),
    {
      name: 'trim_tone_salon_store_v1',
      partialize: (state) => ({
        language: state.language,
        activeTokenId: state.activeTokenId,
        settings: state.settings,
        barbers: state.barbers,
        services: state.services,
      }),
    }
  )
);
