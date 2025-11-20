import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Clock, Lock, CheckCircle2, Mail, Phone, MapPin, ChevronDown, Menu, X, ArrowRight, Zap, Users, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const news = [
    { id: 1, date: 'Nov 2025', title: 'New Security Features Released', snippet: 'Enhanced 2FA and biometric authentication now available for all users.' },
    { id: 2, date: 'Oct 2025', title: 'Mobile App Update', snippet: 'Redesigned interface with improved performance and new features.' },
    { id: 3, date: 'Aug 2025', title: 'Q3 Earnings: 15% Growth', snippet: 'Gatwick Bank reports strong quarterly performance with 15% year-over-year growth.' },
    { id: 4, date: 'Jun 2025', title: 'Security Patch Released', snippet: 'Critical security updates deployed across all platforms.' }
  ];

  const policies = [
    {
      title: 'Privacy Policy',
      content: 'We are committed to protecting your personal data. We comply with GDPR and all applicable data protection regulations. Your information is encrypted and stored securely.'
    },
    {
      title: 'Terms of Service',
      content: 'By using Gatwick Bank services, you agree to our terms. We provide secure banking services with industry-standard security measures and customer support.'
    },
    {
      title: 'Cookie Policy',
      content: 'We use essential cookies to provide our services and analytics cookies to improve user experience. You can manage cookie preferences in your account settings.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! We will contact you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-neutral-900">Gatwick Bank</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Home</a>
              <a href="#about" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">About</a>
              <a href="#services" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Services</a>
              <a href="#news" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">News</a>
              <a href="#contact" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Contact</a>
              <a href="#privacy" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">Privacy</a>
              <Link to="/login" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium transition-all shadow-md hover:shadow-lg">
                Sign Up
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">Home</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">About</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">Services</a>
              <a href="#news" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">News</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">Contact</a>
              <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700">Privacy</a>
              <Link to="/login" className="block w-full py-2 px-4 border-2 border-primary-600 text-primary-600 rounded-lg text-center font-medium mb-2">
                Login
              </Link>
              <Link to="/register" className="block w-full py-2 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-center font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 to-white/95"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Building2 className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-6 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Secure, Modern Banking at Your Fingertips
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands who trust Gatwick Bank with their finances. Instant transfers, 24/7 support, 256-bit encryption.
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Open Account
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-12 grid grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
            <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-3 md:p-4 border border-primary-200/50">
              <Shield className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 text-primary-600" />
              <div className="text-xl md:text-2xl font-bold text-neutral-900">256-bit</div>
              <div className="text-xs md:text-sm text-neutral-600">Encryption</div>
            </div>
            <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-3 md:p-4 border border-primary-200/50">
              <Clock className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 text-primary-600" />
              <div className="text-xl md:text-2xl font-bold text-neutral-900">24/7</div>
              <div className="text-xs md:text-sm text-neutral-600">Support</div>
            </div>
            <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-3 md:p-4 border border-primary-200/50">
              <Lock className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 text-primary-600" />
              <div className="text-xl md:text-2xl font-bold text-neutral-900">100%</div>
              <div className="text-xs md:text-sm text-neutral-600">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 mb-12">Why Choose Gatwick Bank?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all">
              <Shield className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Bank-Level Security</h3>
              <p className="text-neutral-600">
                256-bit encryption and two-factor authentication protect your account. We use industry-leading security measures to keep your money safe.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all">
              <Zap className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Instant Transfers</h3>
              <p className="text-neutral-600">
                Send and receive money in seconds. Our platform processes transactions instantly with real-time notifications.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all">
              <Users className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">24/7 Support</h3>
              <p className="text-neutral-600">
                Our dedicated team is always here to help you. Get assistance anytime, anywhere through chat, email, or phone.
              </p>
            </div>
          </div>

          <div id="services" className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">What We Offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Secure Accounts</h4>
                  <p className="text-neutral-600 text-sm">Protected savings and checking accounts with competitive rates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Debit & Credit Cards</h4>
                  <p className="text-neutral-600 text-sm">Premium cards with rewards and fraud protection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Instant Payments</h4>
                  <p className="text-neutral-600 text-sm">P2P transfers, bill payments, and international transfers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Analytics Dashboard</h4>
                  <p className="text-neutral-600 text-sm">Track spending, income, and savings with detailed insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 mb-12">Bank Updates & News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 border-l-4 border-primary-600 hover:shadow-lg transition-shadow">
                <div className="text-sm text-primary-600 font-semibold mb-2">{item.date}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 mb-4">{item.snippet}</p>
                <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  Read More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 mb-12">Get in Touch</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div 
              className="rounded-3xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(139, 92, 246, 0.18)',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.12)'
              }}
            >
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1.5px solid rgba(139, 92, 246, 0.2)'
                    }}
                    className="w-full h-12 px-4 rounded-xl text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1.5px solid rgba(139, 92, 246, 0.2)'
                    }}
                    className="w-full h-12 px-4 rounded-xl text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={4}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1.5px solid rgba(139, 92, 246, 0.2)'
                    }}
                    className="w-full px-4 py-3 rounded-xl text-neutral-900 placeholder-neutral-400 transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary-600 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-900">Email</div>
                      <a href="mailto:support@gatwickbank.com" className="text-primary-600 hover:text-primary-700">
                        support@gatwickbank.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary-600 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-900">Phone</div>
                      <a href="tel:+442012345678" className="text-primary-600 hover:text-primary-700">
                        +44 20 1234 5678
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-900">Address</div>
                      <p className="text-neutral-600">London, United Kingdom</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-100 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Map Placeholder</p>
                  <p className="text-sm">London HQ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 mb-12">Privacy & Policy</h2>
          
          <div className="space-y-4">
            {policies.map((policy, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setExpandedPolicy(expandedPolicy === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold text-neutral-900 text-left">{policy.title}</span>
                  <ChevronDown className={`w-5 h-5 text-primary-600 transition-transform ${expandedPolicy === index ? 'rotate-180' : ''}`} />
                </button>
                {expandedPolicy === index && (
                  <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                    <p className="text-neutral-600">{policy.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-50 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-neutral-900">Gatwick Bank</span>
              </div>
              <p className="text-neutral-600">Secure, modern banking at your fingertips.</p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#about" className="block text-neutral-600 hover:text-primary-600">About</a>
                <a href="#news" className="block text-neutral-600 hover:text-primary-600">News</a>
                <a href="#contact" className="block text-neutral-600 hover:text-primary-600">Contact</a>
                <a href="#privacy" className="block text-neutral-600 hover:text-primary-600">Privacy</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-200 pt-8 text-center">
            <p className="text-neutral-600 text-sm">© 2025 Gatwick Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
