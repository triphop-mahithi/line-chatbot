
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import InsuranceCalculator from '@/components/InsuranceCalculator';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-brand-green/5">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <InsuranceCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
