'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface TimelineItem {
  year: string;
  category: string;
  title: string;
  description: string;
  icon: string;
}

const timelineData: TimelineItem[] = [
{
  year: '1985',
  category: 'Kelahiran',
  title: 'Lahir di Medan, Sumatera Utara',
  description: 'Tumbuh dalam keluarga sederhana di Kota Medan, memahami kehidupan rakyat Sumut sejak dini.',
  icon: 'HomeIcon'
},
{
  year: '2003',
  category: 'Pendidikan',
  title: 'S1 Hukum — Universitas Sumatera Utara',
  description: 'Lulus dengan predikat cum laude, aktif sebagai Ketua Senat Mahasiswa USU dan advokat mahasiswa.',
  icon: 'AcademicCapIcon'
},
{
  year: '2007',
  category: 'Organisasi',
  title: 'Direktur Lembaga Bantuan Hukum Sumut',
  description: 'Mendirikan dan memimpin LBH yang memberikan layanan hukum gratis bagi masyarakat kurang mampu di 8 kabupaten.',
  icon: 'ScaleIcon'
},
{
  year: '2010',
  category: 'Pengabdian',
  title: 'Program Beasiswa Desa Terpencil',
  description: 'Meluncurkan program beasiswa yang telah mengirim 247 putra/putri desa terpencil Sumut ke perguruan tinggi.',
  icon: 'StarIcon'
},
{
  year: '2015',
  category: 'Pengabdian',
  title: 'Koordinator Forum Kerukunan Antar-Suku Sumut',
  description: 'Menginisiasi forum dialog lintas suku dan agama yang kini aktif di 18 kabupaten/kota Sumatera Utara.',
  icon: 'UsersIcon'
},
{
  year: '2019',
  category: 'Advokasi',
  title: 'Advokat Hak-Hak Adat Tanah Batak & Nias',
  description: 'Berhasil memenangkan 3 kasus besar hak ulayat tanah adat komunitas Batak dan Nias di Mahkamah Agung.',
  icon: 'MapPinIcon'
},
{
  year: '2024',
  category: 'Misi',
  title: 'Deklarasi Caleg DPD RI Sumut 2029',
  description: 'Mendeklarasikan pencalonan sebagai Anggota DPD RI Dapil Sumatera Utara untuk memperjuangkan aspirasi 33 kab/kota.',
  icon: 'MegaphoneIcon'
}];


const categories = ['Semua', 'Pendidikan', 'Organisasi', 'Pengabdian', 'Advokasi', 'Misi'];

export default function BiografiTimeline() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {if (entry.isIntersecting) {setVisible(true);observer.disconnect();}},
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const filtered = activeCategory === 'Semua' ?
  timelineData :
  timelineData.filter((t) => t.category === activeCategory);

  return (
    <section id="profil" className="py-20 px-4 sm:px-6 tonal-surface">
      <div className="max-w-7xl mx-auto">
        {/* Layout: Asymmetric 60/40 */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* Left: Bio card (2 cols) */}
          <div
            className={`lg:col-span-2 space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            
            {/* Profile photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-emerald-md">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_12fc6cbe7-1772369417485.png"
                alt="Professional man in formal suit, confident pose, bright well-lit office background"
                width={480}
                height={560}
                className="w-full h-72 sm:h-96 object-cover object-top" />
              
              <div
                className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
              
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-extrabold text-xl leading-tight">Ir. Ahmad Syahputra, S.H., M.H.</p>
                <p className="text-emerald-mid text-sm font-semibold mt-1">Calon Anggota DPD RI · Dapil Sumut</p>
              </div>
            </div>

            {/* Bio summary */}
            <div className="bg-card rounded-3xl p-6 border border-border space-y-4">
              <h3 className="font-extrabold text-foreground text-lg">Ringkasan Profil</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Putra asli Sumatera Utara dengan pengalaman 15+ tahun di bidang advokasi hukum,
                pemberdayaan masyarakat, dan kerukunan antar-suku. Menikah dengan 2 anak, berdomisili di Medan.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                { label: 'Pendidikan', value: 'S2 Hukum USU' },
                { label: 'Domisili', value: 'Medan, Sumut' },
                { label: 'Agama', value: 'Islam' },
                { label: 'Suku', value: 'Mandailing' }].
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
            ref={ref}
            className={`lg:col-span-3 space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '150ms' }}>
            
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-pale border border-emerald-mid/20 mb-4">
                <Icon name="ClockIcon" variant="outline" size={14} className="text-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Rekam Jejak</span>
              </div>
              <h2 className="text-display font-extrabold text-foreground">
                Perjalanan & <span className="text-gradient-emerald">Pengabdian</span>
              </h2>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) =>
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCategory === cat ?
                'bg-secondary text-white shadow-emerald-sm' :
                'bg-card border border-border text-muted-foreground hover:border-secondary hover:text-secondary'}`
                }>
                
                  {cat}
                </button>
              )}
            </div>

            {/* Timeline items */}
            <div className="relative space-y-0">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line rounded-full" />

              {filtered.map((item, i) =>
              <div
                key={`${item.year}-${i}`}
                className={`relative pl-16 pb-8 cursor-pointer group transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
                }
                style={{ transitionDelay: `${200 + i * 80}ms` }}
                onClick={() => setActiveItem(activeItem === i ? null : i)}>
                
                  {/* Dot */}
                  <div
                  className={`absolute left-3.5 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  activeItem === i ?
                  'bg-secondary border-secondary scale-125' : 'bg-card border-emerald-mid group-hover:bg-emerald-pale group-hover:scale-110'}`
                  }>
                  
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeItem === i ? 'bg-white' : 'bg-emerald-mid'}`} />
                  </div>

                  {/* Content card */}
                  <div
                  className={`bg-card border rounded-2xl p-5 transition-all duration-300 ${
                  activeItem === i ?
                  'border-emerald-mid shadow-emerald-sm' :
                  'border-border hover:border-emerald-mid/50'}`
                  }>
                  
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-secondary bg-emerald-pale px-2 py-0.5 rounded-full">
                            {item.year}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-foreground text-base leading-tight">{item.title}</h4>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${activeItem === i ? 'bg-emerald-pale' : 'bg-surface-container'}`}>
                        <Icon name={item.icon as 'HomeIcon'} variant="outline" size={16} className="text-secondary" />
                      </div>
                    </div>

                    {/* Expandable description */}
                    {activeItem === i &&
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                        {item.description}
                      </p>
                  }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}