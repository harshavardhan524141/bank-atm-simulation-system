import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Vault,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Activity,
  ReceiptText,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.admin.getStats()
      .then((res) => setStats(res.stats))
      .catch((err) => console.error('Failed to load admin stats:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading administrative dashboard metrics...
      </div>
    );
  }

  const grandVolume = stats.totalTransactionVolume || 1;
  const depositShare = Math.round((stats.totalDepositVolume / grandVolume) * 100);
  const withdrawShare = Math.round((stats.totalWithdrawalVolume / grandVolume) * 100);
  const transferShare = Math.round((stats.totalTransferVolume / grandVolume) * 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Management Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
            Administrator Banking Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide liquidity monitoring, customer oversight, account freezing, and transaction auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-customers')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            Manage Customers
          </button>
          <button
            onClick={() => onNavigate('admin-reports')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs transition-colors"
          >
            Generate Reports
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Vault Reserve */}
        <div className="bg-gradient-to-br from-[#102A43] to-[#0D2135] text-white p-6 rounded-3xl shadow-lg border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
                Total System Reserves
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 mt-1">
                ₹{stats.totalSystemVault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Vault className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-700/60">
            Combined customer savings & current ledger deposits
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Customer Base
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#102A43] mt-1">
                {stats.totalCustomers}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100">
            <span>Active Customers:</span>
            <span className="font-bold text-emerald-600">{stats.activeCustomers}</span>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Provisioned Accounts
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#102A43] mt-1">
                {stats.totalBankAccounts}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100">
            <span>Frozen Accounts:</span>
            <span className={`font-bold ${stats.frozenAccounts > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {stats.frozenAccounts}
            </span>
          </div>
        </div>

        {/* Total Volume Processed */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Volume Processed
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#102A43] mt-1">
                ₹{stats.totalTransactionVolume.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-100">
            All successful ATM & transfer operations
          </p>
        </div>
      </div>

      {/* Transaction Volume Breakdown Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#102A43]">Operation Volume Distribution</h2>
          <p className="text-xs text-slate-500">Breakdown of cash flow across transaction channels</p>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${depositShare}%` }}
              title={`Deposits: ${depositShare}%`}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${withdrawShare}%` }}
              title={`Withdrawals: ${withdrawShare}%`}
            />
            <div
              className="bg-blue-600 transition-all duration-500"
              style={{ width: `${transferShare}%` }}
              title={`Transfers: ${transferShare}%`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">
                Deposits: <strong className="font-mono text-slate-900">₹{stats.totalDepositVolume.toLocaleString('en-IN')}</strong> ({stats.totalDeposits} ops · {depositShare}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600">
                Withdrawals: <strong className="font-mono text-slate-900">₹{stats.totalWithdrawalVolume.toLocaleString('en-IN')}</strong> ({stats.totalWithdrawals} ops · {withdrawShare}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-600">
                Transfers: <strong className="font-mono text-slate-900">₹{stats.totalTransferVolume.toLocaleString('en-IN')}</strong> ({stats.totalTransfers} ops · {transferShare}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Administration Portals */}
      <div className="grid md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('admin-customers')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#102A43] group-hover:text-blue-600 transition-colors">
            Customer Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Inspect all registered customers, view linked account numbers, and modify account statuses.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>Manage Customers</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-accounts')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#102A43] group-hover:text-blue-600 transition-colors">
            Account Freezing & Controls
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Protect bank liquidity by auditing balances and freezing or unfreezing accounts with recorded reasons.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>Review Accounts</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin-audit')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#102A43] group-hover:text-blue-600 transition-colors">
            Tamper-Evident Audit Logs
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Inspect immutable chronological logs of all staff operations, status changes, and ledger checks.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>View Audit Trail</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
