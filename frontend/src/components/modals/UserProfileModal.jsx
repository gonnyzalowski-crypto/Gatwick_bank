import React from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Shield, CreditCard } from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      LIMITED: 'bg-yellow-100 text-yellow-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      CLOSED: 'bg-slate-100 text-slate-700'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.ACTIVE}`}>{status}</span>;
  };

  const getKYCBadge = (status) => {
    const styles = {
      NOT_SUBMITTED: 'bg-slate-100 text-slate-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      VERIFIED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.NOT_SUBMITTED}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User Profile'}
              </h2>
              <p className="text-primary-100 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Account Status */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Account Status
              </h3>
              {getStatusBadge(user?.accountStatus || 'ACTIVE')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">KYC Status</span>
              {getKYCBadge(user?.kycStatus || 'NOT_SUBMITTED')}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Full Name</span>
                <span className="text-sm font-medium text-neutral-900 text-right">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
                <span className="text-sm font-medium text-neutral-900 text-right">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </span>
                <span className="text-sm font-medium text-neutral-900 text-right">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </span>
                <span className="text-sm font-medium text-neutral-900 text-right">
                  {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </span>
                <span className="text-sm font-medium text-neutral-900 text-right max-w-xs">
                  {user?.address || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Account Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Account Type</span>
                <span className="text-sm font-medium text-neutral-900">
                  {user?.isBusinessAccount ? 'Business Account' : 'Personal Account'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Member Since</span>
                <span className="text-sm font-medium text-neutral-900">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="text-sm text-neutral-600">Last Login</span>
                <span className="text-sm font-medium text-neutral-900">
                  {user?.lastLoginAt ? formatDate(user.lastLoginAt) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This information is read-only. To update your profile, please visit the Account Settings page.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
