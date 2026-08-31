'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

interface Submission {
  id: number;
  jenis: 'aspirasi' | 'relawan' | 'daftar';
  data: Record<string, string>;
  created_at: string;
}

type Tab = 'semua' | 'aspirasi' | 'relawan' | 'daftar';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Ubah nomor HP (08xx / 8xx / 62xx / +62xx) menjadi tautan wa.me yang valid. */
function waLink(number: string): string {
  let digits = (number || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  else if (digits.startsWith('8')) digits = '62' + digits;
  return `https://wa.me/${digits}`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State login
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<Tab>('semua');
  const [deleteBusy, setDeleteBusy] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Submission | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/submissions');
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      // Server error (500) — tetap tampilkan dashboard dengan pesan error
      setLoadError(json?.error || 'Gagal membaca data dari server. Pastikan tabel submissions ada di Supabase.');
      setAuthed(true);
      return;
    }
    setSubmissions(json.submissions || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setLoginError(json?.error || 'Login gagal.');
        return;
      }
      setPassword('');
      await fetchData();
    } catch {
      setLoginError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    setAuthed(false);
    setSubmissions([]);
  };

  /** Buka modal konfirmasi hapus (bukan alert bawaan browser). */
  const openDeleteConfirm = (sub: Submission) => {
    setDeleteError(null);
    setPendingDelete(sub);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeleteBusy(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setDeleteError(json?.error || 'Gagal menghapus data.');
        return;
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setPendingDelete(null);
    } catch {
      setDeleteError('Gagal menghapus data. Coba lagi.');
    } finally {
      setDeleteBusy(null);
    }
  };

  // Kunci scroll halaman & tutup dengan tombol Escape saat modal hapus terbuka
  useEffect(() => {
    if (!pendingDelete) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteBusy === null) setPendingDelete(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [pendingDelete, deleteBusy]);

  // ----- Layar cek sesi (loading) -----
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-mid/30 border-t-emerald-mid rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  // ----- Layar login -----
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-navy-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <AppLogo size={56} />
              <h1 className="text-2xl font-extrabold text-foreground mt-4">Panel Admin</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Masuk untuk melihat data aspirasi & relawan
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-accent">{loginError}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi admin"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border border-border text-sm font-medium text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading || !password}
                className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <Icon name="LockClosedIcon" variant="solid" size={16} className="text-white" />
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Halaman ini khusus pemilik website Maruba Sinaga.
          </p>
        </div>
      </div>
    );
  }

  // ----- Dashboard -----
  const aspirasiCount = submissions.filter((s) => s.jenis === 'aspirasi').length;
  const relawanCount = submissions.filter((s) => s.jenis === 'relawan').length;
  const daftarCount = submissions.filter((s) => s.jenis === 'daftar').length;

  const filtered =
    tab === 'semua' ? submissions : submissions.filter((s) => s.jenis === tab);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <AppLogo size={32} />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-extrabold text-foreground text-sm tracking-tight truncate">Panel Admin</span>
              <span className="text-[10px] font-medium text-emerald-mid uppercase tracking-wide">Maruba Sinaga</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <Icon name="ArrowLeftIcon" variant="outline" size={14} />
              Kembali ke situs
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-card border border-border text-foreground hover:bg-red-light hover:text-accent transition-colors"
            >
              <Icon name="ArrowRightStartOnRectangleIcon" variant="outline" size={14} />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Judul */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-pale flex items-center justify-center">
            <Icon name="ShieldCheckIcon" variant="solid" size={22} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Data Aspirasi & Relawan</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Semua pengiriman dari formulir website, terbaru di atas.
            </p>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{submissions.length}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Total Masuk</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-secondary">{aspirasiCount}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Aspirasi</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">{relawanCount}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Relawan</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-accent">{daftarCount}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Daftar Akun</p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
            <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-accent">{loadError}</p>
          </div>
        )}

        {/* Tab filter */}
        <div className="flex rounded-2xl bg-card border border-border p-1.5 mb-6 max-w-md">
          {(['semua', 'aspirasi', 'relawan', 'daftar'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                tab === t ? 'bg-secondary text-white shadow-emerald-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'semua' ? `Semua (${submissions.length})` : t === 'aspirasi' ? `Aspirasi (${aspirasiCount})` : t === 'relawan' ? `Relawan (${relawanCount})` : `Daftar (${daftarCount})`}
            </button>
          ))}
        </div>

        {/* Daftar data */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
              <Icon name="InboxIcon" variant="outline" size={28} className="text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground">Belum ada data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === 'semua'
                ? 'Data aspirasi, relawan, & pendaftaran akun dari formulir website akan muncul di sini.'
                : tab === 'aspirasi'
                  ? 'Belum ada aspirasi yang masuk.'
                  : tab === 'relawan'
                    ? 'Belum ada relawan yang mendaftar.'
                    : 'Belum ada pendaftaran akun.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((sub) => {
              const d = sub.data || {};
              const isAspirasi = sub.jenis === 'aspirasi';
              const isRelawan = sub.jenis === 'relawan';
              const isDaftar = sub.jenis === 'daftar';
              return (
                <div key={sub.id} className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-navy-sm">
                  {/* Baris atas: badge + tanggal + hapus */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          isAspirasi ? 'bg-emerald-pale text-secondary' : isDaftar ? 'bg-red-light text-accent' : 'bg-surface-container text-primary'
                        }`}
                      >
                        <Icon
                          name={isAspirasi ? 'ChatBubbleLeftRightIcon' : isDaftar ? 'UserPlusIcon' : 'UserGroupIcon'}
                          variant="solid"
                          size={12}
                        />
                        {isAspirasi ? 'Aspirasi' : isDaftar ? 'Daftar Akun' : 'Relawan'}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</span>
                    </div>
                    <button
                      onClick={() => openDeleteConfirm(sub)}
                      disabled={deleteBusy === sub.id}
                      className="p-2 rounded-xl text-muted-foreground hover:text-accent hover:bg-red-light transition-colors disabled:opacity-50"
                      title="Hapus data"
                    >
                      {deleteBusy === sub.id ? (
                        <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      ) : (
                        <Icon name="TrashIcon" variant="outline" size={16} />
                      )}
                    </button>
                  </div>

                  {/* Identitas */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-surface-container rounded-2xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 break-words">{d.nama || '-'}</p>
                    </div>
                    <div className="bg-surface-container rounded-2xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isDaftar ? 'Email' : 'WhatsApp'}</p>
                      {isDaftar ? (
                        <p className="text-sm font-bold text-secondary mt-0.5 break-all">{d.email || '-'}</p>
                      ) : (
                        <a
                          href={d.whatsapp ? waLink(d.whatsapp) : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-secondary mt-0.5 break-all hover:underline"
                        >
                          {d.whatsapp || '-'}
                        </a>
                      )}
                    </div>
                    <div className="bg-surface-container rounded-2xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isDaftar ? 'Usia' : 'Kabupaten/Kota'}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 break-words">{isDaftar ? (d.usia || '-') : (d.kabupaten || '-')}</p>
                    </div>
                  </div>

                  {/* Detail per jenis */}
                  {isDaftar ? (
                    <div className="space-y-3">
                      <div className="bg-background border border-border rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Alamat</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{d.alamat}</p>
                      </div>
                    </div>
                  ) : isAspirasi ? (
                    <div className="space-y-3">
                      {d.kategori && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kategori:</span>
                          <span className="px-3 py-1 rounded-full bg-emerald-pale text-secondary text-xs font-bold">{d.kategori}</span>
                        </div>
                      )}
                      {d.kecamatan && (
                        <p className="text-xs text-muted-foreground">Kecamatan: <span className="font-semibold text-foreground">{d.kecamatan}</span></p>
                      )}
                      <div className="bg-background border border-border rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Pesan Aspirasi</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{d.pesan}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {d.email && (
                        <p className="text-xs text-muted-foreground">Email: <span className="font-semibold text-foreground break-all">{d.email}</span></p>
                      )}
                      {d.motivasi && (
                        <div className="bg-background border border-border rounded-2xl p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Motivasi</p>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{d.motivasi}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal konfirmasi hapus — pengganti alert bawaan browser */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => {
            if (deleteBusy === null) setPendingDelete(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-navy-md animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-light flex items-center justify-center mx-auto mb-4">
              <Icon name="ExclamationTriangleIcon" variant="solid" size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground text-center leading-tight">Hapus data ini?</h3>
            <p className="text-sm text-muted-foreground text-center mt-1.5 leading-relaxed">
              Data <span className="font-semibold text-foreground break-all">{pendingDelete.data?.nama || `#${pendingDelete.id}`}</span>{' '}
              akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            {deleteError && (
              <div className="mt-4 bg-red-light border border-accent/40 rounded-2xl px-4 py-3 flex items-start gap-3">
                <Icon name="ExclamationTriangleIcon" variant="solid" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-accent">{deleteError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleteBusy !== null}
                className="px-4 py-3 rounded-2xl text-sm font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteBusy !== null}
                className="px-4 py-3 rounded-2xl text-sm font-bold bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteBusy === pendingDelete.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Icon name="TrashIcon" variant="solid" size={14} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
