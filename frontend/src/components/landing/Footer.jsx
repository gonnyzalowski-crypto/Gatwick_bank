import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { InfoModal } from '../modals/InfoModal';
import { modalContent } from '../../data/modalContent.jsx';
import { productsCompanyModals } from '../../data/productsCompanyModals.jsx';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalKey) => {
    setActiveModal(modalKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Gatwick Bank</span>
            </div>
            <p className="text-gray-400 mb-6">
              Modern banking for the digital age. Secure, fast, and designed for you.
            </p>
            <p className="text-sm text-gray-500">
              FDIC Insured • Equal Housing Lender<br />
              Member FDIC • NMLS #123456
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-bold mb-4">Products</h3>
            <ul className="space-y-3">
              <li><button onClick={() => openModal('personalBanking')} className="hover:text-purple-400 transition-colors text-left">Personal Banking</button></li>
              <li><button onClick={() => openModal('businessBanking')} className="hover:text-purple-400 transition-colors text-left">Business Banking</button></li>
              <li><button onClick={() => openModal('cryptoWallets')} className="hover:text-purple-400 transition-colors text-left">Crypto Wallets</button></li>
              <li><button onClick={() => openModal('creditCards')} className="hover:text-purple-400 transition-colors text-left">Credit Cards</button></li>
              <li><button onClick={() => openModal('loansFinancing')} className="hover:text-purple-400 transition-colors text-left">Loans & Financing</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><button onClick={() => openModal('aboutUs')} className="hover:text-purple-400 transition-colors text-left">About Us</button></li>
              <li><button onClick={() => openModal('careers')} className="hover:text-purple-400 transition-colors text-left">Careers</button></li>
              <li><button onClick={() => openModal('pressMedia')} className="hover:text-purple-400 transition-colors text-left">Press & Media</button></li>
              <li><button onClick={() => openModal('blogResources')} className="hover:text-purple-400 transition-colors text-left">Blog & Resources</button></li>
              <li><button onClick={() => openModal('partnerProgram')} className="hover:text-purple-400 transition-colors text-left">Partner Program</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <a href="mailto:support@gatwickbank.com" className="hover:text-purple-400 transition-colors">
                  support@gatwickbank.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <a href="tel:+1234567890" className="hover:text-purple-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span>
                  123 Financial District<br />
                  New York, NY 10004
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Gatwick Bank. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <button onClick={() => openModal('privacy')} className="hover:text-purple-400 transition-colors">Privacy Policy</button>
              <button onClick={() => openModal('terms')} className="hover:text-purple-400 transition-colors">Terms of Service</button>
              <button onClick={() => openModal('cookies')} className="hover:text-purple-400 transition-colors">Cookie Policy</button>
              <button onClick={() => openModal('security')} className="hover:text-purple-400 transition-colors">Security</button>
              <button onClick={() => openModal('accessibility')} className="hover:text-purple-400 transition-colors">Accessibility</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <InfoModal
          isOpen={!!activeModal}
          onClose={closeModal}
          title={modalContent[activeModal]?.title || productsCompanyModals[activeModal]?.title}
          content={modalContent[activeModal]?.content || productsCompanyModals[activeModal]?.content}
        />
      )}
    </footer>
  );
};
