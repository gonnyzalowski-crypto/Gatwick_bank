import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import { ArrowUpFromLine, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get('/accounts');
        if (response.success) {
          setAccounts(response.accounts);
          if (response.accounts.length > 0) {
            setSelectedAccount(response.accounts[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Unable to load accounts');
      }
    };

    fetchAccounts();
  }, []);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAccount || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    const account = accounts.find(acc => acc.id === selectedAccount);
    if (account && parseFloat(amount) > parseFloat(account.balance)) {
      setError('Insufficient funds in selected account');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/payments/withdrawal', {
        accountId: selectedAccount,
        amount: parseFloat(amount),
        description,
      });

      if (response.success) {
        setSuccess(`Successfully withdrew $${amount} from your account`);
        setAmount('');
        setDescription('');
        
        setTimeout(() => {
          navigate('/transaction-history');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Withdraw Funds</h1>
          <p className="text-sm text-neutral-600">Withdraw money from your account</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Withdrawal Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <ArrowUpFromLine className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Withdrawal Details</h2>
              <p className="text-sm text-neutral-600">Enter the withdrawal information</p>
            </div>
          </div>

          <form onSubmit={handleWithdrawal} className="space-y-5">
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Withdraw From Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 text-sm"
                required
              >
                <option value="">Select account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} - ${acc.balance} ({acc.accountType})
                  </option>
                ))}
              </select>
              {selectedAccountData && (
                <p className="text-xs text-neutral-500 mt-1.5">
                  Available balance: ${selectedAccountData.balance}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedAccountData?.balance || undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">Enter the amount you want to withdraw</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this withdrawal..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <ActionButton
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
                fullWidth
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!selectedAccount || !amount}
                fullWidth
              >
                {loading ? 'Processing...' : 'Complete Withdrawal'}
              </ActionButton>
            </div>
          </form>
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Important</h3>
              <p className="text-sm text-amber-700">
                Withdrawals are processed instantly. Please ensure you have sufficient funds in your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default WithdrawalPage;
