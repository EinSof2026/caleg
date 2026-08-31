'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const margaData = [
  { label: 'Tulang', value: 'SITANGGANG & Seluruh PARNA' },
  { label: 'Bona Tulang', value: 'SILITONGA' },
  { label: 'Bona Ni Ari', value: 'NABABAN' },
  { label: 'Tulang Rorobot', value: 'MALAU' },
];

export default function BiografiTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pantau SECTION itu sendiri (bukan elemen bawah) dengan threshold kecil +
    // rootMargin agar animasi reveal memicu begitu bagian atas section masuk layar,
    // jadi isi langsung tampil tanpa harus scroll terlalu jauh.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="profil" ref={sectionRef} className="py-20 px-4 sm:px-6 tonal-surface">
      <div className="max-w-7xl mx-auto">
        {/* Layout: Asymmetric 60/40 */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* Left: Bio card (2 cols) */}
          <div
            className={`lg:col-span-2 space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            
            {/* Profile photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-emerald-md">
              <AppImage
                src="/assets/images/caleg2.jpg"
                alt="Professional man in formal suit, confident pose, bright well-lit office background"
                width={480}
                height={560}
                className="w-full h-72 sm:h-96 object-cover object-top" />
              
              <div
                className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
              
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-extrabold text-xl leading-tight">Pdt. Dr. Maruba Sinaga, S.H., M.H</p>
                <p className="text-emerald-mid text-sm font-semibold mt-1">Calon Anggota DPD RI · Dapil Sumut</p>
              </div>
            </div>

            {/* Bio summary */}
            <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
              <h3 className="font-extrabold text-foreground text-lg">Ringkasan Profil</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tokoh hukum, pemimpin gereja, dan pejuang kebangsaan yang menempatkan keadilan, toleransi, serta pemberdayaan masyarakat sebagai inti perjuangan. Memiliki latar pendidikan hukum yang kuat dan pengalaman kepemimpinan nasional.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                { label: 'Pendidikan', value: 'S1, S2, S3 Hukum UI' },
                { label: 'Domisili', value: 'Medan, Sumut' },
                { label: 'Jabatan', value: 'Ketua Umum' },
                { label: 'Organisasi', value: 'BKAG' }].
                map((item) =>
                <div key={item.label} className="bg-surface-container rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
                  </div>
                )}
              </div>

              {/* Stat cards */}
              <div className="flex gap-3 pt-2">
                <div className="flex-1 bg-emerald-pale rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-secondary">247</p>
                  <p className="text-[10px] font-semibold text-secondary/70 uppercase tracking-wider">Beasiswa Diberikan</p>
                </div>
                <div className="flex-1 bg-red-light rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-accent">18</p>
                  <p className="text-[10px] font-semibold text-accent/70 uppercase tracking-wider">Kab/Kota Dijangkau</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Timeline (3 cols) */}
          <div
            className={`lg:col-span-3 space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '150ms' }}>
            
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-pale border border-emerald-mid/20 mb-4">
                <Icon name="UserIcon" variant="outline" size={14} className="text-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Profil Pribadi</span>
              </div>
              <h2 className="text-display font-extrabold text-foreground">
                Siapa itu <span className="text-gradient-emerald">Maruba</span>
              </h2>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-6">

              {/* Identitas */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identitas</p>
                <div className="bg-surface-container rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 break-words">Pdt. Dr. Maruba Sinaga, S.H., M.H</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-surface-container rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pekerjaan</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Pendeta</p>
                  </div>
                  <div className="bg-surface-container rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Jabatan</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Ketua Umum BKAG</p>
                    <a
                      href="https://bkagoikumene.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-secondary hover:underline"
                    >
                      <Icon name="ArrowTopRightOnSquareIcon" variant="outline" size={12} />
                      Kunjungi BKAG
                    </a>
                  </div>
                </div>
              </div>

              {/* Orang Tua */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orang Tua</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ayah</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">A. Sinaga</p>
                  </div>
                  <div className="bg-surface-container rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ibu</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">S. br. Sitanggang</p>
                  </div>
                </div>
              </div>

              {/* Marga & Kekerabatan */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Marga &amp; Kekerabatan</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {margaData.map((m) => (
                    <div key={m.label} className="bg-surface-container rounded-2xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Alamat</p>
                <div className="bg-surface-container rounded-2xl p-4">
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    Jl. Besar Selambo, Simpang Teratai, Dsn. III A, Desa Amplas, Kecamatan Percut Sei Tuan, Kabupaten Deli Serdang, Provinsi Sumatera Utara
                  </p>
                </div>
              </div>

              {/* HP/WA — tampilan sama dengan bagian lain, tapi bisa diklik menuju WhatsApp */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kontak</p>
                <a
                  href="https://wa.me/62811806965"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container rounded-2xl p-4 block hover:bg-emerald-pale transition-colors"
                  title="Chat via WhatsApp"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">HP/WA</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 inline-flex items-center gap-1.5 hover:underline">
                    <Icon name="PhoneIcon" variant="solid" size={14} className="text-secondary" />
                    0811806965
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}