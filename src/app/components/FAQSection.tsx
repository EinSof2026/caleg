'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FAQItem {
  question: string;
  answer: string;
}

// Link bot Telegram AI. Nilai asli diambil dari .env.local (NEXT_PUBLIC_TELEGRAM_BOT_URL).
const TELEGRAM_BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/GANTI_DENGAN_USERNAME_BOT';

const faqs: FAQItem[] = [
  {
    question: 'Mengapa memilih jalur DPD RI, bukan DPR atau partai politik?',
    answer: 'DPD RI adalah lembaga yang khusus mewakili daerah di tingkat nasional, bukan mewakili kepentingan partai. Dengan jalur independen DPD, saya bebas dari tekanan dan agenda partai sehingga 100% fokus memperjuangkan aspirasi 33 Kabupaten/Kota Sumatera Utara tanpa kompromi politik.',
  },
  {
    question: 'Bagaimana menjaga independensi di tengah tekanan politik nasional?',
    answer: 'Independensi dijaga melalui transparansi penuh kepada konstituen, tidak menerima dana dari korporasi atau kelompok kepentingan, dan membangun basis dukungan langsung dari rakyat Sumut. Setiap keputusan di Senayan akan dikonsultasikan terlebih dahulu dengan forum aspirasi daerah.',
  },
  {
    question: 'Apa kewenangan nyata anggota DPD RI yang bisa dirasakan masyarakat?',
    answer: 'Anggota DPD RI memiliki kewenangan mengajukan RUU terkait otonomi daerah, hubungan pusat-daerah, pembentukan dan pemekaran daerah, pengelolaan SDA, serta memberikan pertimbangan atas RAPBN. Kami juga mengawasi pelaksanaan UU yang berdampak langsung pada daerah.',
  },
  {
    question: 'Bagaimana aspirasi warga yang dikirim melalui website ini ditindaklanjuti?',
    answer: 'Setiap aspirasi masuk diverifikasi tim, dikelompokkan per daerah dan kategori, lalu dikompilasi menjadi dokumen kebijakan yang dibawa ke rapat DPD RI, kementerian terkait, dan sidang paripurna. Pengirim dapat bercakap dengan AI asisten kami di Telegram untuk konfirmasi dan update perkembangan tindak lanjutnya.',
  },
  {
    question: 'Bagaimana cara bergabung sebagai relawan dan apa yang akan dilakukan?',
    answer: 'Daftar melalui formulir Gabung Relawan di website ini. Relawan bertugas menjadi jembatan aspirasi di tingkat RT/RW, kecamatan, dan kabupaten — mengumpulkan masukan warga, menyebarkan informasi program, dan mendukung kegiatan sosialisasi di daerah masing-masing.',
  },
  {
    question: 'Apa komitmen konkret untuk daerah terpencil seperti Nias dan Kepulauan?',
    answer: 'Nias dan kepulauan mendapat prioritas khusus sebagai daerah tertinggal. Program konkret meliputi advokasi dana otonomi khusus kepulauan, subsidi kapal feri, pembangunan puskesmas keliling, dan pengembangan potensi wisata surfing Nias sebagai destinasi kelas dunia.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-background">
      <div ref={ref} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-pale border border-emerald-mid/20">
            <Icon name="QuestionMarkCircleIcon" variant="solid" size={14} className="text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Pojok Transparansi</span>
          </div>
          <h2 className="text-display font-extrabold text-foreground">
            Pertanyaan yang{' '}
            <span className="text-gradient-emerald">Sering Diajukan</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed">
            Kami menjawab pertanyaan kritis pemilih dengan jujur dan transparan.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-card border rounded-3xl overflow-hidden transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } ${openIndex === i ? 'border-emerald-mid/40 shadow-emerald-sm' : 'border-border hover:border-emerald-mid/30'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none min-h-[64px]"
              >
                <span className="text-base font-bold text-foreground leading-snug pr-2">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openIndex === i ? 'bg-secondary rotate-45' : 'bg-surface-container'
                  }`}
                >
                  <Icon
                    name="PlusIcon"
                    variant="outline"
                    size={16}
                    className={`transition-colors duration-300 ${openIndex === i ? 'text-white' : 'text-foreground'}`}
                  />
                </div>
              </button>

              <div className={`faq-content ${openIndex === i ? 'open' : ''}`}>
                <div className="px-6 pb-6">
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center bg-navy-dark rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(5,150,105,0.15) 0%, transparent 70%)' }}
          />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-mid/20 flex items-center justify-center mx-auto">
              <Icon name="ChatBubbleLeftRightIcon" variant="solid" size={24} className="text-emerald-mid" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Masih ada pertanyaan?</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto">
              Bincang dengan AI asisten kami di Telegram atau sampaikan aspirasi Anda.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill bg-secondary text-white px-6 py-3 text-sm font-bold shadow-emerald-sm hover:bg-emerald-dark flex items-center gap-2"
              >
                <Icon name="ChatBubbleOvalLeftIcon" variant="solid" size={16} className="text-white" />
                Hubungi AI Asisten
              </a>
              <button
                onClick={() => document.querySelector('#aspirasi')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-pill border border-white/20 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 flex items-center gap-2"
              >
                <Icon name="PaperAirplaneIcon" variant="outline" size={16} className="text-white" />
                Titip Aspirasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}