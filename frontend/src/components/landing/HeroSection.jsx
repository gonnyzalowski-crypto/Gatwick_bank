import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, ChevronDown, Globe, CreditCard, BarChart3 } from 'lucide-react';

export const HeroSection = () => {
  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '$2.5B+', label: 'Transactions Processed' },
    { value: '150+', label: 'Countries Supported' },
    { value: '99.9%', label: 'Uptime Guarantee' }
  ];

  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image with Blue Tint and Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero.jpg" 
          alt="Hero background"
          className="w-full h-full object-cover opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-blue-600/25"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-purple-50/80 to-white/90"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
              <Shield className="w-4 h-4 text-purple-800" />
              <span className="text-sm font-semibold text-purple-800">Trusted by 50,000+ users worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 bg-clip-text text-transparent">
                Banking Reimagined
              </span>
              <br />
              <span className="text-gray-900">for the Digital Age</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Experience the future of finance with instant transfers, crypto integration, and bank-grade security. 
              All in one beautifully designed platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="group px-8 py-4 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Open Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-white border-2 border-purple-300 text-purple-800 rounded-xl font-semibold hover:border-purple-300 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                Explore Features
                <ChevronDown className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

const DashboardPreview = () => (
  <div className="relative max-w-md mx-auto lg:max-w-lg">
    {/* Decorative Elements */}
    <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
    
    {/* Dashboard Mockup */}
    <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100 overflow-hidden transform scale-90 lg:scale-95">
      {/* Browser Chrome */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
        </div>
        <div className="flex-1 bg-white/20 rounded-lg px-3 py-1 text-xs text-white/80">
          gatwickbank.up.railway.app
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="text-sm opacity-90 mb-2">Total Balance</div>
          <div className="text-4xl font-bold mb-4">$24,580.00</div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
              <div className="opacity-80 text-xs">Available</div>
              <div className="font-semibold">$24,580.00</div>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
              <div className="opacity-80 text-xs">Pending</div>
              <div className="font-semibold">$0.00</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <ArrowRight className="w-5 h-5" />, label: 'Send' },
            { icon: <CreditCard className="w-5 h-5" />, label: 'Cards' },
            { icon: <Globe className="w-5 h-5" />, label: 'Crypto' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' }
          ].map((action, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-3 text-center hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="text-purple-800 flex justify-center mb-1">{action.icon}</div>
              <div className="text-xs text-gray-700 font-medium">{action.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</div>
          {[
            { name: 'Netflix Subscription', amount: '-$15.99', time: '2 hours ago', type: 'debit' },
            { name: 'Salary Deposit', amount: '+$3,500.00', time: 'Yesterday', type: 'credit' },
            { name: 'Amazon Purchase', amount: '-$89.99', time: '2 days ago', type: 'debit' }
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <ArrowRight className={`w-5 h-5 ${
                    tx.type === 'credit' ? 'text-green-600 rotate-180' : 'text-purple-800'
                  }`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{tx.name}</div>
                  <div className="text-xs text-gray-500">{tx.time}</div>
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
