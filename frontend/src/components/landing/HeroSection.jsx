import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Globe, CreditCard, Send, Wallet, Lock, CheckCircle, Zap, TrendingUp, Users, Sparkles } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-violet-900"></div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/30 via-transparent to-transparent"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Next-Gen Digital Banking</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-xs font-bold text-white">NEW</span>
            </div>
            
            {/* Headline with gradient text */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
              <span className="text-white">Banking</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Reimagined
              </span>
              <br />
              <span className="text-white">For Tomorrow</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-purple-200/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Experience seamless global transactions, instant multi-currency accounts, and enterprise security—all in one powerful platform.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 py-4">
              {[
                { value: '150+', label: 'Countries', icon: Globe },
                { value: '$2.5B+', label: 'Processed', icon: TrendingUp },
                { value: '50K+', label: 'Users', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm text-purple-300/70">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link 
                to="/register" 
                className="group relative px-8 py-4 bg-white text-purple-900 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/20"
              >
                <Lock className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-6">
              {[
                { icon: Shield, text: '256-bit SSL' },
                { icon: Zap, text: 'Instant Transfers' },
                { icon: CheckCircle, text: 'FDIC Insured' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <badge.icon className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/70">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative hidden lg:block">
            <DashboardPreview />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

const DashboardPreview = () => (
  <div className="relative">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-3xl blur-3xl scale-95"></div>
    
    {/* Main dashboard card */}
    <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-1 border border-white/20 shadow-2xl">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[22px] p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Balance</p>
            <p className="text-3xl font-bold text-white">$124,580.00</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Currency cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { currency: 'USD', amount: '$84,250', flag: '🇺🇸', change: '+2.4%' },
            { currency: 'EUR', amount: '€32,100', flag: '🇪🇺', change: '+1.2%' },
            { currency: 'GBP', amount: '£8,230', flag: '🇬🇧', change: '+0.8%' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.flag}</span>
                <span className="text-slate-400 text-xs">{item.currency}</span>
              </div>
              <p className="text-white font-semibold text-sm">{item.amount}</p>
              <p className="text-green-400 text-xs">{item.change}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Send, label: 'Send', color: 'from-purple-500 to-violet-500' },
            { icon: Wallet, label: 'Receive', color: 'from-blue-500 to-cyan-500' },
            { icon: CreditCard, label: 'Cards', color: 'from-pink-500 to-rose-500' },
            { icon: Globe, label: 'Exchange', color: 'from-amber-500 to-orange-500' },
          ].map((action, i) => (
            <div key={i} className="text-center group cursor-pointer">
              <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-slate-400">{action.label}</span>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm font-medium">Recent Activity</p>
          {[
            { name: 'Netflix Subscription', amount: '-$15.99', type: 'debit', time: '2m ago' },
            { name: 'Salary Deposit', amount: '+$5,400.00', type: 'credit', time: '1h ago' },
            { name: 'Transfer to Sarah', amount: '-$250.00', type: 'debit', time: '3h ago' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-500/20' : 'bg-slate-700'
                }`}>
                  <ArrowRight className={`w-4 h-4 ${
                    tx.type === 'credit' ? 'text-green-400 rotate-[-135deg]' : 'text-slate-400 rotate-45'
                  }`} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{tx.name}</p>
                  <p className="text-slate-500 text-xs">{tx.time}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                tx.type === 'credit' ? 'text-green-400' : 'text-white'
              }`}>{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating notification cards */}
    <div className="absolute -right-4 top-16 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 animate-bounce" style={{animationDuration: '3s'}}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Payment Received</p>
          <p className="text-sm font-bold text-gray-900">+$3,500.00</p>
        </div>
      </div>
    </div>

    <div className="absolute -left-4 bottom-24 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Instant Transfer</p>
          <p className="text-sm font-bold text-gray-900">Completed</p>
        </div>
      </div>
    </div>
  </div>
);

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
