import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  Percent,
  ChevronRight,
  X,
  FileText,
  CreditCard,
  Home,
  Car,
  Briefcase,
  Calculator
} from 'lucide-react';
import apiClient from '../lib/apiClient';

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [applyForm, setApplyForm] = useState({
    loanType: 'PERSONAL',
    amount: '',
    termMonths: 12,
    purpose: ''
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await apiClient.get('/loans');
      setLoans(response.loans || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
    setIsLoading(false);
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.post('/loans', applyForm);
      setSuccess('Loan application submitted successfully!');
      setShowApplyModal(false);
      setApplyForm({ loanType: 'PERSONAL', amount: '', termMonths: 12, purpose: '' });
      fetchLoans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to submit loan application');
    }
    setIsSubmitting(false);
  };

  const fetchSchedule = async (loanId) => {
    try {
      const response = await apiClient.get(`/loans/${loanId}/schedule`);
      setSchedule(response.schedule || []);
      setShowScheduleModal(loanId);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const handleRepayment = async (loanId) => {
    try {
      await apiClient.post(`/loans/${loanId}/repay`);
      setSuccess('Payment processed successfully!');
      fetchLoans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to process payment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getLoanTypeIcon = (type) => {
    switch (type) {
      case 'PERSONAL': return <CreditCard className="w-5 h-5" />;
      case 'MORTGAGE': return <Home className="w-5 h-5" />;
      case 'AUTO': return <Car className="w-5 h-5" />;
      case 'BUSINESS': return <Briefcase className="w-5 h-5" />;
      default: return <Landmark className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
      ACTIVE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      DECLINED: 'bg-red-500/10 text-red-400 border-red-500/20',
      DEFAULTED: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const calculateMonthlyPayment = (amount, rate, months) => {
    if (!amount || !rate || !months) return 0;
    const monthlyRate = rate / 100 / 12;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return (amount * numerator) / denominator;
  };

  // Default interest rates
  const defaultRates = {
    PERSONAL: 8.5,
    BUSINESS: 7.0,
    MORTGAGE: 5.5,
    AUTO: 6.0
  };

  const estimatedPayment = calculateMonthlyPayment(
    parseFloat(applyForm.amount) || 0,
    defaultRates[applyForm.loanType],
    applyForm.termMonths
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Landmark className="w-8 h-8 text-purple-400" />
              Loans
            </h1>
            <p className="text-slate-400 mt-1">Apply for loans and manage your existing loans</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Apply for Loan
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Loan Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Loans</div>
            <div className="text-2xl font-bold text-white mt-1">{loans.length}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Active Loans</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED').length}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Pending</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {loans.filter(l => l.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Borrowed</div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              ${loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED').reduce((sum, l) => sum + parseFloat(l.amount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Loans List */}
        {loans.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Landmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Loans Yet</h3>
            <p className="text-slate-400 mb-4">Apply for your first loan to get started</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Apply Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6 hover:border-slate-600 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      loan.loanType === 'PERSONAL' ? 'bg-purple-500/10 text-purple-400' :
                      loan.loanType === 'MORTGAGE' ? 'bg-blue-500/10 text-blue-400' :
                      loan.loanType === 'AUTO' ? 'bg-green-500/10 text-green-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {getLoanTypeIcon(loan.loanType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{loan.loanType} Loan</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{loan.purpose || 'No purpose specified'}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          ${parseFloat(loan.amount).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Percent className="w-4 h-4" />
                          {parseFloat(loan.interestRate)}% APR
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {loan.termMonths} months
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Monthly Payment</div>
                      <div className="text-xl font-bold text-white">${parseFloat(loan.monthlyPayment).toFixed(2)}</div>
                    </div>
                    {(loan.status === 'ACTIVE' || loan.status === 'APPROVED') && (
                      <div className="text-right">
                        <div className="text-slate-400 text-sm">Remaining</div>
                        <div className="text-lg font-semibold text-amber-400">${parseFloat(loan.remainingBalance).toLocaleString()}</div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setShowDetailsModal(loan)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                      >
                        Details
                      </button>
                      {(loan.status === 'ACTIVE' || loan.status === 'APPROVED') && (
                        <>
                          <button
                            onClick={() => fetchSchedule(loan.id)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => handleRepayment(loan.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
                          >
                            Make Payment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply Loan Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Apply for a Loan</h2>
                  <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleApplyLoan} className="p-6 space-y-4">
                {/* Loan Type */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Loan Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['PERSONAL', 'BUSINESS', 'MORTGAGE', 'AUTO'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setApplyForm({...applyForm, loanType: type})}
                        className={`p-3 rounded-lg border transition flex items-center gap-2 ${
                          applyForm.loanType === type 
                            ? 'bg-purple-600 border-purple-500 text-white' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {getLoanTypeIcon(type)}
                        <span className="text-sm font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Interest Rate: {defaultRates[applyForm.loanType]}% APR</p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Loan Amount ($)</label>
                  <input
                    type="number"
                    value={applyForm.amount}
                    onChange={(e) => setApplyForm({...applyForm, amount: e.target.value})}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    min="1000"
                    max="1000000"
                  />
                </div>

                {/* Term */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Loan Term (Months)</label>
                  <select
                    value={applyForm.termMonths}
                    onChange={(e) => setApplyForm({...applyForm, termMonths: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                    <option value={24}>24 months</option>
                    <option value={36}>36 months</option>
                    <option value={48}>48 months</option>
                    <option value={60}>60 months</option>
                    <option value={120}>120 months (10 years)</option>
                    <option value={180}>180 months (15 years)</option>
                    <option value={240}>240 months (20 years)</option>
                    <option value={360}>360 months (30 years)</option>
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Purpose (Optional)</label>
                  <textarea
                    value={applyForm.purpose}
                    onChange={(e) => setApplyForm({...applyForm, purpose: e.target.value})}
                    placeholder="Describe the purpose of this loan"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Estimated Payment */}
                {applyForm.amount && (
                  <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">Estimated Monthly Payment</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${estimatedPayment.toFixed(2)}/month</div>
                    <div className="text-sm text-slate-400 mt-1">
                      Total repayment: ${(estimatedPayment * applyForm.termMonths).toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !applyForm.amount}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loan Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Loan Details</h2>
                  <button onClick={() => setShowDetailsModal(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Loan Type</div>
                    <div className="text-white font-medium">{showDetailsModal.loanType}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Status</div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(showDetailsModal.status)}`}>
                      {showDetailsModal.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Principal Amount</div>
                    <div className="text-white font-medium">${parseFloat(showDetailsModal.amount).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Interest Rate</div>
                    <div className="text-white font-medium">{parseFloat(showDetailsModal.interestRate)}% APR</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Term</div>
                    <div className="text-white font-medium">{showDetailsModal.termMonths} months</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Monthly Payment</div>
                    <div className="text-white font-medium">${parseFloat(showDetailsModal.monthlyPayment).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Remaining Balance</div>
                    <div className="text-amber-400 font-medium">${parseFloat(showDetailsModal.remainingBalance).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Total Paid</div>
                    <div className="text-green-400 font-medium">${parseFloat(showDetailsModal.totalPaid).toLocaleString()}</div>
                  </div>
                </div>
                {showDetailsModal.purpose && (
                  <div>
                    <div className="text-slate-400 text-sm">Purpose</div>
                    <div className="text-white">{showDetailsModal.purpose}</div>
                  </div>
                )}
                {showDetailsModal.declineReason && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                    <div className="text-red-400 text-sm font-medium">Decline Reason</div>
                    <div className="text-red-300">{showDetailsModal.declineReason}</div>
                  </div>
                )}
                {showDetailsModal.nextPaymentDate && (
                  <div>
                    <div className="text-slate-400 text-sm">Next Payment Due</div>
                    <div className="text-white">{new Date(showDetailsModal.nextPaymentDate).toLocaleDateString()}</div>
                  </div>
                )}
                <div className="text-slate-500 text-xs">
                  Applied: {new Date(showDetailsModal.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Payment Schedule</h2>
                  <button onClick={() => setShowScheduleModal(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full">
                  <thead className="bg-slate-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Payment</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Principal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Interest</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-700/50">
                        <td className="px-4 py-3 text-slate-400">{row.month}</td>
                        <td className="px-4 py-3 text-white">{new Date(row.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right text-white">${row.payment.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-400">${row.principal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-amber-400">${row.interest.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-white">${row.remainingBalance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansPage;
