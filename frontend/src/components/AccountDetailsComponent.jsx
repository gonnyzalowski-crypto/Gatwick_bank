import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import TransactionListComponent from './TransactionListComponent';

/**
 * AccountDetailsComponent - Shows detailed information about a specific account
 * Mobile-first, responsive design with dark theme
 */
export const AccountDetailsComponent = ({ accountId, onBack }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'transactions'
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true);
        const [accountRes, paymentsRes] = await Promise.all([
          apiClient.get(`/accounts/${accountId}`),
          apiClient.get(`/payments/account/${accountId}`),
        ]);

        if (accountRes.success) {
          setAccount(accountRes.account);
        } else {
          setError('Failed to load account details');
        }

        if (paymentsRes.success) {
          setPaymentHistory(paymentsRes.payments);
        }
      } catch (err) {
        console.error('Error fetching account details:', err);
        setError('Unable to load account information');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [accountId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const maskAccountNumber = (accountNumber) => {
    const last4 = accountNumber.slice(-4);
    return `••${last4}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
        <p className="text-neutral-500">Account not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 transition duration-200 flex items-center gap-2 font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-xl">
        <p className="text-primary-100 text-sm mb-2 font-medium">Account Balance</p>
        <h3 className="text-5xl font-bold mb-6">{formatCurrency(account.balance)}</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-primary-100 mb-1">Account Number</p>
            <p className="text-base font-mono text-white">{maskAccountNumber(account.accountNumber)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-100 mb-1">{account.currency}</p>
            <p className={`text-sm font-semibold px-3 py-1 rounded-full ${account.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {account.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-lg transition duration-200 font-medium text-sm ${
            activeTab === 'overview'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2.5 px-4 rounded-lg transition duration-200 font-medium text-sm ${
            activeTab === 'transactions'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2.5 px-4 rounded-lg transition duration-200 font-medium text-sm ${
            activeTab === 'payments'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Payments
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Account Information</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                <span className="text-neutral-600 text-sm">Type</span>
                <span className="text-neutral-900 font-medium capitalize">{account.accountType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                <span className="text-neutral-600 text-sm">Currency</span>
                <span className="text-neutral-900 font-medium">{account.currency}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-neutral-600 text-sm">Status</span>
                <span className={`font-medium px-3 py-1 rounded-full text-sm ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Cards Associated */}
          {account.cards && account.cards.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">Associated Cards ({account.cards.length})</h3>

              <div className="space-y-3">
                {account.cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition duration-200 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900 capitalize">{card.cardType} Card</p>
                      <p className="text-xs text-neutral-600">
                        •••• •••• •••• {card.cardNumber.slice(-4)} | Limit: ${card.dailyLimit.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          card.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {card.isFrozen && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          Frozen
                        </span>
                      )}
                      <span className="text-neutral-400 group-hover:text-primary-600 transition duration-200">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/payments')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
            >
              Transfer Money
            </button>
            <button 
              onClick={() => navigate('/cards')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
            >
              Add Card
            </button>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Transactions</h3>
          <TransactionListComponent accountId={accountId} limit={10} />
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Payment History</h3>

          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-4 transition duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 capitalize">
                          {payment.type === 'transfer' && '⇔️ Transfer'}
                          {payment.type === 'p2p' && '👤 P2P Payment'}
                          {payment.type === 'bill' && '📄 Bill Payment'}
                          {payment.type === 'refund' && '↩️ Refund'}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-1">{payment.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-sm font-bold ${
                          payment.fromAccountId === accountId ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {payment.fromAccountId === accountId ? '-' : '+'}${payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-neutral-500">No payments for this account</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetailsComponent;
