import React, { useState, useEffect } from 'react';
import { Lock, Shield, CheckCircle2, AlertCircle, Key, RefreshCw } from 'lucide-react';
import apiClient from '../lib/apiClient';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { ActionButton } from '../components/ui/ActionButton';
import { ErrorState } from '../components/ui/ErrorState';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    answer: ''
  });
  const [securityQuestion, setSecurityQuestion] = useState(null);
  const [loginPreference, setLoginPreference] = useState('question');
  const [preferenceLoading, setPreferenceLoading] = useState(false);

  useEffect(() => {
    fetchRandomQuestion();
    fetchLoginPreference();
  }, []);

  const fetchRandomQuestion = async () => {
    try {
      const response = await apiClient.get('/auth/random-security-question');
      setSecurityQuestion(response);
    } catch (err) {
      console.error('Failed to fetch security question:', err);
      setError('Failed to load security question');
    }
  };

  const fetchLoginPreference = async () => {
    try {
      const response = await apiClient.get('/auth/login-preference');
      setLoginPreference(response.preference);
    } catch (err) {
      console.error('Failed to fetch login preference:', err);
    }
  };

  const handlePreferenceChange = async (newPreference) => {
    setPreferenceLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.put('/auth/login-preference', { preference: newPreference });
      setLoginPreference(newPreference);
      setSuccess(`Login verification method updated to ${newPreference === 'question' ? 'Security Question' : 'Backup Code'}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update preference');
    }

    setPreferenceLoading(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!passwordData.answer.trim()) {
      setError('Please answer the security question');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        questionId: securityQuestion.questionId,
        answer: passwordData.answer
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        answer: ''
      });
      
      fetchRandomQuestion();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }

    setIsLoading(false);
  };

  return (
    <UserDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Account Settings</h1>
          <p className="text-sm text-neutral-600">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'login'
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Login Verification
              </button>
            </nav>
          </div>

          {/* Password Change Form */}
          {activeTab === 'password' && (
            <div className="p-6">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">Change Password</h2>
                  <p className="text-sm text-neutral-600">
                    For security, you must answer a security question to change your password
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-700 text-sm font-medium">{success}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1.5">At least 8 characters</p>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                      required
                    />
                  </div>

                  {/* Security Question */}
                  <div className="border-t border-neutral-200 pt-5 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <h3 className="text-sm font-semibold text-neutral-900">Security Verification</h3>
                    </div>

                    {securityQuestion ? (
                      <>
                        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                          <p className="text-sm font-medium text-primary-900">
                            {securityQuestion.question}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Your Answer
                          </label>
                          <input
                            type="text"
                            name="answer"
                            value={passwordData.answer}
                            onChange={handlePasswordChange}
                            placeholder="Enter your answer"
                            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 placeholder-neutral-400 text-sm"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-neutral-500 text-sm">Loading security question...</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <ActionButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isLoading}
                      disabled={!securityQuestion}
                      fullWidth
                    >
                      {isLoading ? 'Changing Password...' : 'Change Password'}
                    </ActionButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Login Verification Preference */}
          {activeTab === 'login' && (
            <div className="p-6">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">Login Verification Method</h2>
                  <p className="text-sm text-neutral-600">
                    Choose your preferred method for verifying your identity when logging in
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-700 text-sm font-medium">{success}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Security Question Option */}
                  <button
                    onClick={() => handlePreferenceChange('question')}
                    disabled={preferenceLoading || loginPreference === 'question'}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                      loginPreference === 'question'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        loginPreference === 'question'
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-400'
                      }`}>
                        {loginPreference === 'question' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-5 h-5 text-primary-600" />
                          <h3 className="font-semibold text-neutral-900">Security Question</h3>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Answer one of your security questions to verify your identity
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Backup Code Option */}
                  <button
                    onClick={() => handlePreferenceChange('code')}
                    disabled={preferenceLoading || loginPreference === 'code'}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                      loginPreference === 'code'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        loginPreference === 'code'
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-400'
                      }`}>
                        {loginPreference === 'code' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-5 h-5 text-primary-600" />
                          <h3 className="font-semibold text-neutral-900">Backup Code</h3>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Check your email for a 6-digit authentication code
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900 mb-1">Important</h3>
                      <p className="text-sm text-amber-700">
                        {loginPreference === 'code' 
                          ? 'When using backup codes, you will receive an email with your authentication code each time you log in.'
                          : 'Make sure you remember the answers to your security questions.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Security Tip</h3>
              <p className="text-sm text-blue-700">
                Always use a strong, unique password. Never share your password or security question answers with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default SettingsPage;
