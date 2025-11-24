import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, ArrowRight } from 'lucide-react';

export const ComparisonSection = () => {
  const comparisonFeatures = [
    { feature: 'Account Opening Time', traditional: '5-7 days', gatwick: '5 minutes' },
    { feature: 'International Transfers', traditional: '3-5 business days', gatwick: 'Instant' },
    { feature: 'Monthly Fees', traditional: '$12-25', gatwick: '$0' },
    { feature: 'Crypto Support', traditional: 'Not available', gatwick: 'BTC, ETH, USDT' },
    { feature: '24/7 Support', traditional: 'Limited hours', gatwick: 'Always available' },
    { feature: 'Mobile App', traditional: 'Basic features', gatwick: 'Full-featured' }
  ];

  return (
    <section id="compare" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Gatwick Bank</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we compare to traditional banks
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <div className="font-bold text-lg">Feature</div>
            <div className="font-bold text-lg text-center">Traditional Banks</div>
            <div className="font-bold text-lg text-center">Gatwick Bank</div>
          </div>

          {/* Table Rows */}
          {comparisonFeatures.map((item, index) => (
            <div 
              key={index}
              className={`grid grid-cols-3 p-6 items-center ${
                index % 2 === 0 ? 'bg-purple-50/50' : 'bg-white'
              }`}
            >
              <div className="font-semibold text-gray-900">{item.feature}</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <Minus className="w-4 h-4 text-red-500" />
                  {item.traditional}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold">
                  <Check className="w-5 h-5 text-green-500" />
                  {item.gatwick}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Start Your Journey Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
