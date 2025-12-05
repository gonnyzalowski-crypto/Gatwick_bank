import React from 'react';
import { Globe, ArrowLeftRight, Wallet, CreditCard, RefreshCw, Shield, Landmark } from 'lucide-react';

export const TrustBadges = () => {
  const networks = [
    { name: 'SWIFT', desc: 'Global Wires', icon: Globe },
    { name: 'SEPA', desc: 'Eurozone', icon: Landmark },
    { name: 'ACH', desc: 'US Clearing', icon: RefreshCw },
    { name: 'Faster Payments', desc: 'UK Instant', icon: ArrowLeftRight },
    { name: 'Visa / Mastercard', desc: 'Global Cards', icon: CreditCard },
    { name: 'FDIC Insured', desc: 'Protection', icon: Shield },
  ];

  return (
    <section className="py-12 border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {networks.map((net, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <net.icon className="w-5 h-5 text-slate-500 group-hover:text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-slate-700 text-sm leading-none">{net.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{net.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
