'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Scissors, 
  Globe, 
  Menu, 
  X, 
  Tv, 
  LayoutDashboard, 
  UserCheck, 
  Clock, 
  Settings, 
  PlusCircle 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', labelKey: 'navHome', icon: Scissors },
    { href: '/join', labelKey: 'navJoin', icon: PlusCircle },
    { href: '/status', labelKey: 'navStatus', icon: Clock },
    { href: '/reception', labelKey: 'navReception', icon: LayoutDashboard },
    { href: '/barber', labelKey: 'navBarber', icon: UserCheck },
    { href: '/tv', labelKey: 'navTv', icon: Tv },
    { href: '/settings', labelKey: 'navSettings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-cream-border shadow-cherry-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand in Cherry Burgundy & Rose */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cherry to-cherry-hover flex items-center justify-center text-white shadow-md shadow-cherry/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-cherry flex items-center gap-1.5">
                Trim & Tone
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blush-light text-cherry border border-blush">
                  Boutique
                </span>
              </span>
              <p className="text-[11px] text-darkText-subtle font-medium">
                {t('salonTagline', language)}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blush-light text-cherry border border-blush shadow-sm font-bold'
                      : 'text-darkText-muted hover:text-cherry hover:bg-cream-muted'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cherry' : 'text-rose'}`} />
                  {t(item.labelKey, language)}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blush-light hover:bg-blush text-cherry border border-blush transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Toggle English / ગુજરાતી"
            >
              <Globe className="w-3.5 h-3.5 text-rose" />
              <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-darkText-muted hover:text-cherry hover:bg-cream-muted border border-cream-border"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cherry" /> : <Menu className="w-5 h-5 text-cherry" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-border bg-white px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blush-light text-cherry border border-blush font-bold'
                    : 'text-darkText-muted hover:text-cherry hover:bg-cream'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cherry' : 'text-rose'}`} />
                {t(item.labelKey, language)}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
