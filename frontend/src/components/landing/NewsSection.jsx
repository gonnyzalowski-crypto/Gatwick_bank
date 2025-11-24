import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

export const NewsSection = () => {
  const news = [
    { 
      date: 'Nov 2025', 
      title: 'Enhanced Security Features', 
      snippet: 'New biometric authentication and advanced fraud detection now live.',
      category: 'Security'
    },
    { 
      date: 'Oct 2025', 
      title: 'Crypto Wallet Integration', 
      snippet: 'Trade BTC, ETH, and USDT directly from your dashboard.',
      category: 'Features'
    },
    { 
      date: 'Sep 2025', 
      title: 'Instant Global Transfers', 
      snippet: 'Send money to 150+ countries in seconds with zero fees.',
      category: 'Updates'
    },
    { 
      date: 'Aug 2025', 
      title: '50,000 Users Milestone', 
      snippet: 'Thank you for trusting us with your financial future!',
      category: 'Milestone'
    }
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">Updates</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about new features and improvements
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm text-purple-700 mb-3">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{item.date}</span>
                <span className="ml-auto text-xs bg-purple-100 px-2 py-1 rounded-full">{item.category}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {item.snippet}
              </p>

              <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm group-hover:gap-3 transition-all">
                Read more
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
