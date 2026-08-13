'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Stat {
  value: string;
  label: string;
  sublabel: string;
  iconName: string;
  color: string;
  bgColor: string;
}

const stats: Stat[] = [
  {
    value: '33',
    label: 'Kabupaten/Kota',
    sublabel: 'Sumatera Utara Terwakili',
    iconName: 'MapIcon',
    color: 'text-secondary',
    bgColor: 'bg-emerald-pale',
  },
  {
    value: '100+',
    label: 'Program Pengabdian',
    sublabel: 'Aksi Nyata di Lapangan',
    iconName: 'HeartIcon',
    color: 'text-accent',
    bgColor: 'bg-red-light',
  },
  {
    value: '15+',
    label: 'Tahun Pengalaman',
    sublabel: 'Organisasi & Kemasyarakatan',
    iconName: 'AcademicCapIcon',
    color: 'text-secondary',
    bgColor: 'bg-emerald-pale',
  },
  {
    value: '100%',
    label: 'Independen',
    sublabel: 'Tanpa Sekat Partai Politik',
    iconName: 'ShieldCheckIcon',
    color: 'text-primary',
    bgColor: 'bg-surface-container',
  },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="tonal-surface border-y border-border/60 py-12 px-4 sm:px-6">
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon name={stat.iconName as 'MapIcon'} variant="solid" size={22} className={stat.color} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground leading-none">{stat.value}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}