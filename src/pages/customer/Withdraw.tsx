import React, { useState } from 'react';
import { ArrowDownToLine, AlertCircle, CheckCircle, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';
import type { ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';
import { ATMDispenserAnimation } from '../../components/ATMDispenserAnimation.tsx';

interface WithdrawProps {
  onNavigate: (view: string) => void;
}

export const Withdraw: React.FC<WithdrawProps> = ({ onNavigate }) => {
  const { account, refreshAccount } = useAuth();
  const { success, error: toastError } = useToast();

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDispenserAnimation, setShowDispenserAnimation] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<ATMReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentAmount = isCustom ? Number(customAmount) : (selectedAmount || 0);

  const remainingDailyLimit = account
    ? Math.max(0, account.dailyWithdrawalLimit - account.dailyWithdrawnToday)
    : 0;

  const handleSelectPredefined = (amt: number) => {
    setSelectedAmount(amt);
    setIsCustom(false);
    setErrorMessage('');
  };

  const handleCustomInput = (val: string) => {
    setCustomAmount(val);
    setIsCustom(true);
    setSelectedAmount(null);
    setErrorMessage('');
  };

  const validateAndProceed = () => {
    setErrorMessage('');

    if (isNaN(currentAmount) || currentAmount <= 0) {
      setErrorMessage('Please select or enter a valid withdrawal amount.');
      return;
    }

    if (currentAmount % 100 !== 0) {
      setErrorMessage('ATM dispensers only dispense currency notes in multiples of ₹100.');
      return;
    }

    if (!account) {
      setErrorMessage('Unable to load bank account details.');
      return;
    }

    if (account.accountStatus !== 'active') {
      setErrorMessage(`Your account is currently ${account.accountStatus}. Cash withdrawal is blocked.`);
      return;
    }

    if (currentAmount > account.balance) {
      setErrorMessage(
        `Insufficient balance. You requested ₹${currentAmount.toLocaleString('en-IN')}, but available balance is ₹${account.balance.toLocaleString('en-IN')}.`
      );
      return;
    }

    if (currentAmount > remainingDailyLimit) {
      setErrorMessage(
        `Withdrawal exceeds your remaining daily limit of ₹${remainingDailyLimit.toLocaleString('en-IN')}.`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmWithdrawal = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setErrorMessage('');

    const idempotencyKey = `WITHDRAW-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await api.customer.withdraw({
        amount: currentAmount,
        idempotencyKey,
      });

      // Start ATM mechanical dispensing simulation
      setShowDispenserAnimation(true);
      setActiveReceipt(res.receipt);
      await refreshAccount();

      success(
        'Withdrawal Successful!',
        `Amount: ₹${currentAmount.toLocaleString('en-IN')} | Remaining: ₹${res.remainingBalance.toLocaleString('en-IN')}`
      );
    } catch (err: any) {
      const msg = err.message || 'Withdrawal failed. Please check balance.';
      setErrorMessage(msg);
      toastError('Transaction Rejected', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">ATM Cash Withdrawal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select standard banknote denominations or enter custom cash amount in multiples of ₹100
        </p>
      </div>

      {/* Account Info Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Account</span>
            <span className="font-mono text-xs font-bold text-slate-800">{account?.accountNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">Available Balance:</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">
              ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Remaining Daily Limit:</span>
            <span className="font-mono font-bold text-slate-700">
              ₹{remainingDailyLimit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transaction Denied</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Withdrawal Selection Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Quick Predefined Denominations (INR ₹)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {predefinedAmounts.map((amt) => {
              const isSelected = !isCustom && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPredefined(amt)}
                  className={`p-4 rounded-2xl border text-center font-mono transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-extrabold shadow-xs ring-2 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800 font-bold'
                  }`}
                >
                  <span className="text-base block">₹{amt.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 font-sans font-normal mt-0.5 block">
                    Fast Cash
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Or Enter Custom Amount (Multiples of ₹100)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 font-mono">₹</span>
            <input
              type="number"
              step="100"
              placeholder="e.g. 3500"
              value={customAmount}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Minimum withdrawal: ₹100 · Maximum per transaction: ₹25,000
          </span>
        </div>

        {/* Summary & Trigger */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Selected Withdrawal:</span>
            <span className="text-xl font-mono font-extrabold text-[#102A43]">
              ₹{currentAmount > 0 ? currentAmount.toLocaleString('en-IN') : '0.00'}
            </span>
          </div>

          <button
            type="button"
            onClick={validateAndProceed}
            disabled={isProcessing || currentAmount <= 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Process Cash Out</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Confirm ATM Cash Withdrawal</h3>
              <p className="text-xs text-slate-500">
                Please verify transaction details before the ATM dispenser dispenses cash notes.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Withdrawal Amount:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  ₹{currentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono text-slate-800">{account?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance After:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ₹{account ? (account.balance - currentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Authorize & Dispense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATM Dispenser Shutter Animation */}
      <ATMDispenserAnimation
        isOpen={showDispenserAnimation}
        type="WITHDRAWAL"
        amount={currentAmount}
        onComplete={() => {
          setShowDispenserAnimation(false);
        }}
      />

      {/* Final Digital ATM Receipt */}
      <ATMReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
