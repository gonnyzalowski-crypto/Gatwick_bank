import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import WithdrawalModal from '../components/modals/WithdrawalModal';
import { ArrowUpFromLine, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get('/accounts');
        if (response.success) {
          setAccounts(response.accounts);
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Unable to load accounts');
      }
    };

    fetchAccounts();
  }, []);

  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Withdraw Funds</h1>
          <p className="text-sm text-neutral-600">Withdraw money from your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Withdrawal Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <ArrowUpFromLine className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Withdraw Funds</h2>
            <p className="text-neutral-600">
              Withdraw money from your account with admin approval
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 mb-1">Important</p>
                  <p className="text-xs text-amber-700">
                    Withdrawals are processed instantly. Please ensure you have sufficient funds in your account.
                  </p>
                </div>
              </div>
            </div>

            <ActionButton
              type="button"
              variant="primary"
              size="lg"
              icon={ArrowUpFromLine}
              onClick={() => setShowWithdrawalModal(true)}
              fullWidth
            >
              Start Withdrawal
            </ActionButton>
          </div>
        </div>
      </div>

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        accounts={accounts}
      />
    </UserDashboardLayout>
  );
};

export default WithdrawalPage;
