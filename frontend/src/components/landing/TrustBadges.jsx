import React from 'react';
import { Globe, ArrowLeftRight, Wallet, CreditCard, RefreshCw, Shield } from 'lucide-react';

export const TrustBadges = () => {
  // Country flags representation
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'EU', name: 'Europe' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'IE', name: 'Ireland' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-purple-300 text-sm font-medium mb-2">Receive and spend money in</p>
          <h2 className="text-2xl md:text-3xl font-bold">90+ countries worldwide</h2>
        </div>

        {/* Flags Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {countries.map((country, i) => (
            <div 
              key={i} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 hover:bg-gray-700 transition-colors cursor-default"
              title={country.name}
            >
              {country.code}
            </div>
          ))}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
            +78
          </div>
        </div>
      </div>
    </section>
  );
};
