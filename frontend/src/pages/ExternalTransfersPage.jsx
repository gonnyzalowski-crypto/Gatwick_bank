import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Users,
  Plus,
  Building2,
  Globe,
  Search,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Save,
  Loader2
} from 'lucide-react';
import apiClient from '../lib/apiClient';

const ExternalTransfersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transfer'); // transfer, beneficiaries, history
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Transfer form
  const [transferType, setTransferType] = useState('domestic'); // domestic, international
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showNewBeneficiary, setShowNewBeneficiary] = useState(false);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  
  const [transferForm, setTransferForm] = useState({
    amount: '',
    description: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountHolderName: '',
    swiftCode: '',
    iban: '',
    country: ''
  });

  // Beneficiary modal
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountName: '',
    nickname: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, beneficiariesRes, transfersRes, banksRes] = await Promise.all([
        apiClient.get('/accounts'),
        apiClient.get('/beneficiaries'),
        apiClient.get('/transfers'),
        apiClient.get('/transfers/banks').catch(() => ({ banks: [] }))
      ]);
      
      setAccounts(accountsRes.accounts || []);
      setBeneficiaries(beneficiariesRes.beneficiaries || []);
      setTransfers(transfersRes.transfers || []);
      setBanks(banksRes.banks || []);
      
      // Set default account
      if (accountsRes.accounts?.length > 0) {
        const primary = accountsRes.accounts.find(a => a.isPrimary) || accountsRes.accounts[0];
        setSelectedAccount(primary.id);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    }
    setIsLoading(false);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = transferType === 'domestic' ? '/transfers/domestic' : '/transfers/international';
      
      const payload = {
        fromAccountId: selectedAccount,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description,
        bankName: selectedBeneficiary?.bankName || transferForm.bankName,
        routingNumber: selectedBeneficiary?.routingNumber || transferForm.routingNumber,
        accountNumber: selectedBeneficiary?.accountNumber || transferForm.accountNumber,
        accountHolderName: selectedBeneficiary?.accountName || transferForm.accountHolderName
      };

      if (transferType === 'international') {
        payload.swiftCode = transferForm.swiftCode;
        payload.iban = transferForm.iban;
        payload.country = transferForm.country;
      }

      const response = await apiClient.post(endpoint, payload);
      
      setSuccess(`Transfer of $${transferForm.amount} initiated successfully! Reference: ${response.transfer?.reference || 'Pending'}`);
      
      // Save beneficiary if requested
      if (saveBeneficiary && !selectedBeneficiary) {
        await apiClient.post('/beneficiaries', {
          bankName: transferForm.bankName,
          routingNumber: transferForm.routingNumber,
          accountNumber: transferForm.accountNumber,
          accountName: transferForm.accountHolderName,
          nickname: transferForm.accountHolderName
        });
        fetchData();
      }
      
      // Reset form
      setTransferForm({
        amount: '',
        description: '',
        bankName: '',
        routingNumber: '',
        accountNumber: '',
        accountHolderName: '',
        swiftCode: '',
        iban: '',
        country: ''
      });
      setSelectedBeneficiary(null);
      setSaveBeneficiary(false);
      
      // Refresh transfers
      fetchData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Transfer failed');
    }
    setIsSubmitting(false);
  };

  const handleSaveBeneficiary = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingBeneficiary) {
        await apiClient.put(`/beneficiaries/${editingBeneficiary.id}`, beneficiaryForm);
        setSuccess('Beneficiary updated successfully');
      } else {
        await apiClient.post('/beneficiaries', beneficiaryForm);
        setSuccess('Beneficiary added successfully');
      }
      
      setShowBeneficiaryModal(false);
      setEditingBeneficiary(null);
      setBeneficiaryForm({ bankName: '', routingNumber: '', accountNumber: '', accountName: '', nickname: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save beneficiary');
    }
    setIsSubmitting(false);
  };

  const handleDeleteBeneficiary = async (id) => {
    if (!confirm('Are you sure you want to delete this beneficiary?')) return;
    
    try {
      await apiClient.delete(`/beneficiaries/${id}`);
      setSuccess('Beneficiary deleted');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete beneficiary');
    }
  };

  const selectBeneficiary = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setTransferForm({
      ...transferForm,
      bankName: beneficiary.bankName,
      routingNumber: beneficiary.routingNumber,
      accountNumber: beneficiary.accountNumber,
      accountHolderName: beneficiary.accountName
    });
    setShowNewBeneficiary(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
      COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      DECLINED: 'bg-red-500/10 text-red-400 border-red-500/20',
      REVERSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">External Transfers</h1>
              <p className="text-sm text-slate-400">Send money to other banks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            New Transfer
          </button>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'beneficiaries' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Beneficiaries
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transfer Form */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-6">Send Money</h2>
              
              {/* Transfer Type */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setTransferType('domestic')}
                  className={`flex-1 p-4 rounded-lg border transition ${
                    transferType === 'domestic'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Domestic</div>
                  <div className="text-xs opacity-70">US Banks</div>
                </button>
                <button
                  onClick={() => setTransferType('international')}
                  className={`flex-1 p-4 rounded-lg border transition ${
                    transferType === 'international'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Globe className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">International</div>
                  <div className="text-xs opacity-70">SWIFT/IBAN</div>
                </button>
              </div>

              <form onSubmit={handleTransfer} className="space-y-4">
                {/* From Account */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">From Account</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountType} - {acc.accountNumber} (${parseFloat(acc.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Selection */}
                {!showNewBeneficiary && beneficiaries.length > 0 && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Select Beneficiary</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {beneficiaries.map(b => (
                        <div
                          key={b.id}
                          onClick={() => selectBeneficiary(b)}
                          className={`p-3 rounded-lg border cursor-pointer transition ${
                            selectedBeneficiary?.id === b.id
                              ? 'bg-indigo-600/20 border-indigo-500'
                              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-medium">{b.nickname || b.accountName}</div>
                          <div className="text-sm text-slate-400">{b.bankName} - ****{b.accountNumber.slice(-4)}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowNewBeneficiary(true); setSelectedBeneficiary(null); }}
                      className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      + Add new recipient
                    </button>
                  </div>
                )}

                {/* New Recipient Form */}
                {(showNewBeneficiary || beneficiaries.length === 0) && (
                  <div className="space-y-4 p-4 bg-slate-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Recipient Details</span>
                      {beneficiaries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewBeneficiary(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Select existing
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={transferForm.bankName}
                          onChange={(e) => setTransferForm({...transferForm, bankName: e.target.value})}
                          placeholder="Chase Bank"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          required={!selectedBeneficiary}
                        />
                      </div>
                      
                      {transferType === 'domestic' ? (
                        <>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">Routing Number</label>
                            <input
                              type="text"
                              value={transferForm.routingNumber}
                              onChange={(e) => setTransferForm({...transferForm, routingNumber: e.target.value})}
                              placeholder="021000021"
                              maxLength={9}
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              required={!selectedBeneficiary}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">Account Number</label>
                            <input
                              type="text"
                              value={transferForm.accountNumber}
                              onChange={(e) => setTransferForm({...transferForm, accountNumber: e.target.value})}
                              placeholder="123456789"
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              required={!selectedBeneficiary}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">SWIFT/BIC Code</label>
                            <input
                              type="text"
                              value={transferForm.swiftCode}
                              onChange={(e) => setTransferForm({...transferForm, swiftCode: e.target.value.toUpperCase()})}
                              placeholder="CHASUS33"
                              maxLength={11}
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">IBAN</label>
                            <input
                              type="text"
                              value={transferForm.iban}
                              onChange={(e) => setTransferForm({...transferForm, iban: e.target.value.toUpperCase()})}
                              placeholder="GB82WEST12345698765432"
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-slate-400 mb-1">Country</label>
                            <input
                              type="text"
                              value={transferForm.country}
                              onChange={(e) => setTransferForm({...transferForm, country: e.target.value})}
                              placeholder="United Kingdom"
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              required
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          value={transferForm.accountHolderName}
                          onChange={(e) => setTransferForm({...transferForm, accountHolderName: e.target.value})}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          required={!selectedBeneficiary}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-400">
                      <input
                        type="checkbox"
                        checked={saveBeneficiary}
                        onChange={(e) => setSaveBeneficiary(e.target.checked)}
                        className="rounded border-slate-600"
                      />
                      Save as beneficiary for future transfers
                    </label>
                  </div>
                )}

                {/* Amount and Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Amount (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={transferForm.description}
                      onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                      placeholder="Payment for..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Transfer
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="font-medium mb-4">Transfer Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Time</span>
                    <span>{transferType === 'domestic' ? '1-3 business days' : '3-5 business days'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transfer Fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Limit</span>
                    <span>$50,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-400 font-medium">Important</p>
                    <p className="text-amber-300/70 mt-1">
                      External transfers require admin approval. You'll be notified once your transfer is processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiaries Tab */}
        {activeTab === 'beneficiaries' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-bold">Saved Beneficiaries</h2>
              <button
                onClick={() => {
                  setEditingBeneficiary(null);
                  setBeneficiaryForm({ bankName: '', routingNumber: '', accountNumber: '', accountName: '', nickname: '' });
                  setShowBeneficiaryModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Beneficiary
              </button>
            </div>
            
            {beneficiaries.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No beneficiaries saved yet</p>
                <p className="text-sm mt-1">Add beneficiaries to make transfers faster</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {beneficiaries.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium">{b.nickname || b.accountName}</div>
                        <div className="text-sm text-slate-400">{b.bankName}</div>
                        <div className="text-xs text-slate-500">****{b.accountNumber.slice(-4)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBeneficiary(b);
                          setBeneficiaryForm({
                            bankName: b.bankName,
                            routingNumber: b.routingNumber,
                            accountNumber: b.accountNumber,
                            accountName: b.accountName,
                            nickname: b.nickname || ''
                          });
                          setShowBeneficiaryModal(true);
                        }}
                        className="p-2 hover:bg-slate-600 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteBeneficiary(b.id)}
                        className="p-2 hover:bg-slate-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <button
                        onClick={() => { selectBeneficiary(b); setActiveTab('transfer'); }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-bold">Transfer History</h2>
            </div>
            
            {transfers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transfers yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {transfers.map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        t.status === 'COMPLETED' ? 'bg-green-600/20' :
                        t.status === 'PENDING' ? 'bg-amber-600/20' : 'bg-red-600/20'
                      }`}>
                        {t.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                         t.status === 'PENDING' ? <Clock className="w-5 h-5 text-amber-400" /> :
                         <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                      <div>
                        <div className="font-medium">{t.accountName}</div>
                        <div className="text-sm text-slate-400">{t.destinationBank}</div>
                        <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">${parseFloat(t.amount).toLocaleString()}</div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Beneficiary Modal */}
      {showBeneficiaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingBeneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}</h3>
              <button onClick={() => setShowBeneficiaryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBeneficiary} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={beneficiaryForm.bankName}
                  onChange={(e) => setBeneficiaryForm({...beneficiaryForm, bankName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Routing Number</label>
                <input
                  type="text"
                  value={beneficiaryForm.routingNumber}
                  onChange={(e) => setBeneficiaryForm({...beneficiaryForm, routingNumber: e.target.value})}
                  maxLength={9}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Account Number</label>
                <input
                  type="text"
                  value={beneficiaryForm.accountNumber}
                  onChange={(e) => setBeneficiaryForm({...beneficiaryForm, accountNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={beneficiaryForm.accountName}
                  onChange={(e) => setBeneficiaryForm({...beneficiaryForm, accountName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nickname (Optional)</label>
                <input
                  type="text"
                  value={beneficiaryForm.nickname}
                  onChange={(e) => setBeneficiaryForm({...beneficiaryForm, nickname: e.target.value})}
                  placeholder="e.g., Mom, Landlord"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalTransfersPage;
