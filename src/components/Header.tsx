'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import AuthModal from '@/app/components/AuthModal';

const navLinks = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Profil', href: '#profil' },
  { label: 'Fokus Sumut', href: '#fokus' },
  { label: 'Peta Aspirasi', href: '#peta' },
  { label: 'Galeri', href: '#galeri' },
  { label: 'Gabung Relawan', href: '#aspirasi' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#hero')}
            className="flex items-center gap-2.5 group"
            aria-label="SuaraUtara - Kembali ke atas"
          >
            <AppLogo size={36} />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-tight">
                SuaraUtara
              </span>
              <span className="text-[10px] font-medium text-emerald-mid leading-none tracking-wide uppercase">
                DPD RI Sumut 2029
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <AuthModal />
            <button
              onClick={() => handleNavClick('#aspirasi')}
              className="hidden sm:flex btn-pill bg-secondary text-secondary-foreground px-5 py-2.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark"
            >
              Titip Aspirasi
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col gap-1.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-dark/95 backdrop-blur-xl flex flex-col pt-24 px-6 pb-8"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link, i) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="w-full text-left px-5 py-4 rounded-2xl text-lg font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('#aspirasi')}
              className="mt-4 btn-pill bg-secondary text-secondary-foreground px-6 py-4 text-base font-bold shadow-emerald-md"
            >
              Titip Aspirasi Warga
            </button>
          </nav>
        </div>
      )}
    </>
  );
}