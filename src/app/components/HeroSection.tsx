'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const blob1 = heroRef.current.querySelector<HTMLElement>('.blob-move-1');
      const blob2 = heroRef.current.querySelector<HTMLElement>('.blob-move-2');
      if (blob1) {
        blob1.style.transform = `translate(${mx * 30}px, ${my * 20}px)`;
      }
      if (blob2) {
        blob2.style.transform = `translate(${mx * -20}px, ${my * -15}px)`;
      }
    };
    const el = heroRef.current;
    el?.addEventListener('mousemove', handleMouseMove);
    return () => el?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-0 bg-navy-dark grid-tech overflow-hidden noise-overlay">
      
      {/* Atmospheric depth blobs */}
      <div
        className="blob-move-1 absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none transition-transform duration-700"
        style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.25) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      
      <div
        className="blob-move-2 absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none transition-transform duration-700"
        style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(5,150,105,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }} />
      

      {/* Main content grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-28 lg:py-20">

        {/* Left: Text Content */}
        <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-mid/30 bg-emerald-mid/10">
            <span className="w-2 h-2 rounded-full bg-emerald-mid animate-pulse-dot" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-mid">
              Caleg DPD RI · Dapil Sumatera Utara 2029
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-hero-xl font-extrabold text-white leading-tight">
            Menjadi{' '}
            <span className="text-gradient-emerald">Suara Nyata</span>
            <br />
            Sumatera Utara
            <br />
            <span className="text-white/60 text-[0.65em]">di Tingkat Nasional</span>
          </h1>

          {/* Sub-headline */}
          <p className="max-w-lg mx-auto lg:mx-0 text-base sm:text-lg text-white/60 leading-relaxed font-medium">
            Independen tanpa sekat partai. Memperjuangkan alokasi anggaran pusat,
            infrastruktur lintas daerah, dan pelestarian budaya 33 Kabupaten/Kota
            Sumatera Utara.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
            <div className="text-center lg:text-left">
              <p className="text-3xl font-extrabold text-white">33</p>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Kab/Kota Terwakili</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center lg:text-left">
              <p className="text-3xl font-extrabold text-white">100+</p>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Program Pengabdian</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center lg:text-left">
              <p className="text-3xl font-extrabold text-emerald-mid">100%</p>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Independen</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href="#aspirasi"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#aspirasi')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-pill bg-secondary text-secondary-foreground px-8 py-4 text-base font-bold shadow-emerald-md hover:bg-emerald-dark">
              
              Titip Aspirasi Warga
            </a>
            <a
              href="#fokus"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#fokus')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-pill border border-white/20 text-white px-8 py-4 text-base font-semibold hover:bg-white/10">
              
              Lihat Program
            </a>
          </div>
        </div>

        {/* Right: Photo with Material You treatment */}
        <div className="relative order-1 lg:order-2 flex justify-center">
          {/* Scan line overlay container */}
          <div className="relative w-full max-w-sm lg:max-w-none">
            {/* Decorative rounded blob behind photo */}
            <div
              className="absolute -inset-6 rounded-4xl opacity-60"
              style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.3) 0%, rgba(15,23,42,0.8) 100%)', filter: 'blur(20px)' }} />
            

            {/* Photo container */}
            <div className="relative rounded-4xl overflow-hidden border border-emerald-mid/20 shadow-emerald-lg">
              {/* Scan line */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-4xl">
                <div className="hero-scan-line w-full h-28 absolute top-0 left-0 opacity-60" />
                <div className="absolute inset-0 border border-emerald-mid/10 rounded-4xl" />
              </div>

              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1928a315b-1773093144051.png"
                alt="Portrait of a professional man in formal attire, warm indoor lighting, dark neutral background"
                width={480}
                height={600}
                priority
                className="w-full h-[420px] sm:h-[520px] object-cover hero-photo-treatment" />
              

              {/* Corner markers */}
              <div className="absolute top-5 right-5 w-8 h-8 corner-tl" />
              <div className="absolute bottom-5 left-5 w-8 h-8 corner-br" />

              {/* Gradient scrim bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.7), transparent)' }} />
              
            </div>

            {/* Floating badge 1 — Independence */}
            <div className="animate-float-badge absolute -top-4 -left-4 sm:-left-8 glass-card border border-emerald-mid/20 rounded-2xl px-4 py-3 shadow-emerald-md z-30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-pale flex items-center justify-center">
                  <Icon name="ShieldCheckIcon" variant="solid" size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight">100% Independen</p>
                  <p className="text-[10px] text-muted-foreground">Tanpa Partai Politik</p>
                </div>
              </div>
            </div>

            {/* Floating badge 2 — Trust */}
            <div className="animate-float-badge-delay absolute -bottom-4 -right-4 sm:-right-8 glass-card border border-border rounded-2xl px-4 py-3 shadow-navy-md z-30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-light flex items-center justify-center">
                  <Icon name="MapPinIcon" variant="solid" size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight">33 Kab/Kota</p>
                  <p className="text-[10px] text-muted-foreground">Sumatera Utara</p>
                </div>
              </div>
            </div>

            {/* Floating badge 3 — Program count */}
            <div className="animate-float-badge absolute top-1/2 -right-3 sm:-right-10 glass-card border border-border rounded-2xl px-3 py-2 shadow-navy-md z-30 hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-pale flex items-center justify-center">
                  <Icon name="StarIcon" variant="solid" size={14} className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Top Caleg</p>
                  <p className="text-[10px] text-muted-foreground">Pilihan Rakyat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Gulir ke bawah</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div
            className="w-1 h-2 rounded-full bg-emerald-mid"
            style={{ animation: 'float-badge 1.8s ease-in-out infinite' }} />
          
        </div>
      </div>
    </section>);

}