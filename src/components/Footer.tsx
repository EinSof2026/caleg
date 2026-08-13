import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

const footerLinks = [
  { label: 'Profil', href: '#profil' },
  { label: 'Fokus Sumut', href: '#fokus' },
  { label: 'Peta Aspirasi', href: '#peta' },
  { label: 'Titip Aspirasi', href: '#aspirasi' },
  { label: 'Privasi', href: '#' },
  { label: 'Ketentuan', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Linear Single-Row Pattern */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2.5">
            <AppLogo size={28} />
            <span className="font-extrabold text-foreground text-sm tracking-tight">
              SuaraUtara
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks?.map((link) => (
              <a
                key={link?.label}
                href={link?.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {link?.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm font-medium text-muted-foreground text-center sm:text-right">
            © 2026 SuaraUtara · DPD RI Sumut
          </p>
        </div>
      </div>
    </footer>
  );
}