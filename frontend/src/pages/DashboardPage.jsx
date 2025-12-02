import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { MetricCard } from '../components/ui/MetricCard';
import { ActionButton } from '../components/ui/ActionButton';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { MarketRatesModal } from '../components/MarketRatesModal';
import { TransactionHistoryModal } from '../components/TransactionHistoryModal';
import AccountCreationModal from '../components/modals/AccountCreationModal';
import SendMoneyModal from '../components/modals/SendMoneyModal';
import { formatDate } from '../utils/dateFormatter';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Send,
  Download,
  Plus,
  Clock,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [showMarketRates, setShowMarketRates] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);

  useEffect(() => {
    const fetchDashboardAndKyc = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardResponse, kycResponse] = await Promise.all([
          apiClient.get('/dashboard'),
          apiClient
            .get('/kyc/status')
            .catch((err) => {
              console.error('Error fetching KYC status:', err);
              return null;
            }),
        ]);

        if (dashboardResponse?.success) {
          setDashboard(dashboardResponse.dashboard);
        } else {
          setError('Failed to load dashboard');
        }

        if (kycResponse) {
          setKyc(kycResponse);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndKyc();
  }, []);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <LoadingSkeleton variant="hero" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error && !isDevUser) {
    return (
      <UserDashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <ErrorState
            title="Unable to load dashboard"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </UserDashboardLayout>
    );
  }

  const summary = dashboard?.summary || {};

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section - Total Balance */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-primary-800 rounded-2xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                    Total Balance
                  </p>
                  <div className="group relative">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center cursor-help">
                      <span className="text-white text-xs">?</span>
                    </div>
                    <div className="absolute left-0 top-6 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="font-semibold mb-2">Balance Types:</p>
                      <p className="mb-1"><span className="text-green-400">Available:</span> Spendable money</p>
                      <p className="mb-1"><span className="text-yellow-400">Pending:</span> Transactions clearing</p>
                      <p><span className="text-purple-400">Current:</span> Available + Pending</p>
                    </div>
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight">
                  {formatCurrency(summary.totalBalance || 0)}
                </h1>
                <div className="flex gap-4 mb-2">
                  <div>
                    <p className="text-purple-100/70 text-xs">Available</p>
                    <p className="text-green-300 text-sm font-semibold">
                      {formatCurrency(summary.availableBalance || summary.totalBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-100/70 text-xs">Pending</p>
                    <p className="text-yellow-300 text-sm font-semibold">
                      {formatCurrency(summary.pendingBalance || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm">
                  Across {summary.accountCount || 0} accounts • Last updated just now
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <ActionButton
                  variant="secondary"
                  size="md"
                  icon={Send}
                  onClick={() => setShowSendMoneyModal(true)}
                >
                  Send Money
                </ActionButton>
                <ActionButton
                  variant="outline"
                  size="md"
                  icon={Download}
                  onClick={() => navigate('/statements')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Download Statement
                </ActionButton>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Alert (if not verified) */}
        {kyc?.kycStatus !== 'VERIFIED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Complete your KYC verification
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Verify your identity to unlock full banking features including higher transfer limits and card issuance.
              </p>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/kyc')}
              >
                Complete Verification
              </ActionButton>
            </div>
          </div>
        )}

        {/* Market Rates Card */}
        <div 
          onClick={() => setShowMarketRates(true)}
          className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Market Rates</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Live forex, stocks, crypto & commodities</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-neutral-600">Live</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Quick Preview - Top 6 Markets */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* EUR/USD */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">EUR/USD</p>
                    <p className="text-lg font-bold text-neutral-900">1.0856</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+0.21%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,20 20,18 40,15 60,17 80,12 100,10"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* AAPL */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">AAPL</p>
                    <p className="text-lg font-bold text-neutral-900">$189.95</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+1.31%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,18 20,16 40,14 60,12 80,10 100,8"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* BTC */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">BTC</p>
                    <p className="text-lg font-bold text-neutral-900">$43.5K</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+2.92%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,22 20,20 40,16 60,14 80,10 100,6"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* GOLD */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">GOLD</p>
                    <p className="text-lg font-bold text-neutral-900">$2,034</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+0.61%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,16 20,15 40,13 60,14 80,11 100,10"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* S&P 500 */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">S&P 500</p>
                    <p className="text-lg font-bold text-neutral-900">4,567</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+0.52%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,19 20,17 40,15 60,16 80,13 100,11"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* OIL */}
              <div className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">OIL</p>
                    <p className="text-lg font-bold text-neutral-900">$78.45</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+1.59%</span>
                  </div>
                </div>
                <svg width="100%" height="24" className="mt-2">
                  <polyline
                    points="0,21 20,19 40,17 60,15 80,12 100,9"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* View All Button */}
            <div className="mt-6 text-center">
              <button className="text-sm font-semibold text-purple-700 hover:text-purple-800 transition-colors">
                View all 50+ markets →
              </button>
            </div>
          </div>
        </div>

        {/* Market Rates Modal */}
        <MarketRatesModal 
          isOpen={showMarketRates} 
          onClose={() => setShowMarketRates(false)} 
        />

        {/* Analytics Modals */}
        <IncomeModal 
          isOpen={showIncomeModal} 
          onClose={() => setShowIncomeModal(false)} 
        />
        <ExpensesModal 
          isOpen={showExpensesModal} 
          onClose={() => setShowExpensesModal(false)} 
        />
        <SavingsModal 
          isOpen={showSavingsModal} 
          onClose={() => setShowSavingsModal(false)} 
        />
        <TransactionHistoryModal 
          isOpen={showTransactionHistory} 
          onClose={() => setShowTransactionHistory(false)} 
        />

        {/* Recent Activity */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Your latest transactions</p>
            </div>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => setShowTransactionHistory(true)}
            >
              View All
            </ActionButton>
          </div>

          <div className="divide-y divide-neutral-100">
            {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
              dashboard.recentTransactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        txn.type === 'credit' || parseFloat(txn.amount) > 0
                          ? 'bg-emerald-100'
                          : 'bg-neutral-100'
                      }`}
                    >
                      {txn.type === 'credit' || parseFloat(txn.amount) > 0 ? (
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-neutral-600" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {txn.description}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(txn.date, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div
                      className={`text-sm font-semibold ${
                        txn.type === 'credit' || parseFloat(txn.amount) > 0
                          ? 'text-emerald-600'
                          : 'text-neutral-900'
                      }`}
                    >
                      {formatCurrency(txn.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                  No recent transactions
                </h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Your transaction history will appear here
                </p>
                <ActionButton
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={() => navigate('/payments')}
                >
                  Make a Payment
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setShowCreateAccountModal(true)}
            className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Plus className="w-6 h-6 text-purple-700" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Open New Account</h3>
            <p className="text-sm text-neutral-600">
              Start saving or manage your finances with a new account
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <CreditCard className="w-6 h-6 text-purple-700" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Request New Card</h3>
            <p className="text-sm text-neutral-600">
              Get a debit or credit card for your accounts
            </p>
          </div>
        </div>
      </div>

      {/* Account Creation Modal */}
      <AccountCreationModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSuccess={() => {
          setShowCreateAccountModal(false);
          // Refresh dashboard data
          window.location.reload();
        }}
      />

      {/* Send Money Modal */}
      <SendMoneyModal
        isOpen={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
        userAccounts={dashboard?.accounts || []}
      />
    </UserDashboardLayout>
  );
};

export default DashboardPage;
