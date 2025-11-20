import React, { useEffect, useState } from 'react';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import apiClient from '../lib/apiClient';
import { useAuth } from '../hooks/useAuth';

const PAGE_SIZE = 50;

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const isDevUser =
    user?.id?.startsWith('dev-') || (user?.email && user.email.endsWith('@gatwickbank.test'));

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        setLoading(true);
        setError('');

        const offset = page * PAGE_SIZE;
        const data = await apiClient.get(`/transactions?limit=${PAGE_SIZE}&offset=${offset}`);

        const transactions = Array.isArray(data?.transactions) ? data.transactions : [];

        const mapped = transactions.map((tx) => {
          const amountNumber = Number(tx.amount || 0);
          const isDebit = tx.type === 'debit';

          return {
            id: tx.id,
            date: tx.createdAt,
            description: tx.description || tx.category || 'Transaction',
            accountLabel:
              tx.account?.name ||
              tx.account?.accountNumber ||
              (tx.accountId ? `Account ${tx.accountId.slice(0, 6)}…` : '—'),
            category: tx.category || 'general',
            type: isDebit ? 'Debit' : 'Credit',
            amount: amountNumber,
            currency: tx.account?.currency || 'USD',
          };
        });

        setRows(mapped);
        setHasMore(transactions.length === PAGE_SIZE);
      } catch (err) {
        console.error('Error loading statements:', err);
        if (isDevUser) {
          const mockRows = [
            {
              id: 'mock-1',
              date: new Date().toISOString(),
              description: 'POS Purchase – Grocery Store',
              accountLabel: 'Main Current Account',
              category: 'shopping',
              type: 'Debit',
              amount: 54.32,
              currency: 'USD',
            },
            {
              id: 'mock-2',
              date: new Date(Date.now() - 86400000).toISOString(),
              description: 'Salary Payment',
              accountLabel: 'Main Current Account',
              category: 'income',
              type: 'Credit',
              amount: 2500.0,
              currency: 'USD',
            },
            {
              id: 'mock-3',
              date: new Date(Date.now() - 2 * 86400000).toISOString(),
              description: 'Transfer to Savings',
              accountLabel: 'Savings Account',
              category: 'transfer',
              type: 'Debit',
              amount: 300.0,
              currency: 'USD',
            },
          ];

          setRows(mockRows);
          setHasMore(false);
          setError('');
        } else {
          setError('Unable to load statement history');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [page, isDevUser]);

  const formatDate = (value) => {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--';
    return d.toLocaleString();
  };

  const formatAmount = (value, currency, type) => {
    const number = Number(value || 0);
    const sign = type === 'Debit' ? '-' : '+';
    return `${sign}${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${
      currency || ''
    }`;
  };

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  return (
    <UserDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Statements & History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Full history of your account activity, including card, transfer and bill payments.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-slate-500">No transactions found yet.</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wide">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Account</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap text-slate-600">{formatDate(row.date)}</td>
                        <td className="py-2 pr-4 text-slate-800">
                          <div className="font-medium text-xs md:text-sm">{row.description}</div>
                          <div className="text-[11px] text-slate-400 md:hidden">
                            {row.category} • {row.type}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-slate-600 text-xs md:text-sm">{row.accountLabel}</td>
                        <td className="py-2 pr-4 text-slate-500 text-xs md:text-sm">{row.category}</td>
                        <td className="py-2 pr-0 text-right">
                          <span
                            className={
                              row.type === 'Debit'
                                ? 'text-red-600 font-medium'
                                : 'text-emerald-600 font-medium'
                            }
                          >
                            {formatAmount(row.amount, row.currency, row.type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] md:text-xs text-slate-400">
                  Page {page + 1}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] md:text-xs text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasMore}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] md:text-xs text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default TransactionHistoryPage;
