import React, { useState } from 'react';
import { UserCog, KeyRound, RotateCcw, ShieldCheck, Mail, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';

interface AdminProfileProps {
  onNavigate: (view: string) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = () => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('Password Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Mismatch', 'New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.auth.changePassword({ oldPassword, newPassword });
      success('Password Updated', 'Administrator password has been updated.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Failed to update admin password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset all demo data back to default initial state? This resets customer balances and transactions.')) {
      return;
    }

    setIsResetting(true);
    try {
      await api.admin.seedReset();
      success('Database Reset', 'Demo banking data has been refreshed to initial state.');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      toastError('Reset Failed', err.message || 'Could not reset database.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Administrator Profile & System Ops</h1>
        <p className="text-xs text-slate-500 mt-1">
          Root banking administrator credentials, security access keys, and sandbox database resets
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Administrator Identity</h3>
              <p className="text-[11px] text-slate-400">Chief Compliance Officer</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Full Legal Name:</span>
              <span className="font-bold text-slate-900">{user?.fullName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Staff User ID:</span>
              <span className="font-mono text-slate-700">{user?.userId}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Security Clearance:</span>
              <span className="font-bold text-blue-700 uppercase">Super Admin Level 4</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-600 uppercase">ACTIVE CLEARANCE</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Admin Logout</span>
          </button>
        </div>

        {/* Change Admin Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Update Admin Password</h3>
              <p className="text-[11px] text-slate-400">Rotate administrator login key</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
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
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs"
            >
              {isChangingPass ? 'Updating Key...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Reset Demo Banking Database</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
            Want to test scenarios with fresh balances? This action reinitializes John Doe (₹45.5k),
            Sarah Connor (₹12.8k), and Priya Sharma (₹94.2k) with their default test transactions.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={isResetting}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors shrink-0"
        >
          {isResetting ? 'Resetting DB...' : 'Reset To Initial Demo'}
        </button>
      </div>
    </div>
  );
};
