import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

/**
 * TransactionListComponent - Displays a list of transactions
 * Mobile-first, responsive design with dark theme
 */
export const TransactionListComponent = ({ accountId, limit = 20 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const url = accountId
          ? `/transactions?accountId=${accountId}&limit=${limit}&offset=${offset}`
          : `/transactions?limit=${limit}&offset=${offset}`;

        const response = await apiClient.get(url);

        if (response.success) {
          setTransactions(response.transactions);
          setHasMore(offset + limit < response.total);
        } else {
          setError('Failed to load transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Unable to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, offset, limit]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'debit' ? '↓' : '↑';
  };

  const getTypeColor = (type) => {
    return type === 'debit' ? 'text-red-400' : 'text-green-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
        <p className="text-slate-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 transition duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            {/* Left: Icon and Description */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-bold ${getTypeColor(
                  transaction.type
                )}`}
              >
                {getTypeIcon(transaction.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">
                  {transaction.merchantName || transaction.description}
                </p>
                <p className="text-xs text-slate-400">
                  {transaction.category && `${transaction.category} • `}
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>

            {/* Right: Amount and Status */}
            <div className="flex-shrink-0 text-right">
              <p
                className={`text-lg font-bold ${
                  transaction.type === 'debit' ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {transaction.type === 'debit' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </p>
              <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {hasMore && (
        <button
          onClick={() => setOffset(offset + limit)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Load More Transactions
        </button>
      )}
    </div>
  );
};

export default TransactionListComponent;
