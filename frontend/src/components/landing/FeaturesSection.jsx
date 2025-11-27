import React from 'react';
import { Wallet, CreditCard, RefreshCw, Shield, Globe, Send, Clock, CheckCircle } from 'lucide-react';

export const FeaturesSection = ({ activeFeature, setActiveFeature }) => {
  const features = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Create global wallet in minutes',
      description: 'Open multi-currency accounts instantly. Hold, send, and receive in USD, EUR, GBP, and 50+ currencies.',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Receive payments on time, every time',
      description: 'Get paid from clients worldwide with local bank details in major markets. No delays, no hassle.',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Shop and pay with multi-currency cards',
      description: 'Virtual and physical cards that work everywhere. Spend in any currency with real exchange rates.',
      color: 'bg-green-100 text-green-700'
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Convert money at the best rates',
      description: 'Exchange between currencies at mid-market rates. Save up to 8x compared to traditional banks.',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Security you can bank on',
      description: 'Bank-grade encryption, 2FA, biometric login, and 24/7 fraud monitoring protect your money.',
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Smarter Way to <span className="text-purple-700">Get Paid</span> and Spend Globally
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage money across borders in one platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Ready to get started?
              </h3>
              <p className="text-purple-100 mb-6">
                Join 50,000+ professionals managing their global finances with Gatwick Bank.
              </p>
            </div>
            <a 
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
            >
              Open Free Account
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
