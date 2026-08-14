'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';
import type { Session } from '@supabase/supabase-js';

type Step = 'input' | 'otp' | 'loading';

/** Deteksi apakah input adalah email atau nomor HP. Normalisasi nomor ke format +62. */
function parseIdentifier(raw: string): { kind: 'email' | 'phone'; value: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return { kind: 'email', value: trimmed.toLowerCase() };

  // Nomor HP: 08xx / 8xx / 62xx / +62xx
  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  else if (digits.startsWith('8')) digits = '62' + digits;
  if (!/^62\d{8,13}$/.test(digits)) return null;
  return { kind: 'phone', value: '+' + digits };
}

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<Step>('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = getSupabaseBrowser();

  // Amati perubahan sesi (login/logout/refresh)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!open) {
      setStep('input');
      setIdentifier('');
      setOtp('');
      setError(null);
      setNotice(null);
    }
  }, [open]);

  // Penghitung waktu kirim ulang OTP
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = parseIdentifier(identifier);
    if (!parsed) {
      setError('Masukkan email atau nomor HP yang valid (contoh: nama@email.com atau 0812xxxx).');
      return;
    }

    setStep('loading');
    try {
      if (parsed.kind === 'email') {
        const { error } = await supabase.auth.signInWithOtp({ email: parsed.value });
        if (error) throw error;
        setNotice(`Kode masuk telah dikirim ke email ${parsed.value}.`);
      } else {
        // OTP nomor HP dikirim via WhatsApp (sesuai keputusan tim)
        const { error } = await supabase.auth.signInWithOtp({
          phone: parsed.value,
          options: { channel: 'whatsapp' },
        });
        if (error) throw error;
        setNotice(`Kode masuk telah dikirim via WhatsApp ke ${parsed.value}.`);
      }
      setStep('otp');
      startCountdown(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes('rate')
            ? 'Terlalu sering mencoba. Tunggu sebentar lalu coba lagi.'
            : 'Gagal mengirim kode. Periksa kembali email/nomor HP Anda.'
          : 'Gagal mengirim kode. Coba lagi.'
      );
      setStep('input');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Kode harus 6 angka.');
      return;
    }

    setStep('loading');
    try {
      const parsed = parseIdentifier(identifier)!;
      const { error } =
        parsed.kind === 'email'
          ? await supabase.auth.verifyOtp({ email: parsed.value, token: code, type: 'email' })
          : await supabase.auth.verifyOtp({ phone: parsed.value, token: code, type: 'sms' });
      if (error) throw error;
      // Sesi otomatis terpasang via onAuthStateChange
      setStep('input');
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('token')
          ? 'Kode salah atau sudah kedaluwarsa. Coba lagi.'
          : 'Verifikasi gagal. Periksa kode Anda.'
      );
      setStep('otp');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => null);
    setSession(null);
  };

  const userEmail = session?.user?.email ?? null;
  const userPhone = session?.user?.phone ?? null;
  const userLabel = userEmail || userPhone || '';

  const inputBtnClass =
    'w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all border-border focus:border-secondary';

  return (
    <>
      {/* Tombol pemicu */}
      {session ? (
        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          title={userLabel}
        >
          <Icon name="UserCircleIcon" variant="solid" size={16} className="text-emerald-mid" />
          <span className="max-w-[120px] truncate">{userLabel}</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
        >
          <Icon name="UserCircleIcon" variant="outline" size={16} />
          Masuk
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-navy-md animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-pale flex items-center justify-center flex-shrink-0">
                  <Icon name="UserCircleIcon" variant="solid" size={22} className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-foreground leading-tight">
                    {session ? 'Akun Anda' : 'Masuk / Daftar'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session ? 'Sesi aktif via email / WhatsApp' : 'Tanpa kata sandi — cukup kode OTP'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors"
                aria-label="Tutup"
              >
                <Icon name="XMarkIcon" variant="outline" size={18} />
              </button>
            </div>

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

            {session ? (
              /* ---- Sudah login ---- */
              <div className="space-y-4">
                <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {(userLabel[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{userLabel}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {userEmail ? 'Email' : 'Nomor HP'} terverifikasi
                    </p>
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
            ) : step === 'loading' ? (
              /* ---- Mengirim/memeriksa ---- */
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-mid/30 border-t-emerald-mid rounded-full animate-spin" />
                <p className="text-sm font-semibold text-muted-foreground">Memproses...</p>
              </div>
            ) : step === 'otp' ? (
              /* ---- Masukkan kode OTP ---- */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Kode Masuk</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className={`${inputBtnClass} text-center text-lg tracking-[0.5em] font-bold`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kode 6 angka dikirim ke {identifier}.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={otp.length !== 6}
                  className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="LockClosedIcon" variant="solid" size={16} className="text-white" />
                  Verifikasi & Masuk
                </button>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep('input'); setOtp(''); setError(null); }}
                    className="text-muted-foreground hover:text-foreground font-semibold transition-colors"
                  >
                    Ganti email/HP
                  </button>
                  {countdown > 0 ? (
                    <span className="text-muted-foreground font-semibold">Kirim ulang ({countdown}s)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-secondary hover:text-emerald-dark font-bold transition-colors"
                    >
                      Kirim ulang kode
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* ---- Input email / nomor HP ---- */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Email atau Nomor HP</label>
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@email.com atau 0812xxxx"
                    autoFocus
                    className={inputBtnClass}
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Kami kirim kode OTP ke email atau WhatsApp Anda. Tanpa kata sandi.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!identifier.trim()}
                  className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="PaperAirplaneIcon" variant="solid" size={16} className="text-white" />
                  Kirim Kode Masuk
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
