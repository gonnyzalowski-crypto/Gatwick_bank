import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Globe, CreditCard, BarChart3, Send, Wallet, Lock, CheckCircle } from 'lucide-react';

export const HeroSection = () => {
  // Bank logos for trust section
  const bankLogos = [
    { name: 'HSBC', abbr: 'HSBC' },
    { name: 'Barclays', abbr: 'BARC' },
    { name: 'Deutsche Bank', abbr: 'DB' },
    { name: 'JPMorgan', abbr: 'JPM' },
    { name: 'BNP Paribas', abbr: 'BNP' },
  ];

  return (
    <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-white">
      {/* Subtle background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
              <Lock className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-medium text-purple-800">Bank-Grade Security</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
              Cross-Border{' '}
              <span className="text-purple-700">Banking</span>{' '}
              for Global Businesses & Creators
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Receive payments in 150+ countries, manage multi-currency accounts, and transfer money globally with enterprise-grade security and compliance.
            </p>

            {/* Benefits list */}
            <div className="space-y-3">
              {[
                'Instant international transfers',
                'Multi-currency accounts (USD, EUR, GBP, more)',
                'Full KYC/AML compliance'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                to="/register" 
                className="group px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
              >
                Open Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#how-it-works" 
                className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-purple-300 text-gray-700 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-purple-50"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Section */}
            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Trusted by 50,000+ professionals worldwide</p>
              <div className="flex items-center gap-6">
                {bankLogos.map((bank, i) => (
                  <div key={i} className="text-gray-400 font-bold text-sm tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                    {bank.abbr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
};

const PhoneMockup = () => (
  <div className="relative mx-auto max-w-sm lg:max-w-md">
    {/* Glow effect behind phone */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl scale-110"></div>
    
    {/* Phone Frame */}
    <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
      {/* Phone notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
      
      {/* Screen */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden">
        {/* Status bar */}
        <div className="bg-purple-700 px-6 py-3 flex justify-between items-center text-white text-xs">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="p-5 space-y-5">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-purple-200 text-sm">Total Balance</span>
              <Shield className="w-4 h-4 text-purple-200" />
            </div>
            <div className="text-3xl font-bold mb-4">$24,580.00</div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
                <div className="text-purple-200 text-xs">USD</div>
                <div className="font-semibold text-sm">$18,450.00</div>
              </div>
              <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
                <div className="text-purple-200 text-xs">EUR</div>
                <div className="font-semibold text-sm">5,230.00</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Send className="w-5 h-5" />, label: 'Send' },
              { icon: <Wallet className="w-5 h-5" />, label: 'Receive' },
              { icon: <CreditCard className="w-5 h-5" />, label: 'Cards' },
              { icon: <Globe className="w-5 h-5" />, label: 'Exchange' }
            ].map((action, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-50 rounded-xl flex items-center justify-center text-purple-700 mb-1">
                  {action.icon}
                </div>
                <span className="text-xs text-gray-600">{action.label}</span>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">Recent Activity</span>
              <span className="text-sm text-purple-600">See all</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Transfer to UK', amount: '-2,500.00', currency: 'GBP', type: 'debit' },
                { name: 'Payment Received', amount: '+3,500.00', currency: 'USD', type: 'credit' },
                { name: 'Card Purchase', amount: '-89.99', currency: 'EUR', type: 'debit' }
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <ArrowRight className={`w-4 h-4 ${
                        tx.type === 'credit' ? 'text-green-600 rotate-[135deg]' : 'text-gray-600 -rotate-45'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tx.name}</div>
                      <div className="text-xs text-gray-500">{tx.currency}</div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating cards */}
    <div className="absolute -right-4 top-20 bg-white rounded-xl p-3 shadow-xl border border-gray-100 animate-float">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs text-gray-500">Transfer Complete</div>
          <div className="text-sm font-semibold text-gray-900">+$3,500.00</div>
        </div>
      </div>
    </div>

    <div className="absolute -left-4 bottom-32 bg-white rounded-xl p-3 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Globe className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <div className="text-xs text-gray-500">150+ Countries</div>
          <div className="text-sm font-semibold text-gray-900">Supported</div>
        </div>
      </div>
    </div>
  </div>
);
