'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/AppIcon';

interface UserData {
  username: string;
  nama: string;
  usia?: string;
  alamat?: string;
  foto_profil?: string | null;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserData;
  onUpdate: (updatedUser: UserData) => void;
}

type Step = 'input' | 'loading';

export default function EditProfileModal({ open, onClose, user, onUpdate }: EditProfileModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [nama, setNama] = useState(user.nama || '');
  const [usia, setUsia] = useState(user.usia || '');
  const [alamat, setAlamat] = useState(user.alamat || '');
  const [fotoPreview, setFotoPreview] = useState<string | null>(user.foto_profil || null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNama(user.nama || '');
      setUsia(user.usia || '');
      setAlamat(user.alamat || '');
      setFotoPreview(user.foto_profil || null);
      setFotoFile(null);
      setError(null);
      setNotice(null);
      setStep('input');
    }
  }, [open, user]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format foto harus JPEG, PNG, atau WebP.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto maksimal 2 MB.');
      return;
    }

    setFotoFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedNama = nama.trim();
    const trimmedAlamat = alamat.trim();
    const usiaNum = Number(usia);

    if (!trimmedNama) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!usia || !Number.isInteger(usiaNum) || usiaNum < 1 || usiaNum > 120) {
      setError('Usia harus berupa angka antara 1–120.');
      return;
    }
    if (!trimmedAlamat) {
      setError('Alamat wajib diisi.');
      return;
    }

    setStep('loading');

    try {
      // Upload photo first if a new one was selected
      let photoUrl = user.foto_profil || null;
      if (fotoFile) {
        const formData = new FormData();
        formData.append('photo', fotoFile);

        const uploadRes = await fetch('/api/auth/upload-photo', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal mengunggah foto.');
        photoUrl = uploadData.url;
      }

      // Update profile
      const profileRes = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: trimmedNama,
          usia: String(usiaNum),
          alamat: trimmedAlamat,
          foto_profil: photoUrl,
        }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || 'Gagal menyimpan perubahan.');

      // Notify parent
      onUpdate({
        ...user,
        nama: trimmedNama,
        usia: String(usiaNum),
        alamat: trimmedAlamat,
        foto_profil: photoUrl,
      });

      setNotice('Profil berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      setStep('input');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all border-border focus:border-secondary';

  return (
    <>
      {open && createPortal(
        <div className="fixed inset-0 z-[70] bg-white overflow-y-auto no-scrollbar">
          <div className="min-h-full flex px-4 py-8 sm:py-12">
            <div className="w-full max-w-md m-auto">
              {/* Back Button */}
              <button
                onClick={onClose}
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
                    <Icon name="PencilSquareIcon" variant="solid" size={22} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground leading-tight">
                      Edit Profil
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Perbarui informasi profil Anda
                    </p>
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

              {/* Loading State */}
              {step === 'loading' ? (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-mid/30 border-t-emerald-mid rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-muted-foreground">Menyimpan perubahan...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <div
                        className="w-24 h-24 rounded-full overflow-hidden bg-surface-container border-2 border-border flex items-center justify-center cursor-pointer hover:border-secondary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {fotoPreview ? (
                          <img
                            src={fotoPreview}
                            alt="Foto profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="UserCircleIcon" variant="solid" size={40} className="text-muted-foreground" />
                        )}
                      </div>
                      {/* Camera overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-md hover:bg-emerald-dark transition-colors"
                      >
                        <Icon name="CameraIcon" variant="outline" size={14} className="text-white" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Klik untuk mengganti foto profil (JPEG/PNG/WebP, maks 2MB)
                    </p>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">
                      Nama Lengkap <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className={inputClass}
                    />
                  </div>

                  {/* Usia & Alamat */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">
                        Usia <span className="text-accent">*</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={120}
                        value={usia}
                        onChange={(e) => setUsia(e.target.value)}
                        placeholder="Contoh: 35"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground">
                        Alamat <span className="text-accent">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Alamat lengkap"
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Username (read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      readOnly
                      className={`${inputClass} bg-surface-container cursor-not-allowed opacity-70`}
                    />
                    <p className="text-[11px] text-muted-foreground">Username tidak dapat diubah.</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-pill w-full bg-secondary text-white py-3.5 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark flex items-center justify-center gap-2"
                  >
                    <Icon name="CheckIcon" variant="solid" size={16} className="text-white" />
                    Simpan Perubahan
                  </button>
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
