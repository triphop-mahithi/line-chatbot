import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

const HeroSection = () => {
  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-brand-green to-brand-green/80 text-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-brand-gold mix-blend-multiply"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-gold mix-blend-multiply"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-brand-green">
            คำนวณเบี้ยประกันภัย
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={scrollToCalculator}
              size="lg" 
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-green font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Calculator className="mr-2 h-5 w-5" />
              เริ่มคำนวณเลย
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
