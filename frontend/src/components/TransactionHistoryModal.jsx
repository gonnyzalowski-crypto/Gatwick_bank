import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  Coffee,
  Film,
  Heart,
  Briefcase
} from 'lucide-react';

/**
 * Transaction History Modal
 * Shows last 30 days of transactions with filtering and search
 */
export const TransactionHistoryModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, credit, debit
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock transaction data for last 30 days
  const transactions = [
    { id: 1, description: 'Salary Deposit', amount: 3500.00, type: 'credit', category: 'Income', date: '2 hours ago', icon: Briefcase, color: 'emerald' },
    { id: 2, description: 'Amazon Purchase', amount: -89.99, type: 'debit', category: 'Shopping', date: '5 hours ago', icon: ShoppingBag, color: 'purple' },
    { id: 3, description: 'Whole Foods Market', amount: -125.50, type: 'debit', category: 'Food & Dining', date: '1 day ago', icon: Utensils, color: 'amber' },
    { id: 4, description: 'Uber Ride', amount: -23.45, type: 'debit', category: 'Transport', date: '1 day ago', icon: Car, color: 'blue' },
    { id: 5, description: 'Freelance Payment', amount: 850.00, type: 'credit', category: 'Income', date: '2 days ago', icon: Briefcase, color: 'emerald' },
    { id: 6, description: 'Electric Bill', amount: -156.50, type: 'debit', category: 'Bills', date: '3 days ago', icon: Zap, color: 'red' },
    { id: 7, description: 'Netflix Subscription', amount: -15.99, type: 'debit', category: 'Entertainment', date: '3 days ago', icon: Film, color: 'red' },
    { id: 8, description: 'Starbucks', amount: -12.50, type: 'debit', category: 'Food & Dining', date: '4 days ago', icon: Coffee, color: 'amber' },
    { id: 9, description: 'Gas Station', amount: -45.00, type: 'debit', category: 'Transport', date: '5 days ago', icon: Car, color: 'blue' },
    { id: 10, description: 'Gym Membership', amount: -49.99, type: 'debit', category: 'Health', date: '5 days ago', icon: Heart, color: 'red' },
    { id: 11, description: 'Restaurant', amount: -67.80, type: 'debit', category: 'Food & Dining', date: '6 days ago', icon: Utensils, color: 'amber' },
    { id: 12, description: 'Target', amount: -89.45, type: 'debit', category: 'Shopping', date: '7 days ago', icon: ShoppingBag, color: 'purple' },
    { id: 13, description: 'Investment Return', amount: 250.00, type: 'credit', category: 'Investment', date: '1 week ago', icon: TrendingUp, color: 'emerald' },
    { id: 14, description: 'Water Bill', amount: -45.30, type: 'debit', category: 'Bills', date: '1 week ago', icon: Home, color: 'blue' },
    { id: 15, description: 'Coffee Shop', amount: -8.75, type: 'debit', category: 'Food & Dining', date: '1 week ago', icon: Coffee, color: 'amber' },
    { id: 16, description: 'Uber Eats', amount: -34.20, type: 'debit', category: 'Food & Dining', date: '1 week ago', icon: Utensils, color: 'amber' },
    { id: 17, description: 'Apple Store', amount: -199.00, type: 'debit', category: 'Shopping', date: '2 weeks ago', icon: ShoppingBag, color: 'purple' },
    { id: 18, description: 'Dividend Payment', amount: 120.00, type: 'credit', category: 'Investment', date: '2 weeks ago', icon: TrendingUp, color: 'emerald' },
    { id: 19, description: 'Internet Bill', amount: -65.00, type: 'debit', category: 'Bills', date: '2 weeks ago', icon: Zap, color: 'red' },
    { id: 20, description: 'Grocery Store', amount: -156.80, type: 'debit', category: 'Shopping', date: '2 weeks ago', icon: ShoppingBag, color: 'purple' },
  ];

  // Calculate statistics
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0));
  const netChange = totalIncome - totalExpenses;

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesCategory = filterCategory === 'all' || txn.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-600',
      red: 'bg-red-100 text-red-600',
      amber: 'bg-amber-100 text-amber-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colors[color] || 'bg-neutral-100 text-neutral-600';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Transaction History">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-emerald-600 font-medium">Total Income</p>
            </div>
            <p className="text-2xl font-bold text-emerald-900">+${totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold text-red-900">-${totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`bg-gradient-to-br rounded-xl p-4 border ${netChange >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-amber-50 to-amber-100 border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              {netChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-blue-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-600" />
              )}
              <p className={`text-xs font-medium ${netChange >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>Net Change</p>
            </div>
            <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
              {netChange >= 0 ? '+' : ''}${Math.abs(netChange).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Type:</span>
            </div>
            <div className="flex gap-2">
              {['all', 'credit', 'debit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'credit' ? 'Income' : 'Expenses'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium text-neutral-700">Category:</span>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-600 border-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <button className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredTransactions.map((txn) => {
              const Icon = txn.icon;
              return (
                <div
                  key={txn.id}
                  className="bg-neutral-50 hover:bg-neutral-100 rounded-xl p-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClasses(txn.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-neutral-500">{txn.category}</span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs text-neutral-500">{txn.date}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`text-base font-bold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-neutral-900'}`}>
                        {txn.type === 'credit' ? '+' : ''}{txn.amount < 0 ? txn.amount : `$${txn.amount.toFixed(2)}`}
                      </p>
                      {txn.type === 'credit' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                          <ArrowDownRight className="w-3 h-3" />
                          Income
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-sm">No transactions found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Calendar className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionHistoryModal;
