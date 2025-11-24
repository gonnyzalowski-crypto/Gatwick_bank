import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-purple-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Gatwick Bank
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Features
            </a>
            <a href="#security" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Security
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Reviews
            </a>
            <a href="#compare" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Compare
            </a>
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Features
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Security
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Reviews
            </a>
            <a 
              href="#compare" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Compare
            </a>
            <Link 
              to="/login" 
              className="block text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="block text-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
