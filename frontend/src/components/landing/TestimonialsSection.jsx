import React from 'react';
import { Star } from 'lucide-react';

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
    <section id="testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1706885093476-b1e54a6b6c0f?w=1920&q=80" 
          alt="Abstract dotted background"
          className="w-full h-full object-cover opacity-5"
          loading="lazy"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Thousands</span> Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our customers have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:-translate-y-2"
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-purple-600">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
