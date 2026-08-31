'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import SumutMap from '@/app/components/SumutMap';

type TabType = 'aspirasi' | 'relawan';

interface UserData {
  username: string;
  nama: string;
  usia?: string;
  alamat?: string;
}

interface FormData {
  nama: string;
  kabupaten: string;
  kecamatan: string;
  whatsapp: string;
  kategori: string;
  pesan: string;
}

interface RelawanData {
  nama: string;
  kabupaten: string;
  whatsapp: string;
  email: string;
  motivasi: string;
}

const kabupatenList = [
  'Kota Medan', 'Kota Binjai', 'Kota Tebing Tinggi', 'Kota Pematangsiantar',
  'Kota Tanjungbalai', 'Kota Sibolga', 'Kota Padangsidimpuan', 'Kota Gunungsitoli',
  'Deli Serdang', 'Langkat', 'Karo', 'Simalungun', 'Asahan', 'Labuhanbatu',
  'Tapanuli Utara', 'Tapanuli Tengah', 'Tapanuli Selatan', 'Nias', 'Nias Selatan',
  'Nias Utara', 'Nias Barat', 'Samosir', 'Toba', 'Humbang Hasundutan',
  'Pakpak Bharat', 'Dairi', 'Batu Bara', 'Serdang Bedagai', 'Padang Lawas',
  'Padang Lawas Utara', 'Labuhanbatu Selatan', 'Labuhanbatu Utara', 'Mandailing Natal',
];

const kategoriList = [
  'Infrastruktur & Jalan', 'Ekonomi & UMKM', 'Pendidikan', 'Kesehatan',
  'Pertanian & Perikanan', 'Pariwisata & Budaya', 'Kerukunan & Sosial', 'Lainnya',
];

const initialFormData: FormData = {
  nama: '', kabupaten: '', kecamatan: '', whatsapp: '', kategori: '', pesan: '',
};

const initialRelawanData: RelawanData = {
  nama: '', kabupaten: '', whatsapp: '', email: '', motivasi: '',
};

const TELEGRAM_BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/GANTI_DENGAN_USERNAME_BOT';

function matchKabupaten(alamat: string): string {
  const alamatLower = alamat.toLowerCase();
  for (const k of kabupatenList) {
    if (alamatLower.includes(k.toLowerCase())) {
      return k;
    }
  }
  return '';
}

