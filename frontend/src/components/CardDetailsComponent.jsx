import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import CardManagementComponent from './CardManagementComponent';
import TransactionListComponent from './TransactionListComponent';

/**
 * CardDetailsComponent - Shows detailed information about a specific card
 * Mobile-first, responsive design with dark theme
 */
export const CardDetailsComponent = ({ cardId, onBack }) => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('management'); // 'management' or 'transactions'

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/cards/${cardId}`);

        if (response.success) {
          setCard(response.card);
        } else {
          setError('Failed to load card details');
        }
      } catch (err) {
        console.error('Error fetching card details:', err);
        setError('Unable to load card information');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [cardId]);

  const handleCardUpdate = (updatedCard) => {
    setCard(updatedCard);
  };

  const handleCardDelete = (cardId) => {
    onBack();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!card) {
    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
        <p className="text-slate-400">Card not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 transition duration-200 flex items-center gap-2"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-white">
          {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)} Card
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-700/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex-1 py-2 px-4 rounded transition duration-200 font-semibold ${
            activeTab === 'management'
              ? 'bg-blue-500 text-white'
              : 'bg-transparent text-slate-400 hover:text-white'
          }`}
        >
          Management
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 px-4 rounded transition duration-200 font-semibold ${
            activeTab === 'transactions'
              ? 'bg-blue-500 text-white'
              : 'bg-transparent text-slate-400 hover:text-white'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Management Tab */}
      {activeTab === 'management' && (
        <CardManagementComponent
          card={card}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Card Transactions</h3>
          {card.transactions && card.transactions.length > 0 ? (
            <div className="space-y-3">
              {card.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'debit' ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {transaction.type === 'debit' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{transaction.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
              <p className="text-slate-400">No transactions for this card</p>
            </div>
          )}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-bold text-white">Linked Account</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Account Type</span>
            <span className="text-white font-medium capitalize">
              {card.account.accountType}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-600">
            <span className="text-slate-400">Account Number</span>
            <span className="text-white font-mono">••{card.account.accountNumber.slice(-4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Account Balance</span>
            <span className="text-white font-bold text-lg">
              ${card.account.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsComponent;
