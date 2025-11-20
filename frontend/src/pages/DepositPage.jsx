import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import { ArrowDownToLine, CheckCircle2, AlertCircle, Wallet, Upload, QrCode } from 'lucide-react';

export const DepositPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        const accountsRes = await apiClient.get('/accounts');
        if (accountsRes.success) {
          setAccounts(accountsRes.accounts);
          if (accountsRes.accounts.length > 0) {
            setSelectedAccount(accountsRes.accounts[0].id);
          }
        }
        
        // Fetch payment gateways
        const gatewaysRes = await apiClient.get('/gateways');
        if (gatewaysRes.success) {
          const activeGateways = gatewaysRes.gateways.filter(g => g.isActive);
          setGateways(activeGateways);
          if (activeGateways.length > 0) {
            setSelectedGateway(activeGateways[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to load account and gateway information');
      }
    };

    fetchData();
  }, []);

  const handleDeposit = async (e) => {
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

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('accountId', selectedAccount);
      formData.append('amount', parseFloat(amount));
      formData.append('description', description);
      formData.append('gatewayId', selectedGateway);
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }
      
      const response = await apiClient.post('/payments/deposit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        setSuccess('Deposit request submitted! Awaiting admin approval.');
        setAmount('');
        setDescription('');
        setPaymentProof(null);
        setProofPreview('');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedGatewayDetails = gateways.find(g => g.id === selectedGateway);

  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Deposit Funds</h1>
          <p className="text-sm text-neutral-600">Add money to your account</p>
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

        {/* Deposit Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Deposit Details</h2>
              <p className="text-sm text-neutral-600">Enter the deposit information</p>
            </div>
          </div>

          <form onSubmit={handleDeposit} className="space-y-5">
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Deposit To Account
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
            </div>

            {/* Payment Gateway Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Gateway *
              </label>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 text-sm"
                required
              >
                <option value="">Select payment gateway...</option>
                {gateways.map((gateway) => (
                  <option key={gateway.id} value={gateway.id}>
                    {gateway.name} - {gateway.type}
                  </option>
                ))}
              </select>
              {selectedGatewayDetails && (
                <p className="text-xs text-neutral-500 mt-1.5">
                  {selectedGatewayDetails.instructions || `Selected: ${selectedGatewayDetails.name}`}
                </p>
              )}
            </div>

            {/* QR Code Display (for crypto gateways) */}
            {selectedGatewayDetails && selectedGatewayDetails.type === 'CRYPTO' && selectedGatewayDetails.qrCodeUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Scan QR Code to Pay</h3>
                </div>
                <div className="flex flex-col items-center">
                  <img 
                    src={selectedGatewayDetails.qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 border-2 border-blue-300 rounded-lg"
                  />
                  <p className="text-xs text-blue-700 mt-2 text-center">
                    Wallet Address: {selectedGatewayDetails.walletAddress}
                  </p>
                </div>
              </div>
            )}

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
              <p className="text-xs text-neutral-500 mt-1.5">Enter the amount you want to deposit</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this deposit..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm resize-none"
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Proof (Optional)
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="payment-proof"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="payment-proof"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-sm font-medium text-neutral-700">
                    {paymentProof ? paymentProof.name : 'Click to upload payment proof'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
              {proofPreview && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-600 mb-2">Preview:</p>
                  <img 
                    src={proofPreview} 
                    alt="Payment proof preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-neutral-300"
                  />
                </div>
              )}
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
                {loading ? 'Processing...' : 'Complete Deposit'}
              </ActionButton>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Wallet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Deposit Information</h3>
              <p className="text-sm text-blue-700">
                Deposits are processed instantly and will reflect in your account balance immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default DepositPage;
