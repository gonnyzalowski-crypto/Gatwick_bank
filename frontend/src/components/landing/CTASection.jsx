import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const CTASection = () => {
  const benefits = [
    'Open account in 5 minutes',
    'No monthly fees or hidden charges',
    'Bank-grade security & encryption',
    'Instant global transfers',
    'Crypto wallet included',
    '24/7 customer support'
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Join 50,000+ users who've already made the switch to smarter, faster, and more secure banking.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"
            >
              <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/register"
            className="group px-10 py-5 bg-white text-purple-700 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            Open Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/login"
            className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        <p className="text-center text-purple-200 text-sm mt-8">
          No credit card required • Free forever • Cancel anytime
        </p>
      </div>
    </section>
  );
};
