import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import { Home, CheckCircle2, AlertCircle, Info, Shield } from 'lucide-react';

export const DomesticTransferPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBackupCodeModal, setShowBackupCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [verifying, setVerifying] = useState(false);

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

  const handleContinue = (e) => {
    e.preventDefault();
    setError('');

    if (!fromAccount || !bankName || !routingNumber || !accountNumber || !accountHolderName || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    const account = accounts.find(acc => acc.id === fromAccount);
    if (account && parseFloat(amount) > parseFloat(account.availableBalance)) {
      setError('Insufficient funds in source account');
      return;
    }

    // Show backup code modal
    setShowBackupCodeModal(true);
  };

  const handleVerifyAndSubmit = async () => {
    if (!backupCode) {
      setError('Please enter your backup code');
      return;
    }

    try {
      setVerifying(true);
      setError('');

      const response = await apiClient.post('/transfers/domestic', {
        fromAccountId: fromAccount,
        bankName,
        routingNumber,
        accountNumber,
        accountHolderName,
        amount: parseFloat(amount),
        description,
        backupCode
      });

      if (response.success) {
        setSuccess('Domestic transfer request submitted for admin approval');
        setShowBackupCodeModal(false);
        
        // Reset form
        setBankName('');
        setRoutingNumber('');
        setAccountNumber('');
        setAccountHolderName('');
        setAmount('');
        setDescription('');
        setBackupCode('');
        
        setTimeout(() => {
          navigate('/transfer-history');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer request failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Domestic Transfer</h1>
          <p className="text-sm text-neutral-600">Transfer money to external banks within the country</p>
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

        {/* Transfer Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Transfer Details</h2>
              <p className="text-sm text-neutral-600">Send money to external bank accounts</p>
            </div>
          </div>

          <form onSubmit={handleContinue} className="space-y-5">
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

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., Chase Bank, Bank of America"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                required
              />
            </div>

            {/* Routing Number */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Routing Number *
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="9-digit routing number"
                maxLength="9"
                pattern="[0-9]{9}"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Recipient's account number"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                required
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Full name on the account"
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                required
              />
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this transfer..."
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
                disabled={!fromAccount || !bankName || !routingNumber || !accountNumber || !accountHolderName || !amount}
                fullWidth
              >
                Continue
              </ActionButton>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Domestic Transfers</h3>
              <p className="text-sm text-blue-700">
                Transfers to external banks require admin approval and backup code verification for security.
              </p>
            </div>
          </div>
        </div>

        {/* Backup Code Modal */}
        {showBackupCodeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Verify Backup Code</h3>
                  <p className="text-sm text-neutral-600">Enter your backup code to proceed</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Backup Code *
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="Enter your 6-digit backup code"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowBackupCodeModal(false);
                    setBackupCode('');
                    setError('');
                  }}
                  fullWidth
                  disabled={verifying}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleVerifyAndSubmit}
                  loading={verifying}
                  disabled={!backupCode || backupCode.length !== 6}
                  fullWidth
                >
                  {verifying ? 'Verifying...' : 'Verify & Submit'}
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default DomesticTransferPage;
