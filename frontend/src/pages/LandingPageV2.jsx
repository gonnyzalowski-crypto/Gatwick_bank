import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustBadges } from '../components/landing/TrustBadges';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { NewsSection } from '../components/landing/NewsSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';
import { Navigation } from '../components/landing/Navigation';

export const LandingPageV2 = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Navigation />
      <HeroSection />
      <TrustBadges />
      <FeaturesSection activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
      <TestimonialsSection />
      <ComparisonSection />
      <NewsSection />
      <CTASection />
      <Footer />
    </div>
  );
};
