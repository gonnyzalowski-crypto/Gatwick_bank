import React, { useState } from 'react';
import apiClient from '../lib/apiClient';

/**
 * CardManagementComponent - Manages a single card
 * Mobile-first, responsive design with dark theme
 */
export const CardManagementComponent = ({ card, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newLimit, setNewLimit] = useState(card.dailyLimit);

  const maskCardNumber = (cardNumber) => {
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cardNumber;
  };

  const handleFreeze = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/cards/${card.id}/freeze`);
      if (response.success) {
        onUpdate({ ...card, isFrozen: true });
      } else {
        setError('Failed to freeze card');
      }
    } catch (err) {
      console.error('Error freezing card:', err);
      setError('Unable to freeze card');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreeze = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/cards/${card.id}/unfreeze`);
      if (response.success) {
        onUpdate({ ...card, isFrozen: false });
      } else {
        setError('Failed to unfreeze card');
      }
    } catch (err) {
      console.error('Error unfreezing card:', err);
      setError('Unable to unfreeze card');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    if (newLimit < 0) {
      setError('Limit must be positive');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/cards/${card.id}/limit`, {
        dailyLimit: parseFloat(newLimit),
      });
      if (response.success) {
        onUpdate({ ...card, dailyLimit: parseFloat(newLimit) });
        setShowLimitModal(false);
      } else {
        setError('Failed to update limit');
      }
    } catch (err) {
      console.error('Error updating limit:', err);
      setError('Unable to update limit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this card?')) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/cards/${card.id}/deactivate`);
      if (response.success) {
        onDelete(card.id);
      } else {
        setError('Failed to deactivate card');
      }
    } catch (err) {
      console.error('Error deactivating card:', err);
      setError('Unable to deactivate card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Realistic Credit Card Display */}
      <div className="relative w-full max-w-md aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl" style={{ fontFamily: "'OCR A Std', 'OCR-A', 'Courier New', monospace" }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700"></div>
        
        {/* Diagonal light stripes */}
        <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-30">
          <div className="absolute top-[-20%] right-[10%] w-1 h-[140%] bg-white/40 rotate-[30deg]"></div>
          <div className="absolute top-[-20%] right-[20%] w-1 h-[140%] bg-white/30 rotate-[30deg]"></div>
          <div className="absolute top-[-20%] right-[30%] w-1 h-[140%] bg-white/20 rotate-[30deg]"></div>
        </div>
        
        {/* Card content */}
        <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
          {/* Top row: Bank logo + Card type */}
          <div className="flex justify-between items-start">
            {/* Bank logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-500/80 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-lg font-semibold tracking-wide">
                <span className="font-bold">Rosch</span> Capital Bank
              </div>
            </div>
            {/* Card type */}
            <div className="text-right">
              <span className="text-sm italic opacity-90 tracking-wider capitalize">{card.cardType || 'Credit'} card</span>
              {card.isFrozen && (
                <span className="block text-xs text-yellow-400 mt-1">FROZEN</span>
              )}
            </div>
          </div>
          
          {/* Chip */}
          <div className="mt-4">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-md shadow-md">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px p-1">
                <div className="bg-yellow-500/50 rounded-sm"></div>
                <div className="bg-yellow-600/50 rounded-sm"></div>
                <div className="bg-yellow-500/50 rounded-sm"></div>
                <div className="bg-yellow-600/50 rounded-sm"></div>
                <div className="bg-yellow-400/50 rounded-sm"></div>
                <div className="bg-yellow-600/50 rounded-sm"></div>
                <div className="bg-yellow-500/50 rounded-sm"></div>
                <div className="bg-yellow-600/50 rounded-sm"></div>
                <div className="bg-yellow-500/50 rounded-sm"></div>
              </div>
            </div>
          </div>
          
          {/* Card number */}
          <div className="mt-4">
            <p className="text-2xl tracking-[0.2em] font-medium" style={{ fontFamily: "'OCR A Std', 'OCR-A', 'Courier New', monospace" }}>
              {formatCardNumber(card.cardNumber)}
            </p>
          </div>
          
          {/* Valid thru + Expiry */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] leading-tight opacity-70">VALID<br/>THRU</span>
            <span className="text-lg tracking-wider" style={{ fontFamily: "'OCR A Std', 'OCR-A', 'Courier New', monospace" }}>
              {formatDate(card.expiry)}
            </span>
          </div>
          
          {/* Bottom row: Cardholder name + Mastercard logo */}
          <div className="flex justify-between items-end mt-2">
            {/* Cardholder name */}
            <p className="text-lg tracking-widest uppercase" style={{ fontFamily: "'OCR A Std', 'OCR-A', 'Courier New', monospace" }}>
              {card.cardholderName || 'CARDHOLDER NAME'}
            </p>
            {/* Mastercard logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full opacity-90"></div>
              <div className="w-8 h-8 bg-orange-400 rounded-full -ml-3 opacity-90"></div>
            </div>
          </div>
        </div>
        
        {/* Status overlay for inactive cards */}
        {!card.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xl font-bold tracking-wider">INACTIVE</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status Info */}
      {card.isFrozen && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg text-sm">
          ⚠️ This card is currently frozen and cannot be used for transactions.
        </div>
      )}

      {/* Card Details */}
      <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-bold text-white">Card Details</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Status</span>
            <span className={`font-medium ${card.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {card.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Frozen</span>
            <span className={`font-medium ${card.isFrozen ? 'text-yellow-400' : 'text-green-400'}`}>
              {card.isFrozen ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Daily Limit</span>
            <span className="text-white font-medium">${parseFloat(card.dailyLimit || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Created</span>
            <span className="text-white font-medium">{new Date(card.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Updated</span>
            <span className="text-white font-medium">{new Date(card.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setShowLimitModal(true)}
          disabled={loading || !card.isActive}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Update Daily Limit
        </button>

        {card.isFrozen ? (
          <button
            onClick={handleUnfreeze}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Unfreeze Card
          </button>
        ) : (
          <button
            onClick={handleFreeze}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Freeze Card
          </button>
        )}

        <button
          onClick={handleDeactivate}
          disabled={loading || !card.isActive}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Deactivate Card
        </button>
      </div>

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Update Daily Limit</h3>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                New Daily Limit (USD)
              </label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                min="0"
                step="10"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLimit}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManagementComponent;