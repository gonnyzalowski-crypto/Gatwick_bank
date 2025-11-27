import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Small Business Owner',
      avatar: 'SM',
      rating: 5,
      text: 'Gatwick Bank transformed how I manage my business finances. The instant transfers and intuitive dashboard save me hours every week.',
      company: 'Mitchell & Co.'
    },
    {
      name: 'James Rodriguez',
      role: 'Freelance Designer',
      avatar: 'JR',
      rating: 5,
      text: 'Finally, a bank that understands digital professionals. The crypto wallet integration and international transfers are seamless.',
      company: 'Rodriguez Design Studio'
    },
    {
      name: 'Emily Chen',
      role: 'Tech Entrepreneur',
      avatar: 'EC',
      rating: 5,
      text: 'Security and speed in one platform. Gatwick Bank is the only financial partner my startup needs. Highly recommended!',
      company: 'TechVenture Inc.'
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What They Say <span className="text-purple-700">About Gatwick</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers worldwide
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
