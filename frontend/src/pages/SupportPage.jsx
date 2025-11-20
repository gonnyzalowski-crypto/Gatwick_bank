import React from 'react';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';

const SupportPage = () => {
  return (
    <UserDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Support & Help</h2>
          <p className="text-sm text-slate-500 mt-1">
            Get help with your Gatwick Bank account, cards, payments, and profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Submit a support request</h3>
          <p className="text-xs text-slate-500">
            In a later stage we will connect this form to a support ticket API so your request is
            tracked end-to-end. For now, you can review the fields that will be used.
          </p>

          <form className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">Subject</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us briefly what you need help with"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">Category</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Account & Profile</option>
                <option>Cards</option>
                <option>Payments & Transfers</option>
                <option>Login & Security</option>
                <option>KYC & Verification</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">Details</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Share as much detail as you can so we can assist you quickly."
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 disabled:opacity-60"
            >
              Submit (coming soon)
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3 text-sm text-slate-600">
          <h3 className="text-sm font-semibold text-slate-900">Other ways to reach us</h3>
          <p>Email: <span className="font-mono">support@gatwickbank.com</span></p>
          <p>Phone: <span className="font-mono">+44 0000 000 000</span></p>
          <p>Support hours: Monday – Friday, 9:00 – 17:00 (GMT)</p>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default SupportPage;
