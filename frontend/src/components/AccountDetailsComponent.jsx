import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import TransactionListComponent from './TransactionListComponent';

/**
 * AccountDetailsComponent - Shows detailed information about a specific account
 * Mobile-first, responsive design with dark theme
 */
export const AccountDetailsComponent = ({ accountId, onBack }) => {
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
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
        <p className="text-slate-400">Account not found</p>
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
          {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
        </h2>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm mb-2">Account Balance</p>
        <h3 className="text-4xl font-bold mb-4">{formatCurrency(account.balance)}</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-blue-100">Account Number</p>
            <p className="text-sm font-mono text-white">{maskAccountNumber(account.accountNumber)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100">{account.currency}</p>
            <p className={`text-sm font-semibold ${account.isActive ? 'text-green-300' : 'text-red-300'}`}>
              {account.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-700/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded transition duration-200 font-semibold ${
            activeTab === 'overview'
              ? 'bg-blue-500 text-white'
              : 'bg-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview
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
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2 px-4 rounded transition duration-200 font-semibold ${
            activeTab === 'payments'
              ? 'bg-blue-500 text-white'
              : 'bg-transparent text-slate-400 hover:text-white'
          }`}
        >
          Payments
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-bold text-white">Account Information</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-400">Type</span>
                <span className="text-white font-medium capitalize">{account.accountType}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-400">Currency</span>
                <span className="text-white font-medium">{account.currency}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium ${account.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                <span className="text-slate-400">Created</span>
                <span className="text-white font-medium">{formatDate(account.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Last Updated</span>
                <span className="text-white font-medium">{formatDate(account.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Cards Associated */}
          {account.cards && account.cards.length > 0 && (
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-bold text-white">Associated Cards ({account.cards.length})</h3>

              <div className="space-y-2">
                {account.cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-slate-600 rounded p-3 hover:bg-slate-500 transition duration-200 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white capitalize">{card.cardType} Card</p>
                      <p className="text-xs text-slate-300">
                        •••• •••• •••• {card.cardNumber.slice(-4)} | Limit: ${card.dailyLimit.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          card.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {card.isFrozen && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                          Frozen
                        </span>
                      )}
                      <span className="text-slate-400 group-hover:text-blue-400 transition duration-200">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
              Transfer Money
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
              Add Card
            </button>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <TransactionListComponent accountId={accountId} limit={10} />
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Payment History</h3>

          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="space-y-2">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-slate-600 hover:bg-slate-500 rounded-lg p-3 transition duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white capitalize">
                          {payment.type === 'transfer' && '↔️ Transfer'}
                          {payment.type === 'p2p' && '👤 P2P Payment'}
                          {payment.type === 'bill' && '📄 Bill Payment'}
                          {payment.type === 'refund' && '↩️ Refund'}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            payment.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{payment.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-sm font-bold ${
                          payment.fromAccountId === accountId ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {payment.fromAccountId === accountId ? '-' : '+'}${payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 text-center">
              <p className="text-slate-400">No payments for this account</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetailsComponent;
