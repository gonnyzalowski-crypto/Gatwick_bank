import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Repeat,
  Play,
  Pause,
  XCircle,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Loader2,
  Building2,
  User
} from 'lucide-react';
import apiClient from '../lib/apiClient';

const RecurringPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  
  const [form, setForm] = useState({
    fromAccountId: '',
    paymentType: 'EXTERNAL',
    recipientName: '',
    recipientBank: '',
    recipientAccount: '',
    recipientRouting: '',
    toAccountNumber: '',
    amount: '',
    description: '',
    frequency: 'MONTHLY',
    startDate: '',
    endDate: '',
    dayOfMonth: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, accountsRes] = await Promise.all([
        apiClient.get('/recurring-payments'),
        apiClient.get('/accounts')
      ]);
      
      setPayments(paymentsRes.payments || []);
      setAccounts(accountsRes.accounts || []);
      
      if (accountsRes.accounts?.length > 0) {
        const primary = accountsRes.accounts.find(a => a.isPrimary) || accountsRes.accounts[0];
        setForm(f => ({ ...f, fromAccountId: primary.id }));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    }
    setIsLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth) : null
      };
      
      await apiClient.post('/recurring-payments', payload);
      setSuccess('Recurring payment created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create recurring payment');
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.put(`/recurring-payments/${showEditModal.id}`, {
        amount: parseFloat(form.amount),
        description: form.description,
        frequency: form.frequency,
        endDate: form.endDate || null,
        dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth) : null
      });
      setSuccess('Recurring payment updated!');
      setShowEditModal(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
    setIsSubmitting(false);
  };

  const handlePause = async (id) => {
    try {
      await apiClient.post(`/recurring-payments/${id}/pause`);
      setSuccess('Payment paused');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to pause');
    }
  };

  const handleResume = async (id) => {
    try {
      await apiClient.post(`/recurring-payments/${id}/resume`);
      setSuccess('Payment resumed');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resume');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this recurring payment?')) return;
    
    try {
      await apiClient.post(`/recurring-payments/${id}/cancel`);
      setSuccess('Payment cancelled');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel');
    }
  };

  const resetForm = () => {
    const primary = accounts.find(a => a.isPrimary) || accounts[0];
    setForm({
      fromAccountId: primary?.id || '',
      paymentType: 'EXTERNAL',
      recipientName: '',
      recipientBank: '',
      recipientAccount: '',
      recipientRouting: '',
      toAccountNumber: '',
      amount: '',
      description: '',
      frequency: 'MONTHLY',
      startDate: '',
      endDate: '',
      dayOfMonth: ''
    });
  };

  const openEditModal = (payment) => {
    setForm({
      ...form,
      amount: payment.amount,
      description: payment.description || '',
      frequency: payment.frequency,
      endDate: payment.endDate ? payment.endDate.split('T')[0] : '',
      dayOfMonth: payment.dayOfMonth || ''
    });
    setShowEditModal(payment);
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
      PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
      COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Every 2 Weeks',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly'
    };
    return labels[freq] || freq;
  };

  // Stats
  const activeCount = payments.filter(p => p.status === 'ACTIVE').length;
  const totalMonthly = payments
    .filter(p => p.status === 'ACTIVE')
    .reduce((sum, p) => {
      const amount = parseFloat(p.amount);
      switch (p.frequency) {
        case 'DAILY': return sum + (amount * 30);
        case 'WEEKLY': return sum + (amount * 4);
        case 'BIWEEKLY': return sum + (amount * 2);
        case 'MONTHLY': return sum + amount;
        case 'QUARTERLY': return sum + (amount / 3);
        case 'YEARLY': return sum + (amount / 12);
        default: return sum + amount;
      }
    }, 0);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-700 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Recurring Payments</h1>
                <p className="text-sm text-slate-400">Manage your standing orders</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Payment
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Payments</div>
            <div className="text-2xl font-bold text-white mt-1">{payments.length}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Active</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{activeCount}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Est. Monthly Total</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">${totalMonthly.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {payments.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">No recurring payments set up</p>
            <p className="text-sm text-slate-500 mt-1">Create one to automate your payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => (
              <div key={payment.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      payment.status === 'ACTIVE' ? 'bg-green-600/20' :
                      payment.status === 'PAUSED' ? 'bg-amber-600/20' : 'bg-slate-600/20'
                    }`}>
                      <Repeat className={`w-6 h-6 ${
                        payment.status === 'ACTIVE' ? 'text-green-400' :
                        payment.status === 'PAUSED' ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-white">{payment.recipientName}</div>
                      <div className="text-sm text-slate-400">{payment.recipientBank || 'Internal Transfer'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                        <span className="text-xs text-slate-500">{getFrequencyLabel(payment.frequency)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${parseFloat(payment.amount).toLocaleString()}</div>
                    <div className="text-sm text-slate-400">
                      Next: {payment.nextExecutionDate ? new Date(payment.nextExecutionDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button
                        onClick={() => setShowDetailsModal(payment)}
                        className="p-1.5 hover:bg-slate-700 rounded transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      {payment.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => openEditModal(payment)}
                            className="p-1.5 hover:bg-slate-700 rounded transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handlePause(payment.id)}
                            className="p-1.5 hover:bg-slate-700 rounded transition"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4 text-amber-400" />
                          </button>
                        </>
                      )}
                      {payment.status === 'PAUSED' && (
                        <button
                          onClick={() => handleResume(payment.id)}
                          className="p-1.5 hover:bg-slate-700 rounded transition"
                          title="Resume"
                        >
                          <Play className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      {payment.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(payment.id)}
                          className="p-1.5 hover:bg-slate-700 rounded transition"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Recurring Payment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">From Account</label>
                <select
                  value={form.fromAccountId}
                  onChange={(e) => setForm({...form, fromAccountId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountType} - {acc.accountNumber} (${parseFloat(acc.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Payment Type</label>
                <select
                  value={form.paymentType}
                  onChange={(e) => setForm({...form, paymentType: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="EXTERNAL">External Bank Transfer</option>
                  <option value="INTERNAL">Internal Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => setForm({...form, recipientName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>

              {form.paymentType === 'EXTERNAL' ? (
                <>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={form.recipientBank}
                      onChange={(e) => setForm({...form, recipientBank: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Routing Number</label>
                      <input
                        type="text"
                        value={form.recipientRouting}
                        onChange={(e) => setForm({...form, recipientRouting: e.target.value})}
                        maxLength={9}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={form.recipientAccount}
                        onChange={(e) => setForm({...form, recipientAccount: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Recipient Account Number</label>
                  <input
                    type="text"
                    value={form.toAccountNumber}
                    onChange={(e) => setForm({...form, toAccountNumber: e.target.value})}
                    placeholder="Gatwick Bank account number"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({...form, frequency: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Every 2 Weeks</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({...form, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {form.frequency === 'MONTHLY' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Day of Month (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm({...form, dayOfMonth: e.target.value})}
                    placeholder="e.g., 15 for 15th of each month"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="e.g., Rent payment"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">Payment Details</h3>
              <button onClick={() => setShowDetailsModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reference</span>
                <span className="font-mono text-indigo-400">{showDetailsModal.reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(showDetailsModal.status)}`}>
                  {showDetailsModal.status}
                </span>
              </div>
              <hr className="border-slate-700" />
              <div>
                <div className="text-sm text-slate-400 mb-1">Recipient</div>
                <div className="text-white">{showDetailsModal.recipientName}</div>
                {showDetailsModal.recipientBank && (
                  <div className="text-sm text-slate-400">{showDetailsModal.recipientBank}</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-xl font-bold text-white">${parseFloat(showDetailsModal.amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Frequency</span>
                <span className="text-white">{getFrequencyLabel(showDetailsModal.frequency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Next Execution</span>
                <span className="text-white">
                  {showDetailsModal.nextExecutionDate ? new Date(showDetailsModal.nextExecutionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Executions</span>
                <span className="text-white">{showDetailsModal.executionCount}</span>
              </div>
              {showDetailsModal.executions?.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">Recent Executions</div>
                  <div className="space-y-2">
                    {showDetailsModal.executions.map(exec => (
                      <div key={exec.id} className="flex items-center justify-between text-sm bg-slate-900 p-2 rounded">
                        <span className="text-slate-400">{new Date(exec.executionDate).toLocaleDateString()}</span>
                        <span className={exec.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                          {exec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Payment</h3>
              <button onClick={() => setShowEditModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({...form, frequency: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Every 2 Weeks</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({...form, endDate: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
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

export default RecurringPaymentsPage;
