import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import { Globe, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export const InternationalTransferPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientIBAN, setRecipientIBAN] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('');
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
            setFromAccount(response.accounts[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Unable to load accounts');
      }
    };

    fetchAccounts();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fromAccount || !recipientName || !recipientIBAN || !recipientBank || !recipientCountry || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    const account = accounts.find(acc => acc.id === fromAccount);
    if (account && parseFloat(amount) > parseFloat(account.balance)) {
      setError('Insufficient funds in source account');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/payments/international-transfer', {
        fromAccountId: fromAccount,
        recipientName,
        recipientIBAN,
        recipientBank,
        recipientCountry,
        amount: parseFloat(amount),
        description,
      });

      if (response.success) {
        setSuccess(`International transfer of $${amount} initiated successfully`);
        setAmount('');
        setRecipientName('');
        setRecipientIBAN('');
        setRecipientBank('');
        setRecipientCountry('');
        setDescription('');
        
        setTimeout(() => {
          navigate('/transaction-history');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'International transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">International Transfer</h1>
          <p className="text-sm text-neutral-600">Send money abroad via SWIFT/IBAN</p>
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

        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Important Notice</h3>
              <p className="text-sm text-amber-700">
                International transfers may take 1-5 business days to process. Additional fees may apply based on the destination country and amount.
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Transfer Details</h2>
              <p className="text-sm text-neutral-600">Enter recipient and transfer information</p>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-5">
            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                From Account
              </label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 text-sm"
                required
              >
                <option value="">Select source account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} - ${acc.balance} ({acc.accountType})
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-neutral-200 pt-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Recipient Information</h3>

              {/* Recipient Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name as it appears on their account"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>

              {/* Recipient IBAN */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  IBAN / Account Number
                </label>
                <input
                  type="text"
                  value={recipientIBAN}
                  onChange={(e) => setRecipientIBAN(e.target.value)}
                  placeholder="GB29 NWBK 6016 1331 9268 19"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm font-mono"
                  required
                />
              </div>

              {/* Recipient Bank */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={recipientBank}
                  onChange={(e) => setRecipientBank(e.target.value)}
                  placeholder="e.g., Deutsche Bank, HSBC"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>

              {/* Recipient Country */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={recipientCountry}
                  onChange={(e) => setRecipientCountry(e.target.value)}
                  placeholder="e.g., United Kingdom, Germany"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>
            </div>

            {/* Amount */}
            <div className="border-t border-neutral-200 pt-5">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">Exchange rates and fees will be applied</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Purpose of Transfer (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Invoice payment, Family support"
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
                disabled={!fromAccount || !recipientName || !recipientIBAN || !amount}
                fullWidth
              >
                {loading ? 'Processing...' : 'Initiate Transfer'}
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default InternationalTransferPage;
