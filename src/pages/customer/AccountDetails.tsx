import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Calendar, ShieldCheck, Lock, KeyRound, CreditCard, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';

interface AccountDetailsProps {
  onNavigate: (view: string) => void;
}

export const AccountDetails: React.FC<AccountDetailsProps> = () => {
  const { user, account, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.customer.updateProfile({ phone, address });
      updateUser(res.user);
      success('Profile Updated', 'Contact information has been saved in the bank registry.');
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update contact info.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.auth.changePassword({ oldPassword, newPassword });
      success('Password Updated', 'Your security password was changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const msg = err.message || 'Failed to change password. Verify your current password.';
      setPassError(msg);
      toastError('Password Change Failed', msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Account & Security Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review KYC parameters, linked bank account specs, and update credentials
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Bank Account Information</h3>
              <p className="text-[11px] text-slate-400">Ledger details for ATM operations</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Customer ID:</span>
              <span className="font-mono font-bold text-slate-800">{user?.customerId}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-bold text-blue-700">{account?.accountNumber}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Account Classification:</span>
              <span className="font-semibold text-slate-800">{account?.accountType} Account</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Account Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 uppercase text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {account?.accountStatus}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Daily Withdrawal Cap:</span>
              <span className="font-mono font-bold text-slate-800">
                ₹{account ? account.dailyWithdrawalLimit.toLocaleString('en-IN') : '50,000'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Account Established:</span>
              <span className="font-mono text-slate-700">
                {account?.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details & Contact Update */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Customer Profile & Contact</h3>
              <p className="text-[11px] text-slate-400">Editable contact information</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Full Legal Name (Locked)</label>
              <input
                type="text"
                disabled
                value={user?.fullName || ''}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Registered Email (Locked)</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingProfile ? 'Saving...' : 'Update Contact Information'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Security Credentials Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#102A43]">Security Credentials</h3>
            <p className="text-[11px] text-slate-400">Change your password with cryptographic scrypt re-keying</p>
          </div>
        </div>

        {passError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">New Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs"
            >
              {isChangingPass ? 'Updating Security...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
