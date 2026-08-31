'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/AppIcon';

type Step = 'input' | 'loading';
type Mode = 'masuk' | 'daftar';
type Variant = 'header' | 'menu';

interface UserData {
  email: string;
  nama: string;
}

interface DaftarForm {
  nama: string;
  email: string;
  password: string;
  usia: string;
  alamat: string;
}

const initialDaftarForm: DaftarForm = { nama: '', email: '', password: '', usia: '', alamat: '' };

export default function AuthModal({ variant = 'header', onOpen }: { variant?: Variant; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [mode, setMode] = useState<Mode>('masuk');
  const [step, setStep] = useState<Step>('input');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [daftarForm, setDaftarForm] = useState<DaftarForm>(initialDaftarForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ── Cek sesi saat mount ─────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  // ── Reset state saat modal ditutup ──────────────────────────────
  useEffect(() => {
    if (!open) {
      setStep('input');
      setMode('masuk');
      setLoginEmail('');
      setLoginPassword('');
      setDaftarForm(initialDaftarForm);
      setError(null);
      setNotice(null);
    }
  }, [open]);

  // ── Kunci scroll halaman ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ── Login ───────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const email = loginEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Masukkan alamat email yang valid.'); return;
    }
    if (!loginPassword) {
      setError('Password wajib diisi.'); return;
    }

    setStep('loading');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login gagal.');
      setUser(data.user);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setStep('input');
    }
  };

  // ── Register ────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const nama = daftarForm.nama.trim();
    const email = daftarForm.email.trim().toLowerCase();
    const password = daftarForm.password;
    const usia = daftarForm.usia.trim();
    const alamat = daftarForm.alamat.trim();

    if (!nama) { setError('Nama lengkap wajib diisi.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email wajib diisi dengan alamat yang valid.'); return;
    }
    if (!password || password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    const usiaNum = Number(usia);
    if (!usia || !Number.isInteger(usiaNum) || usiaNum < 1 || usiaNum > 120) {
      setError('Usia harus berupa angka antara 1–120.'); return;
    }
    if (!alamat) { setError('Alamat wajib diisi.'); return; }

    setStep('loading');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, usia, alamat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar.');
      setUser(data.user);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setStep('input');
    }
  };

  // ── Logout ──────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  };

  // ── UI helpers ──────────────────────────────────────────────────
  const inputClass =
    'w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all border-border focus:border-secondary';

  const isMenuVariant = variant === 'menu';
  const triggerClass = isMenuVariant
    ? 'w-full flex items-center gap-2.5 px-5 py-4 rounded-2xl text-lg font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200'
    : 'hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-all duration-200';

  const updateDaftar = (field: keyof DaftarForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDaftarForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleOpen = () => { setOpen(true); onOpen?.(); };

  // ════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Tombol pemicu ───────────────────────────────────────── */}
      {user ? (
        <button
          onClick={handleOpen}
          className={isMenuVariant
            ? 'w-full flex items-center gap-2.5 px-5 py-4 rounded-2xl text-lg font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200'
            : 'hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all duration-200'}
          title={user.email}
        >
          <Icon name="UserCircleIcon" variant="solid" size={16} className="text-emerald-mid" />
          <span className="max-w-[120px] truncate">{user.email}</span>
        </button>
      ) : (
        <button onClick={handleOpen} className={triggerClass}>
          <Icon name="UserCircleIcon" variant="outline" size={isMenuVariant ? 20 : 16} />
          Masuk
        </button>
      )}

      {/* ── Modal ───────────────────────────────────────────────── */}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto no-scrollbar">
          <div className="min-h-full flex px-4 py-8 sm:py-12">
            <div className="w-full max-w-md m-auto">
              {/* Tombol Kembali */}
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 -ml-2 mb-4 rounded-full text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
                aria-label="Kembali"
              >
                <Icon name="ArrowLeftIcon" variant="outline" size={16} />
                Kembali
              </button>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-pale flex items-center justify-center flex-shrink-0">
                    <Icon name="UserCircleIcon" variant="solid" size={22} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground leading-tight">
                      {user ? 'Akun Anda' : mode === 'daftar' ? 'Daftar Akun' : 'Masuk'}
                    </h3>
                    {user && <p className="text-xs text-muted-foreground mt-0.5">Sesi aktif via email &amp; password</p>}
                  </div>
                </div>
              </div>

              {/* Error & Notice */}
              {error && (
                <div className="mb-4 bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-accent">{error}</p>
                </div>
              )}
              {notice && (
                <div className="mb-4 bg-emerald-pale border border-emerald-mid/20 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <Icon name="CheckCircleIcon" variant="solid" size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-secondary">{notice}</p>
                </div>
              )}

              {/* ── Sudah login ──────────────────────────────────── */}
              {user ? (
                <div className="space-y-4">
                  <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                      {(user.nama?.[0] || user.email[0] || '?').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{user.nama || user.email}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-pill w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold hover:bg-navy-mid flex items-center justify-center gap-2"
                  >
                    <Icon name="ArrowRightStartOnRectangleIcon" variant="outline" size={16} />
                    Keluar
                  </button>
                </div>

              /* ── Loading ──────────────────────────────────────── */
              ) : step === 'loading' ? (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-mid/30 border-t-emerald-mid rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-muted-foreground">Memproses...</p>
                </div>

              /* ── Form Daftar ──────────────────────────────────── */
              ) : mode === 'daftar' ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Nama Lengkap <span className="text-accent">*</span></label>
                    <input type="text" value={daftarForm.nama} onChange={updateDaftar('nama')} placeholder="Nama lengkap Anda" className={inputClass} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">Email <span className="text-accent">*</span></label>
                      <input type="email" autoComplete="email" value={daftarForm.email} onChange={updateDaftar('email')} placeholder="nama@email.com" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">Password <span className="text-accent">*</span></label>
                      <input type="password" autoComplete="new-password" value={daftarForm.password} onChange={updateDaftar('password')} placeholder="Minimal 6 karakter" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">Usia <span className="text-accent">*</span></label>
                      <input type="number" inputMode="numeric" min={1} max={120} value={daftarForm.usia} onChange={updateDaftar('usia')} placeholder="Contoh: 35" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">Alamat <span className="text-accent">*</span></label>
                      <textarea rows={2} value={daftarForm.alamat} onChange={updateDaftar('alamat')} placeholder="Alamat lengkap" className={`${inputClass} resize-none`} />
                    </div>
                  </div>

                  <button type="submit" className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark flex items-center justify-center gap-2">
                    <Icon name="UserPlusIcon" variant="solid" size={16} className="text-white" />
                    Daftar Sekarang
                  </button>

                  <p className="text-sm font-medium text-muted-foreground text-center pt-1 border-t border-border/60">
                    Sudah punya akun?{' '}
                    <button type="button" onClick={() => { setMode('masuk'); setError(null); setNotice(null); }} className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-2 transition-colors">
                      Masuk
                    </button>
                  </p>
                </form>

              /* ── Form Masuk ───────────────────────────────────── */
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Email</label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@email.com"
                      autoFocus
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!loginEmail.trim() || !loginPassword}
                    className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" variant="solid" size={16} className="text-white" />
                    Masuk
                  </button>

                  <p className="text-sm font-medium text-muted-foreground text-center pt-1 border-t border-border/60">
                    Belum punya akun?{' '}
                    <button type="button" onClick={() => { setMode('daftar'); setError(null); setNotice(null); }} className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-2 transition-colors">
                      Daftar
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
