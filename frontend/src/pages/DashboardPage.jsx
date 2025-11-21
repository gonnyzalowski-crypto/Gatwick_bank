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
import { IncomeModal } from '../components/IncomeModal';
import { ExpensesModal } from '../components/ExpensesModal';
import { SavingsModal } from '../components/SavingsModal';
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
  BarChart3,
  LineChart,
  PieChart,
  Activity,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [showMarketRates, setShowMarketRates] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);

  const isDevUser =
    user?.id?.startsWith('dev-') || (user?.email && user.email.endsWith('@gatwickbank.test'));

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
        } else if (isDevUser) {
          const mockDashboard = {
            timestamp: new Date().toISOString(),
            summary: {
              totalBalance: '12500.45',
              accountCount: 3,
              activeCards: 2,
              totalCards: 3,
              recentTransactionCount: 5,
            },
            recentTransactions: [
              {
                id: 1,
                description: 'Amazon Purchase',
                amount: '-89.99',
                date: new Date().toISOString(),
                type: 'debit',
              },
              {
                id: 2,
                description: 'Salary Deposit',
                amount: '+3500.00',
                date: new Date(Date.now() - 86400000).toISOString(),
                type: 'credit',
              },
              {
                id: 3,
                description: 'Netflix Subscription',
                amount: '-15.99',
                date: new Date(Date.now() - 172800000).toISOString(),
                type: 'debit',
              },
            ],
          };
          setDashboard(mockDashboard);
        } else {
          setError('Failed to load dashboard');
        }

        if (kycResponse) {
          setKyc(kycResponse);
        } else if (isDevUser) {
          setKyc({ kycStatus: 'VERIFIED' });
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);

        if (isDevUser) {
          const mockDashboard = {
            timestamp: new Date().toISOString(),
            summary: {
              totalBalance: '12500.45',
              accountCount: 3,
              activeCards: 2,
              totalCards: 3,
              recentTransactionCount: 5,
            },
            recentTransactions: [
              {
                id: 1,
                description: 'Amazon Purchase',
                amount: '-89.99',
                date: new Date().toISOString(),
                type: 'debit',
              },
              {
                id: 2,
                description: 'Salary Deposit',
                amount: '+3500.00',
                date: new Date(Date.now() - 86400000).toISOString(),
                type: 'credit',
              },
            ],
          };
          setDashboard(mockDashboard);
          setKyc({ kycStatus: 'VERIFIED' });
          setError(null);
        } else {
          setError('Unable to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndKyc();
  }, [isDevUser]);

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
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-primary-100 text-sm font-medium uppercase tracking-wide">
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
                      <p><span className="text-blue-400">Current:</span> Available + Pending</p>
                    </div>
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight">
                  {formatCurrency(summary.totalBalance || 0)}
                </h1>
                <div className="flex gap-4 mb-2">
                  <div>
                    <p className="text-primary-100/70 text-xs">Available</p>
                    <p className="text-green-300 text-sm font-semibold">
                      {formatCurrency(summary.availableBalance || summary.totalBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-primary-100/70 text-xs">Pending</p>
                    <p className="text-yellow-300 text-sm font-semibold">
                      {formatCurrency(summary.pendingBalance || 0)}
                    </p>
                  </div>
                </div>
                <p className="text-primary-100 text-sm">
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Accounts Card */}
          <div
            onClick={() => navigate('/accounts')}
            className="bg-white border border-neutral-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-neutral-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Wallet className="w-6 h-6 text-primary-600" />
              </div>
              {summary.accountCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">12%</span>
                </div>
              )}
            </div>
            <p className="text-neutral-600 text-sm font-medium mb-1">Active Accounts</p>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{summary.accountCount || 0}</p>
            <p className="text-neutral-500 text-xs">vs last month</p>
          </div>

          {/* Active Cards Card */}
          <div
            onClick={() => navigate('/cards')}
            className="bg-white border border-neutral-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-neutral-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <p className="text-neutral-600 text-sm font-medium mb-1">Active Cards</p>
            <p className="text-3xl font-bold text-neutral-900 mb-1">
              {summary.activeCards || 0} / {summary.totalCards || 0}
            </p>
            <p className="text-neutral-500 text-xs">Total cards issued</p>
          </div>

          {/* Recent Transactions Card */}
          <div
            onClick={() => navigate('/transaction-history')}
            className="bg-white border border-neutral-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-neutral-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              {summary.recentTransactionCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">8%</span>
                </div>
              )}
            </div>
            <p className="text-neutral-600 text-sm font-medium mb-1">Recent Transactions</p>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{summary.recentTransactionCount || 0}</p>
            <p className="text-neutral-500 text-xs">vs last week</p>
          </div>
        </div>

        {/* Spending Chart Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Monthly Spending</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Your spending trends over the last 12 months</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Vertical Grouped Bar Chart Visualization */}
            <div className="flex items-end justify-between gap-3" style={{ height: '256px' }}>
              {[
                { month: 'Jan', income: 2800, expenses: 2400, savings: 400 },
                { month: 'Feb', income: 3500, expenses: 3200, savings: 300 },
                { month: 'Mar', income: 3200, expenses: 2800, savings: 400 },
                { month: 'Apr', income: 4000, expenses: 3600, savings: 400 },
                { month: 'May', income: 3600, expenses: 3100, savings: 500 },
                { month: 'Jun', income: 4500, expenses: 4000, savings: 500 },
                { month: 'Jul', income: 4200, expenses: 3800, savings: 400 },
                { month: 'Aug', income: 3900, expenses: 3400, savings: 500 },
                { month: 'Sep', income: 4400, expenses: 3900, savings: 500 },
                { month: 'Oct', income: 4100, expenses: 3700, savings: 400 },
                { month: 'Nov', income: 4700, expenses: 4200, savings: 500 },
                { month: 'Dec', income: 4000, expenses: 3500, savings: 500 },
              ].map((data, idx) => {
                const maxValue = 4700; // Highest value for scaling
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2" style={{ height: '100%' }}>
                    {/* Grouped bars container */}
                    <div className="w-full relative flex items-end justify-center gap-1.5" style={{ height: 'calc(100% - 28px)' }}>
                      {/* Income bar (Thin Primary) */}
                      <div
                        className="rounded-t-md transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group bg-primary-600 hover:bg-primary-700"
                        style={{
                          width: '6px',
                          height: `${(data.income / maxValue) * 100}%`,
                          minHeight: '8px',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute inset-x-0 -top-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-neutral-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Income<br/>${data.income.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expenses bar (Thick Red) */}
                      <div
                        className="rounded-t-md transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group bg-red-500 hover:bg-red-600"
                        style={{
                          width: '12px',
                          height: `${(data.expenses / maxValue) * 100}%`,
                          minHeight: '8px',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute inset-x-0 -top-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-neutral-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Expenses<br/>${data.expenses.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Savings bar (Thin Emerald) */}
                      <div
                        className="rounded-t-md transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group bg-emerald-500 hover:bg-emerald-600"
                        style={{
                          width: '6px',
                          height: `${(data.savings / maxValue) * 100}%`,
                          minHeight: '8px',
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute inset-x-0 -top-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-neutral-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Savings<br/>${data.savings.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <span className="text-xs font-medium text-neutral-600">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3 rounded bg-primary-600"></div>
                <span className="text-xs font-medium text-neutral-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-xs font-medium text-neutral-600">Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3 rounded bg-emerald-500"></div>
                <span className="text-xs font-medium text-neutral-600">Savings</span>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Average</p>
                <p className="text-xl font-bold text-neutral-900">$3,517</p>
                <p className="text-xs text-neutral-400 mt-0.5">per month</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Highest</p>
                <p className="text-xl font-bold text-emerald-600">$4,200</p>
                <p className="text-xs text-emerald-500 mt-0.5">November</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Trend</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <p className="text-xl font-bold text-emerald-600">+18%</p>
                </div>
                <p className="text-xs text-emerald-500 mt-0.5">vs last year</p>
              </div>
            </div>
          </div>
        </div>

        {/* Three Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income Trend - Line Chart */}
          <div 
            onClick={() => setShowIncomeModal(true)}
            className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Income Trend</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Monthly income growth</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Line Chart */}
              <div className="relative" style={{ height: '200px' }}>
                <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="300" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <path
                    d="M 0 180 L 25 160 L 50 140 L 75 150 L 100 120 L 125 110 L 150 100 L 175 90 L 200 85 L 225 75 L 250 70 L 275 60 L 300 50 L 300 200 L 0 200 Z"
                    fill="url(#incomeGradient)"
                    opacity="0.2"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 180 L 25 160 L 50 140 L 75 150 L 100 120 L 125 110 L 150 100 L 175 90 L 200 85 L 225 75 L 250 70 L 275 60 L 300 50"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Dots */}
                  <circle cx="0" cy="180" r="4" fill="#4F46E5" />
                  <circle cx="25" cy="160" r="4" fill="#4F46E5" />
                  <circle cx="50" cy="140" r="4" fill="#4F46E5" />
                  <circle cx="75" cy="150" r="4" fill="#4F46E5" />
                  <circle cx="100" cy="120" r="4" fill="#4F46E5" />
                  <circle cx="125" cy="110" r="4" fill="#4F46E5" />
                  <circle cx="150" cy="100" r="4" fill="#4F46E5" />
                  <circle cx="175" cy="90" r="4" fill="#4F46E5" />
                  <circle cx="200" cy="85" r="4" fill="#4F46E5" />
                  <circle cx="225" cy="75" r="4" fill="#4F46E5" />
                  <circle cx="250" cy="70" r="4" fill="#4F46E5" />
                  <circle cx="275" cy="60" r="4" fill="#4F46E5" />
                  <circle cx="300" cy="50" r="5" fill="#4F46E5" />
                  
                  <defs>
                    <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">This Month</p>
                    <p className="text-lg font-bold text-neutral-900">$4,700</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+24%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Breakdown - Donut Chart */}
          <div 
            onClick={() => setShowExpensesModal(true)}
            className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Expenses</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Category breakdown</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-6">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                  
                  {/* Food - 35% (0 to 126 degrees) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="20"
                    strokeDasharray="154 440"
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                  />
                  
                  {/* Shopping - 25% (126 to 216 degrees) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="20"
                    strokeDasharray="110 440"
                    strokeDashoffset="-154"
                    transform="rotate(-90 80 80)"
                  />
                  
                  {/* Transport - 20% (216 to 288 degrees) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="20"
                    strokeDasharray="88 440"
                    strokeDashoffset="-264"
                    transform="rotate(-90 80 80)"
                  />
                  
                  {/* Bills - 20% (288 to 360 degrees) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray="88 440"
                    strokeDashoffset="-352"
                    transform="rotate(-90 80 80)"
                  />
                  
                  {/* Center text */}
                  <text x="80" y="75" textAnchor="middle" className="text-xs fill-neutral-500" fontSize="12">Total</text>
                  <text x="80" y="95" textAnchor="middle" className="text-lg font-bold fill-neutral-900" fontSize="20">$4.2K</text>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-neutral-600">Food & Dining</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                    <span className="text-xs text-neutral-600">Shopping</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-neutral-600">Transport</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-neutral-600">Bills</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Growth - Area Chart */}
          <div 
            onClick={() => setShowSavingsModal(true)}
            className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Savings Growth</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Accumulated savings</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Area Chart */}
              <div className="relative" style={{ height: '200px' }}>
                <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="300" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <path
                    d="M 0 190 L 25 185 L 50 178 L 75 172 L 100 163 L 125 155 L 150 145 L 175 133 L 200 120 L 225 105 L 250 88 L 275 68 L 300 45 L 300 200 L 0 200 Z"
                    fill="url(#savingsGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 190 L 25 185 L 50 178 L 75 172 L 100 163 L 125 155 L 150 145 L 175 133 L 200 120 L 225 105 L 250 88 L 275 68 L 300 45"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Dots on key points */}
                  <circle cx="150" cy="145" r="4" fill="#10B981" />
                  <circle cx="225" cy="105" r="4" fill="#10B981" />
                  <circle cx="300" cy="45" r="5" fill="#10B981" />
                  
                  <defs>
                    <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Total Saved</p>
                    <p className="text-lg font-bold text-emerald-600">$5,200</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Open New Account</h3>
            <p className="text-sm text-neutral-600">
              Start saving or manage your finances with a new account
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <CreditCard className="w-6 h-6 text-primary-600" />
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
