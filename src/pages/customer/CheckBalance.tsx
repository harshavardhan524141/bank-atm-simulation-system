import React, { useState } from 'react';
import { Eye, ShieldCheck, Printer, ArrowDownToLine, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import type { ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';

interface CheckBalanceProps {
  onNavigate: (view: string) => void;
}

export const CheckBalance: React.FC<CheckBalanceProps> = ({ onNavigate }) => {
  const { user, account, refreshAccount } = useAuth();
  const { success } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceReceipt, setBalanceReceipt] = useState<ATMReceiptData | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAccount();
    setIsRefreshing(false);
    success('Balance Synchronized', 'Account balance updated with central banking ledger.');
  };

  const generateBalanceSlip = () => {
    if (!user || !account) return;
    const slip: ATMReceiptData = {
      bankName: 'APEX DIGITAL BANK - ATM TERMINAL',
      terminalId: 'ATM-BLR-0492',
      transactionId: `INQ-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountHolder: user.fullName,
      maskedAccountNumber: account.accountNumber.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1-••••-••••-$4'),
      accountType: account.accountType,
      transactionType: 'DEPOSIT', // informational
      transactionDate: new Date().toISOString(),
      transactionAmount: 0,
      previousBalance: account.balance,
      updatedBalance: account.balance,
      transactionStatus: 'SUCCESS',
      referenceNumber: `INQ-${Math.floor(100000 + Math.random() * 900000)}-SLIP`,
    };
    setBalanceReceipt(slip);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">ATM Balance Inquiry</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time ledger audit of your current accessible balance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Sync Balance</span>
        </button>
      </div>

      {/* ATM Terminal Chassis Card */}
      <div className="bg-[#102A43] text-white rounded-3xl p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                AB
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Apex Terminal Switch</span>
                <span className="text-[10px] text-blue-300 font-mono">ENCRYPTED BALANCE SESSION</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{account?.accountStatus?.toUpperCase() || 'ACTIVE'}</span>
            </div>
          </div>

          {/* Central Balance Display */}
          <div className="text-center py-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 shadow-inner">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
              Total Available Balance
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400 tracking-tight">
              ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-2 block">
              Indian Rupee (INR) · Verified On-Chain Ledger
            </span>
          </div>

          {/* Detailed Account Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Account Holder Name:</span>
              <span className="font-bold text-white text-sm">{user?.fullName}</span>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Bank Account Number:</span>
              <span className="font-mono font-bold text-blue-300 text-sm">
                {account?.accountNumber || 'N/A'}
              </span>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Account Classification:</span>
              <span className="font-semibold text-white">{account?.accountType} Account</span>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Daily Cash Withdrawal Limit:</span>
              <span className="font-mono font-semibold text-white">
                ₹{account ? account.dailyWithdrawalLimit.toLocaleString('en-IN') : '50,000'} / day
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={generateBalanceSlip}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Balance Slip</span>
            </button>

            <button
              onClick={() => onNavigate('withdraw')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Withdraw Cash Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance Slip Modal */}
      <ATMReceiptModal receipt={balanceReceipt} onClose={() => setBalanceReceipt(null)} />
    </div>
  );
};
