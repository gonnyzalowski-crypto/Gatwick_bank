import React from 'react';
import { Shield, Zap, CreditCard, BarChart3 } from 'lucide-react';

export const FeaturesSection = ({ activeFeature, setActiveFeature }) => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bank-Grade Security',
      description: 'Military-grade 256-bit encryption protects every transaction',
      gradient: 'from-purple-700 to-purple-900',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Transfers',
      description: 'Send money globally in seconds, not days',
      gradient: 'from-blue-600 to-purple-800',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Smart Cards',
      description: 'Virtual and physical cards with real-time controls',
      gradient: 'from-purple-700 to-purple-900',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Financial Insights',
      description: 'AI-powered analytics to optimize your finances',
      gradient: 'from-purple-800 to-blue-700',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
    }
  ];

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50/30 to-white overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">One Platform</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern banking needs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Feature Cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`group cursor-pointer p-6 rounded-2xl transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-purple-700 to-purple-800 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    activeFeature === index
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${feature.gradient}`
                  }`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      activeFeature === index ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={activeFeature === index ? 'text-white/90' : 'text-gray-600'}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Visualization */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-purple-100">
              {/* Feature Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="w-full h-full object-cover transition-all duration-500"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${features[activeFeature].gradient} opacity-20`}></div>
              </div>
              
              {/* Feature Info */}
              <div className="p-8 text-center">
                <div className={`inline-flex w-16 h-16 bg-gradient-to-br ${features[activeFeature].gradient} rounded-2xl items-center justify-center text-white shadow-lg mb-4`}>
                  <div className="scale-125">
                    {features[activeFeature].icon}
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {features[activeFeature].title}
                </h4>
                <p className="text-gray-600">
                  {features[activeFeature].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
