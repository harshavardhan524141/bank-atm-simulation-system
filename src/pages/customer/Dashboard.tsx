import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Eye,
  EyeOff,
  History,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Receipt,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Transaction, ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, account, refreshAccount } = useAuth();
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ATMReceiptData | null>(null);

  useEffect(() => {
    refreshAccount();
    api.customer.getTransactions({ limit: 5 })
      .then((res) => {
        setRecentTransactions(res.transactions);
      })
      .catch((err) => console.error('Failed to load transactions:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const maskedAccount = account?.accountNumber
    ? showAccountNumber
      ? account.accountNumber
      : account.accountNumber.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1 •••• •••• $4')
    : '•••• •••• •••• ••••';

  const dailyUsedPercent = account
    ? Math.min(100, Math.round((account.dailyWithdrawnToday / account.dailyWithdrawalLimit) * 100))
    : 0;

  const viewReceiptForTx = (tx: Transaction) => {
    if (!user || !account) return;
    const receiptData: ATMReceiptData = {
      bankName: 'APEX DIGITAL BANK - ATM',
      terminalId: 'ATM-BLR-0492',
      transactionId: tx.transactionId,
      accountHolder: user.fullName,
      maskedAccountNumber: account.accountNumber.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1-••••-••••-$4'),
      accountType: account.accountType,
      transactionType: tx.transactionType,
      transactionDate: tx.createdAt,
      transactionAmount: tx.amount,
      previousBalance: tx.previousBalance,
      updatedBalance: tx.updatedBalance,
      transactionStatus: tx.transactionStatus,
      recipientAccount: tx.receiverAccountNumber || undefined,
      recipientName: tx.receiverName || undefined,
      referenceNumber: `REF-${tx.transactionId.replace('TXN-', '')}-APX`,
    };
    setSelectedReceipt(receiptData);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Customer Account</span>
            <span>·</span>
            <span className="font-mono text-slate-500">ID: {user?.customerId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digital ATM Node active. Manage your balances, cash operations, and inter-bank transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('withdraw')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw Cash</span>
          </button>
          <button
            onClick={() => onNavigate('deposit')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>Deposit Cash</span>
          </button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1: Available Balance */}
        <div className="bg-gradient-to-br from-[#102A43] to-[#0A1B2D] text-white rounded-3xl p-6 border border-slate-700/60 shadow-lg relative overflow-hidden flex flex-col justify-between h-56">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Available ATM Balance
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 tracking-tight">
                ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-300" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-200">
                <span>{maskedAccount}</span>
                <button
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showAccountNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-semibold text-blue-300 uppercase">{account?.accountType}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Daily ATM Withdrawal Limit */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-56">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Daily Withdrawal Limit
              </span>
              <div className="text-2xl font-bold font-mono text-[#102A43] mt-1">
                ₹{account ? account.dailyWithdrawalLimit.toLocaleString('en-IN') : '50,000'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Withdrawn Today:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{account ? account.dailyWithdrawnToday.toLocaleString('en-IN') : '0'} ({dailyUsedPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  dailyUsedPercent > 80 ? 'bg-rose-500' : 'bg-blue-600'
                }`}
                style={{ width: `${dailyUsedPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Remaining limit today: ₹
              {account
                ? (account.dailyWithdrawalLimit - account.dailyWithdrawnToday).toLocaleString('en-IN')
                : '50,000'}
            </p>
          </div>
        </div>

        {/* Card 3: Account Status & Protection */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-56">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Account Status
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="uppercase">{account?.accountStatus || 'ACTIVE'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Branch Node:</span>
              <span className="font-semibold text-slate-800">Apex Terminal Alpha</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span className="font-mono text-slate-700">
                {account?.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-base font-bold text-[#102A43] mb-3">ATM Quick Operations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'withdraw', label: 'Withdraw Cash', icon: ArrowDownToLine, color: 'text-rose-600 bg-rose-50' },
            { id: 'deposit', label: 'Deposit Cash', icon: ArrowUpFromLine, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'transfer', label: 'Transfer Money', icon: Send, color: 'text-blue-600 bg-blue-50' },
            { id: 'check-balance', label: 'Check Balance', icon: Eye, color: 'text-amber-600 bg-amber-50' },
            { id: 'transactions', label: 'History & Slips', icon: History, color: 'text-purple-600 bg-purple-50' },
            { id: 'account-details', label: 'Account Profile', icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:shadow-xs transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#102A43]">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Real-time ledger entries processed through this account</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading recent ledger transactions...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No transactions yet. Make your first deposit or withdrawal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const isDebit =
                    tx.transactionType === 'WITHDRAWAL' ||
                    (tx.transactionType === 'TRANSFER' && tx.senderAccountId === account?.accountId);

                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                        {tx.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            tx.transactionType === 'DEPOSIT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.transactionType === 'WITHDRAWAL'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isDebit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{tx.transactionType}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-bold text-sm ${
                          isDebit ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewReceiptForTx(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Generate ATM Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ATM Receipt Modal */}
      <ATMReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
