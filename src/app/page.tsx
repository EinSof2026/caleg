import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import StatsBar from '@/app/components/StatsBar';
import FokusPerjuangan from '@/app/components/FokusPerjuangan';
import BiografiTimeline from '@/app/components/BiografiTimeline';
import PetaAspirasi from '@/app/components/PetaAspirasi';
import AspirasiForm from '@/app/components/AspirasiForm';
import FAQSection from '@/app/components/FAQSection';
import AdminHashRedirect from '@/app/components/AdminHashRedirect';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <AdminHashRedirect />
      <Header />
      <HeroSection />
      <StatsBar />
      <FokusPerjuangan />
      <BiografiTimeline />
      <PetaAspirasi />
      <AspirasiForm />
      <FAQSection />
      <Footer />
    </main>
  );
}