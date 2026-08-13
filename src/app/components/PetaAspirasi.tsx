'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface District {
  id: string;
  name: string;
  type: 'kota' | 'kabupaten';
  issues: string[];
  programs: string[];
  population: string;
  region: string;
}

const districts: District[] = [
  { id: 'medan', name: 'Kota Medan', type: 'kota', issues: ['Kemacetan & transportasi publik', 'Banjir musiman', 'UMKM informal belum terdigitalisasi'], programs: ['Advokasi dana MRT/BRT Medan', 'Normalisasi sungai lintas kota', 'Platform digital UMKM Kota Medan'], population: '2,4 Juta', region: 'Pesisir Timur' },
  { id: 'deliserdang', name: 'Deli Serdang', type: 'kabupaten', issues: ['Konektivitas desa-kota masih lemah', 'Lahan pertanian terancam alih fungsi', 'Akses BPJS kesehatan di desa'], programs: ['Jalan kabupaten prioritas nasional', 'Perlindungan lahan pangan strategis', 'Puskesmas pembantu 24 jam'], population: '2,1 Juta', region: 'Pesisir Timur' },
  { id: 'langkat', name: 'Langkat', type: 'kabupaten', issues: ['Infrastruktur jalan pedalaman rusak', 'Petani kelapa sawit belum sejahtera', 'Sekolah di perbatasan kekurangan guru'], programs: ['Dana alokasi khusus jalan pedalaman', 'Koperasi petani sawit digital', 'Guru honorer prioritas daerah 3T'], population: '1,1 Juta', region: 'Pesisir Timur' },
  { id: 'karo', name: 'Karo', type: 'kabupaten', issues: ['Dampak erupsi Sinabung belum pulih', 'Harga hasil pertanian fluktuatif', 'Pariwisata belum berkembang optimal'], programs: ['Dana rehabilitasi pasca bencana', 'Pasar komoditas digital Karo', 'Pengembangan wisata Berastagi-Sinabung'], population: '420 Ribu', region: 'Dataran Tinggi' },
  { id: 'simalungun', name: 'Simalungun', type: 'kabupaten', issues: ['Jalan lintas Simalungun-Danau Toba rusak', 'Budaya Simalungun kurang dipromosikan', 'Petani kopi butuh akses pasar'], programs: ['Perbaikan jalan wisata Danau Toba', 'Festival budaya Simalungun nasional', 'Ekspor kopi Simalungun langsung'], population: '870 Ribu', region: 'Dataran Tinggi' },
  { id: 'samosir', name: 'Samosir', type: 'kabupaten', issues: ['Aksesibilitas pulau masih terbatas', 'Pemuda lokal migrasi ke kota', 'Pariwisata Danau Toba belum maksimal'], programs: ['Subsidi kapal feri lintas Danau Toba', 'Program wirausaha muda Samosir', 'Dana pengembangan destinasi Danau Toba'], population: '130 Ribu', region: 'Kawasan Danau Toba' },
  { id: 'tobasa', name: 'Toba', type: 'kabupaten', issues: ['Infrastruktur menuju Danau Toba kurang', 'Hak adat tanah Batak Toba', 'Layanan kesehatan spesialis minim'], programs: ['Jalan akses wisata prioritas', 'Advokasi hak ulayat tanah adat', 'Rumah sakit rujukan regional'], population: '180 Ribu', region: 'Kawasan Danau Toba' },
  { id: 'dairi', name: 'Dairi', type: 'kabupaten', issues: ['Tambang mengancam lingkungan hidup', 'Petani kopi Sidikalang butuh dukungan', 'Infrastruktur jalan menuju Aceh'], programs: ['Advokasi AMDAL tambang ketat', 'Sertifikasi kopi Sidikalang internasional', 'Jalan lintas Dairi-Aceh prioritas'], population: '280 Ribu', region: 'Dataran Tinggi' },
  { id: 'nias', name: 'Nias', type: 'kabupaten', issues: ['Infrastruktur kepulauan sangat terbatas', 'Tingkat kemiskinan masih tinggi', 'Potensi wisata budaya belum dikembangkan'], programs: ['Dana otonomi khusus kepulauan', 'Program entaskan kemiskinan ekstrem', 'Promosi budaya megalitik Nias nasional'], population: '150 Ribu', region: 'Kepulauan Nias' },
  { id: 'niasselatan', name: 'Nias Selatan', type: 'kabupaten', issues: ['Daerah tertinggal & terisolir', 'Surfing Nias belum dioptimalkan', 'Fasilitas kesehatan sangat minim'], programs: ['Dana daerah tertinggal prioritas', 'Pengembangan wisata surfing kelas dunia', 'Puskesmas keliling kepulauan'], population: '340 Ribu', region: 'Kepulauan Nias' },
  { id: 'asahan', name: 'Asahan', type: 'kabupaten', issues: ['Industri lokal bersaing ketat', 'Sungai Asahan tercemar industri', 'Tenaga kerja lokal kalah bersaing'], programs: ['Insentif industri padat karya lokal', 'Penanganan pencemaran sungai', 'Pelatihan vokasi industri'], population: '720 Ribu', region: 'Pesisir Timur' },
  { id: 'batubara', name: 'Batu Bara', type: 'kabupaten', issues: ['Nelayan kecil belum sejahtera', 'Abrasi pantai mengancam pemukiman', 'Akses modal nelayan sangat terbatas'], programs: ['Koperasi nelayan digital Batu Bara', 'Tanggul penahan abrasi pantai', 'KUR khusus nelayan tradisional'], population: '410 Ribu', region: 'Pesisir Timur' },
];

