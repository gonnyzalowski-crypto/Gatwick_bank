import React from 'react';
import { Shield, Lock, CheckCircle2, Clock } from 'lucide-react';

export const TrustBadges = () => {
  const badges = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: '256-bit Encryption',
      description: 'Military-grade encryption protects all your data'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Two-Factor Auth',
      description: 'Extra layer of security for your account'
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'FDIC Insured',
      description: 'Your deposits are protected up to $250,000'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Monitoring',
      description: 'Real-time fraud detection and prevention'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Security is Our <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">Priority</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bank-grade security measures protect your money and data 24/7
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-purple-700 mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
