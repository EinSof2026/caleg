'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FocusItem {
  id: number;
  icon: string;
  tag: string;
  title: string;
  description: string;
  detail: string;
  span: string;
}

const focusItems: FocusItem[] = [
  {
    id: 1,
    icon: 'TruckIcon',
    tag: 'Infrastruktur',
    title: 'Pemerataan Infrastruktur Sumut',
    description:
      'Memperjuangkan konektivitas antar-kabupaten dan membuka keterisoliran daerah Nias, Kepulauan, Tapanuli, dan Simalungun.',
    detail: 'Jalan lintas, jembatan, pelabuhan, dan akses internet desa terpencil.',
    span: 'col-span-12 sm:col-span-6',
  },
  {
    id: 2,
    icon: 'BuildingStorefrontIcon',
    tag: 'Ekonomi Rakyat',
    title: 'Penguatan UMKM & Ekonomi Rakyat',
    description:
      'Digitalisasi hasil pertanian, perkebunan sawit, dan perikanan lokal agar petani dan nelayan Sumut berdaya saing nasional.',
    detail: 'Akses modal UMKM, pasar digital daerah, koperasi digital.',
    span: 'col-span-12 sm:col-span-6',
  },
  {
    id: 3,
    icon: 'GlobeAsiaAustraliaIcon',
    tag: 'Pariwisata & Budaya',
    title: 'Danau Toba & Cagar Budaya',
    description:
      'Pengembangan kawasan strategis Danau Toba dan pelestarian warisan budaya Batak, Nias, Melayu, Karo, dan Mandailing.',
    detail: 'Dana pariwisata daerah, pelestarian adat, festival budaya nasional.',
    span: 'col-span-12 sm:col-span-4',
  },
  {
    id: 4,
    icon: 'AcademicCapIcon',
    tag: 'Pendidikan & Kesehatan',
    title: 'Akses Merata Pendidikan & Kesehatan',
    description:
      'Beasiswa daerah terpencil dan pemerataan fasilitas medis hingga pelosok desa di seluruh Sumatera Utara.',
    detail: 'Puskesmas pembantu, beasiswa S1/vokasi, sekolah inklusif.',
    span: 'col-span-12 sm:col-span-4',
  },
  {
    id: 5,
    icon: 'HandRaisedIcon',
    tag: 'Harmoni & Kerukunan',
    title: 'Rumah Inklusif Semua Suku & Agama',
    description:
      'Menjaga Sumatera Utara sebagai rumah yang aman, damai, dan inklusif bagi Melayu, Batak, Nias, Jawa, Tionghoa, dan semua.',
    detail: 'Dialog lintas budaya, forum kerukunan, pendidikan toleransi.',
    span: 'col-span-12 sm:col-span-4',
  },
];

export default function FokusPerjuangan() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="fokus" className="py-20 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-pale border border-emerald-mid/20">
            <Icon name="FlagIcon" variant="solid" size={14} className="text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">5 Fokus Perjuangan</span>
          </div>
          <h2 className="text-display font-extrabold text-foreground">
            Program Nyata untuk{' '}
            <span className="text-gradient-emerald">Sumatera Utara</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
            Bukan janji kampanye semata — ini adalah komitmen tertulis yang akan diperjuangkan
            di Senayan demi kemajuan 33 Kabupaten/Kota kita.
          </p>
        </div>

        {/* Bento Grid */}
        {/* Row 1: [col-1-6: Infrastruktur cs-6] [col-7-12: Ekonomi cs-6] */}
        {/* Row 2: [col-1-4: Pariwisata cs-4] [col-5-8: Pendidikan cs-4] [col-9-12: Harmoni cs-4] */}
        <div ref={ref} className="grid grid-cols-12 gap-4 sm:gap-5">
          {focusItems.map((item, i) => (
            /* Card: col-span assigned via item.span */
            <div
              key={item.id}
              className={`${item.span} focus-card-hover bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col gap-5 cursor-default transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Icon + Tag */}
              <div className="flex items-start justify-between gap-4">
                <div className="focus-icon w-12 h-12 rounded-2xl bg-emerald-pale flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <Icon name={item.icon as 'TruckIcon'} variant="outline" size={22} className="text-secondary transition-colors duration-300" />
                </div>
                <span className="focus-tag text-[10px] font-bold uppercase tracking-widest text-secondary bg-emerald-pale px-3 py-1.5 rounded-full transition-all duration-300">
                  {item.tag}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-extrabold text-foreground leading-tight transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="focus-desc text-sm text-muted-foreground leading-relaxed transition-colors duration-300">
                  {item.description}
                </p>
              </div>

              {/* Detail chip */}
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" variant="solid" size={14} className="text-secondary flex-shrink-0 transition-colors duration-300" />
                <span className="focus-desc text-xs text-muted-foreground transition-colors duration-300">{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}