export default function PetaAspirasi() {
  const [selected, setSelected] = useState<District>(districts[0]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filtered = districts.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const regionGroups = Array.from(new Set(filtered.map((d) => d.region)));

  return (
    <section id="peta" className="py-20 px-4 sm:px-6 bg-navy-dark relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-tech opacity-50 pointer-events-none" />
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-mid/30 bg-emerald-mid/10">
            <Icon name="MapPinIcon" variant="solid" size={14} className="text-emerald-mid" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-mid">Peta Aspirasi</span>
          </div>
          <h2 className="text-display font-extrabold text-white">
            33 Kabupaten/Kota{' '}
            <span className="text-gradient-emerald">Sumatera Utara</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-white/50 leading-relaxed">
            Pilih daerah Anda untuk melihat masalah utama yang diinventarisasi dan program solusi
            yang diperjuangkan bagi daerah Anda.
          </p>
        </div>

        {/* Main layout: District list + Detail panel */}
        <div
          className={`grid lg:grid-cols-5 gap-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Left: District selector (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" variant="outline" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Cari kabupaten/kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:border-emerald-mid/50 transition-colors"
              />
            </div>

            {/* District list */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
              {regionGroups.map((region) => (
                <div key={region}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 mb-2">{region}</p>
                  <div className="space-y-1">
                    {filtered.filter((d) => d.region === region).map((district) => (
                      <button
                        key={district.id}
                        onClick={() => setSelected(district)}
                        className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 min-h-[44px] ${
                          selected.id === district.id
                            ? 'bg-secondary text-white shadow-emerald-sm'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              selected.id === district.id
                                ? 'bg-white/20 text-white'
                                : district.type === 'kota' ?'bg-emerald-mid/20 text-emerald-mid' :'bg-white/10 text-white/50'
                            }`}
                          >
                            {district.type === 'kota' ? 'Kota' : 'Kab'}
                          </span>
                          <span className="text-sm font-semibold">{district.name}</span>
                        </div>
                        <Icon name="ChevronRightIcon" variant="outline" size={14} className="flex-shrink-0 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail panel (3 cols) */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            {/* District header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-mid bg-emerald-mid/10 px-3 py-1 rounded-full">
                      {selected.region}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40 bg-white/10 px-3 py-1 rounded-full">
                      {selected.type === 'kota' ? 'Kota' : 'Kabupaten'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">{selected.name}</h3>
                  <p className="text-sm text-white/50 mt-1">Populasi: {selected.population}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-mid/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPinIcon" variant="solid" size={24} className="text-emerald-mid" />
                </div>
              </div>

              {/* Issues */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <Icon name="ExclamationTriangleIcon" variant="solid" size={12} className="text-accent" />
                  Masalah Utama Diinventarisasi
                </h4>
                {selected.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/70 leading-relaxed">{issue}</span>
                  </div>
                ))}
              </div>

              {/* Programs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-mid flex items-center gap-2">
                  <Icon name="CheckCircleIcon" variant="solid" size={12} className="text-emerald-mid" />
                  Program Solusi Diperjuangkan
                </h4>
                {selected.programs.map((prog, i) => (
                  <div key={i} className="flex items-start gap-3 bg-emerald-mid/10 border border-emerald-mid/20 rounded-xl px-4 py-3">
                    <Icon name="ArrowRightCircleIcon" variant="solid" size={16} className="text-emerald-mid flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80 leading-relaxed">{prog}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => document.querySelector('#aspirasi')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-pill w-full bg-secondary text-white py-4 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark flex items-center justify-center gap-2"
            >
              <Icon name="ChatBubbleLeftRightIcon" variant="outline" size={16} className="text-white" />
              Sampaikan Aspirasi dari {selected.name}
            </button>
          </div>
        </div>

        {/* Note: Only 12 sample districts shown */}
        <p className="text-center text-xs text-white/30 mt-6">
          Menampilkan 12 dari 33 Kabupaten/Kota · Semua daerah terwakili dalam basis data aspirasi
        </p>
      </div>
    </section>
  );
}