export default function AspirasiForm() {
  const [activeTab, setActiveTab] = useState<TabType>('aspirasi');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [relawanData, setRelawanData] = useState<RelawanData>(initialRelawanData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const successAnimTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkSession = () => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          const nama = d.user.nama || '';
          const matchedKab = d.user.alamat ? matchKabupaten(d.user.alamat) : '';
          setFormData((prev) => ({
            ...prev,
            nama: nama || prev.nama,
            kabupaten: matchedKab || prev.kabupaten,
          }));
          setRelawanData((prev) => ({
            ...prev,
            nama: nama || prev.nama,
            kabupaten: matchedKab || prev.kabupaten,
          }));
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    checkSession();
    const handler = () => checkSession();
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.kabupaten) newErrors.kabupaten = 'Pilih Kabupaten/Kota';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    else if (!/^(\+62|62|0)[0-9]{8,12}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = 'Format nomor tidak valid';
    }
    if (!formData.kategori) newErrors.kategori = 'Pilih kategori aspirasi';
    if (!formData.pesan.trim()) newErrors.pesan = 'Isi pesan aspirasi Anda';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (activeTab === 'aspirasi' && !validateForm()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = activeTab === 'aspirasi'
        ? { jenis: 'aspirasi', data: formData }
        : { jenis: 'relawan', data: relawanData };
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || 'Terjadi kesalahan saat mengirim data.');
      }
      setShowSuccessAnim(true);
      successAnimTimerRef.current = setTimeout(() => {
        setShowSuccessAnim(false);
        setSubmitted(true);
      }, 2200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal mengirim data. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (successAnimTimerRef.current) clearTimeout(successAnimTimerRef.current);
    };
  }, []);

  const handleReset = () => {
    setSubmitted(false);
    setShowSuccessAnim(false);
    if (user) {
      const nama = user.nama || '';
      const matchedKab = user.alamat ? matchKabupaten(user.alamat) : '';
      setFormData({ ...initialFormData, nama, kabupaten: matchedKab });
      setRelawanData({ ...initialRelawanData, nama, kabupaten: matchedKab });
    } else {
      setFormData(initialFormData);
      setRelawanData(initialRelawanData);
    }
    setErrors({});
    setSubmitError(null);
  };

  const inputClass = 'w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all border-border focus:border-secondary';

  return (
    <section id="aspirasi" className="py-20 px-4 sm:px-6 tonal-surface">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-pale border border-emerald-mid/20">
            <Icon name="ChatBubbleLeftRightIcon" variant="solid" size={14} className="text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Suara Anda Penting</span>
          </div>
          <h2 className="text-display font-extrabold text-foreground">
            Titip Aspirasi &{' '}
            <span className="text-gradient-emerald">Gabung Relawan</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed">
            Setiap aspirasi Anda dicatat dan menjadi bahan perjuangan nyata di Senayan.
            Bersama kita bangun Sumatera Utara yang lebih maju.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-emerald-mid/20 rounded-2xl px-6 py-5 shadow-emerald-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-pale flex items-center justify-center flex-shrink-0">
              <Icon name="ChatBubbleLeftRightIcon" variant="solid" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">Lebih suka bercakap langsung?</p>
              <p className="text-xs text-muted-foreground">Chat dengan AI asisten kami di Telegram, kapan saja.</p>
            </div>
          </div>
          <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" className="btn-pill bg-secondary text-white px-6 py-3 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark flex items-center gap-2 flex-shrink-0">
            <Icon name="PaperAirplaneIcon" variant="solid" size={16} className="text-white" />
            Hubungi AI Asisten
          </a>
        </div>

        {showLoginPrompt && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Icon name="ExclamationTriangleIcon" variant="solid" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Anda harus login terlebih dahulu</p>
              <p className="text-xs text-amber-700 mt-1">Silakan masuk atau daftar akun untuk mengirim aspirasi atau mendaftar sebagai relawan.</p>
            </div>
            <button onClick={() => setShowLoginPrompt(false)} className="text-amber-600 hover:text-amber-800 text-xs font-bold">Tutup</button>
          </div>
        )}

        <div className="relative flex rounded-2xl bg-card border border-border p-1.5 mb-8 max-w-sm mx-auto">
          <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-secondary shadow-emerald-sm transition-transform duration-300 ease-out ${activeTab === 'relawan' ? 'translate-x-full' : 'translate-x-0'}`} />
          {(['aspirasi', 'relawan'] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSubmitted(false); setSubmitError(null); }} className={`relative flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'aspirasi' ? 'Titip Aspirasi' : 'Gabung Relawan'}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-navy-sm relative overflow-hidden">
          {showSuccessAnim && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
              {/* Backdrop blur only behind the circle */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Glow ring outer */}
                <div className="absolute w-[180px] h-[180px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', animation: 'successGlowPulse 1.2s ease-in-out infinite' }} />
                {/* Circular frame with blur bg */}
                <div className="relative w-[140px] h-[140px] rounded-full flex items-center justify-center" style={{ background: 'rgba(4, 120, 87, 0.15)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '3px solid rgba(5, 150, 105, 0.4)', boxShadow: '0 0 40px rgba(5, 150, 105, 0.2)' }}>
                  {/* Flowing ring animation (SVG circle draw) */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="66" fill="none" stroke="url(#successRingGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="415" strokeDashoffset="415" style={{ animation: 'successRingDraw 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards' }} />
                    <defs>
                      <linearGradient id="successRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#047857" />
                        <stop offset="50%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Checkmark SVG with draw animation */}
                  <svg className="w-14 h-14 relative z-10" viewBox="0 0 56 56" fill="none">
                    <path d="M14 28L24 38L42 18" stroke="url(#checkGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: 'successCheckDraw 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.7s forwards' }} />
                    <defs>
                      <linearGradient id="checkGrad" x1="14" y1="18" x2="42" y2="38">
                        <stop offset="0%" stopColor="#047857" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* "Terkirim" text */}
                <p className="mt-5 text-lg font-extrabold" style={{ color: '#047857', opacity: 0, animation: 'successTextFadeIn 0.4s ease-out 1.1s forwards' }}>Terkirim</p>
              </div>
            </div>
          )}
          <div key={activeTab} className="animate-fade-in-up">
          {submitted ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-pale flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" variant="solid" size={40} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-foreground">
                  {activeTab === 'aspirasi' ? 'Aspirasi Terkirim!' : 'Pendaftaran Diterima!'}
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {activeTab === 'aspirasi' ? 'Terima kasih! Aspirasi Anda telah diteruskan ke tim kami.' : 'Selamat bergabung sebagai relawan Maruba Sinaga! Tim koordinator akan menghubungi Anda untuk langkah selanjutnya.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 bg-emerald-pale rounded-2xl px-6 py-4">
                <Icon name="ChatBubbleLeftIcon" variant="solid" size={20} className="text-secondary" />
                <p className="text-sm font-semibold text-secondary">
                  Bincang lanjutan dengan AI kami di{' '}
                  <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-dark">Telegram</a>
                </p>
              </div>
              <button onClick={handleReset} className="btn-pill bg-secondary text-white px-8 py-3 text-sm font-bold hover:bg-emerald-dark">Kirim Lagi</button>
            </div>
          ) : activeTab === 'aspirasi' ? (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {submitError && (
                <div className="bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-accent">{submitError}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Nama Lengkap <span className="text-accent">*</span></label>
                  <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Masukkan nama lengkap"
                    className={`${inputClass} ${errors.nama ? 'border-accent' : ''}`} />
                  {errors.nama && <p className="text-xs text-accent">{errors.nama}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Nomor WhatsApp <span className="text-accent">*</span></label>
                  <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="08xxxxxxxxxx"
                    className={`${inputClass} ${errors.whatsapp ? 'border-accent' : ''}`} />
                  {errors.whatsapp && <p className="text-xs text-accent">{errors.whatsapp}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Kabupaten/Kota <span className="text-accent">*</span></label>
                  <select value={formData.kabupaten} onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                    className={`${inputClass} ${errors.kabupaten ? 'border-accent' : ''}`}>
                    <option value="">Pilih Kabupaten/Kota</option>
                    {kabupatenList.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {errors.kabupaten && <p className="text-xs text-accent">{errors.kabupaten}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Kecamatan</label>
                  <input type="text" value={formData.kecamatan} onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })} placeholder="Nama kecamatan (opsional)" className={inputClass} />
                </div>
              </div>
              <SumutMap selected={formData.kabupaten} onSelect={(name) => setFormData({ ...formData, kabupaten: name })} className="w-[calc(100%+80px)] -mx-10" />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Kategori Aspirasi <span className="text-accent">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {kategoriList.map((kat) => (
                    <button key={kat} type="button" onClick={() => setFormData({ ...formData, kategori: kat })}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${formData.kategori === kat ? 'bg-secondary text-white shadow-emerald-sm' : 'bg-surface-container border border-border text-muted-foreground hover:border-secondary hover:text-secondary'}`}>
                      {kat}
                    </button>
                  ))}
                </div>
                {errors.kategori && <p className="text-xs text-accent">{errors.kategori}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Pesan / Aspirasi Anda <span className="text-accent">*</span></label>
                <textarea value={formData.pesan} onChange={(e) => setFormData({ ...formData, pesan: e.target.value })} placeholder="Ceritakan masalah atau aspirasi Anda untuk daerah Anda..." rows={5}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all resize-none ${errors.pesan ? 'border-accent' : 'border-border focus:border-secondary'}`} />
                {errors.pesan && <p className="text-xs text-accent">{errors.pesan}</p>}
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Icon name="LockClosedIcon" variant="solid" size={12} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                Data Anda aman dan hanya digunakan untuk keperluan aspirasi. Tidak disebarkan ke pihak ketiga.
              </p>
              {!user && (
                <p className="text-xs text-amber-600 flex items-start gap-2">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  Anda harus login untuk mengirim aspirasi.
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-pill w-full bg-secondary text-white py-4 text-base font-bold shadow-emerald-md hover:bg-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Mengirim...</>
                ) : (
                  <><Icon name="PaperAirplaneIcon" variant="solid" size={16} className="text-white" />{!user ? 'Login untuk Kirim Aspirasi' : 'Kirim Aspirasi Saya'}</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-accent">{submitError}</p>
                </div>
              )}
              <div className="bg-emerald-pale border border-emerald-mid/20 rounded-2xl p-4 flex items-start gap-3">
                <Icon name="InformationCircleIcon" variant="solid" size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary font-medium leading-relaxed">
                  Bergabunglah sebagai relawan Maruba Sinaga dan jadilah bagian dari gerakan perubahan nyata di Sumatera Utara. Tim koordinator akan menghubungi Anda.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Nama Lengkap <span className="text-accent">*</span></label>
                  <input type="text" required value={relawanData.nama} onChange={(e) => setRelawanData({ ...relawanData, nama: e.target.value })} placeholder="Masukkan nama lengkap" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Nomor WhatsApp <span className="text-accent">*</span></label>
                  <input type="tel" required value={relawanData.whatsapp} onChange={(e) => setRelawanData({ ...relawanData, whatsapp: e.target.value })} placeholder="08xxxxxxxxxx" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Kabupaten/Kota <span className="text-accent">*</span></label>
                  <select required value={relawanData.kabupaten} onChange={(e) => setRelawanData({ ...relawanData, kabupaten: e.target.value })} className={inputClass}>
                    <option value="">Pilih Kabupaten/Kota</option>
                    {kabupatenList.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Email</label>
                  <input type="email" value={relawanData.email} onChange={(e) => setRelawanData({ ...relawanData, email: e.target.value })} placeholder="email@contoh.com (opsional)" className={inputClass} />
                </div>
              </div>
              <SumutMap selected={relawanData.kabupaten} onSelect={(name) => setRelawanData({ ...relawanData, kabupaten: name })} className="w-[calc(100%+80px)] -mx-10" />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Motivasi Bergabung</label>
                <textarea value={relawanData.motivasi} onChange={(e) => setRelawanData({ ...relawanData, motivasi: e.target.value })} placeholder="Ceritakan mengapa Anda ingin bergabung sebagai relawan..." rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-border text-sm font-medium text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none" />
              </div>
              {!user && (
                <p className="text-xs text-amber-600 flex items-start gap-2">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  Anda harus login untuk mendaftar sebagai relawan.
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-pill w-full bg-primary text-primary-foreground py-4 text-base font-bold shadow-navy-md hover:bg-navy-mid disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Mendaftarkan...</>
                ) : (
                  <><Icon name="UserPlusIcon" variant="solid" size={16} className="text-white" />{!user ? 'Login untuk Gabung Relawan' : 'Daftar Sebagai Relawan'}</>
                )}
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
