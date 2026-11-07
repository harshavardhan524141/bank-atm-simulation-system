import React, { useState } from 'react';
import { ArrowUpFromLine, AlertCircle, CheckCircle, CreditCard, Banknote, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';
import type { ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';
import { ATMDispenserAnimation } from '../../components/ATMDispenserAnimation.tsx';

interface DepositProps {
  onNavigate: (view: string) => void;
}

export const Deposit: React.FC<DepositProps> = ({ onNavigate }) => {
  const { account, refreshAccount } = useAuth();
  const { success, error: toastError } = useToast();

  const presets = [1000, 2000, 5000, 10000, 20000, 50000];
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Denominations counter
  const [notes500, setNotes500] = useState<number>(0);
  const [notes200, setNotes200] = useState<number>(0);
  const [notes100, setNotes100] = useState<number>(0);
  const [isNoteCalculatorMode, setIsNoteCalculatorMode] = useState<boolean>(false);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDispenserAnimation, setShowDispenserAnimation] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<ATMReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const calculatedFromNotes = notes500 * 500 + notes200 * 200 + notes100 * 100;
  const currentAmount = isNoteCalculatorMode
    ? calculatedFromNotes
    : isCustom
    ? Number(customAmount)
    : (selectedPreset || 0);

  const handleSelectPreset = (amt: number) => {
    setSelectedPreset(amt);
    setIsCustom(false);
    setIsNoteCalculatorMode(false);
    setErrorMessage('');
  };

  const handleCustomInput = (val: string) => {
    setCustomAmount(val);
    setIsCustom(true);
    setSelectedPreset(null);
    setIsNoteCalculatorMode(false);
    setErrorMessage('');
  };

  const validateAndProceed = () => {
    setErrorMessage('');

    if (isNaN(currentAmount) || currentAmount <= 0) {
      setErrorMessage('Please specify a valid cash deposit amount greater than ₹0.');
      return;
    }

    if (currentAmount % 100 !== 0) {
      setErrorMessage('Deposit currency must be in denominations of ₹100, ₹200, or ₹500.');
      return;
    }

    if (!account) {
      setErrorMessage('Bank account details not loaded.');
      return;
    }

    if (account.accountStatus !== 'active') {
      setErrorMessage(`Your bank account is currently ${account.accountStatus}. Cash deposits are locked.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmDeposit = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setErrorMessage('');

    const idempotencyKey = `DEPOSIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await api.customer.deposit({
        amount: currentAmount,
        idempotencyKey,
      });

      setShowDispenserAnimation(true);
      setActiveReceipt(res.receipt);
      await refreshAccount();

      success(
        'Cash Deposit Accepted!',
        `Amount: ₹${currentAmount.toLocaleString('en-IN')} | New Balance: ₹${res.updatedBalance.toLocaleString('en-IN')}`
      );
    } catch (err: any) {
      const msg = err.message || 'Deposit failed to process.';
      setErrorMessage(msg);
      toastError('Deposit Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">ATM Cash Deposit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deposit cash notes directly into the digital ATM acceptor slot with instant balance credit
        </p>
      </div>

      {/* Account Info Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Crediting Account</span>
            <span className="font-mono text-xs font-bold text-slate-800">{account?.accountNumber}</span>
          </div>
        </div>

        <div className="text-xs text-right">
          <span className="text-slate-400 block">Current Balance:</span>
          <span className="font-mono font-bold text-emerald-600 text-sm">
            ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Deposit Issue</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setIsNoteCalculatorMode(false)}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            !isNoteCalculatorMode
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quick Presets & Amount
        </button>
        <button
          type="button"
          onClick={() => {
            setIsNoteCalculatorMode(true);
            setIsCustom(false);
            setSelectedPreset(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            isNoteCalculatorMode
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Banknote Denominations Counter
        </button>
      </div>

      {/* Mode 1: Presets & Custom Input */}
      {!isNoteCalculatorMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Standard Deposit Presets (INR ₹)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {presets.map((amt) => {
                const isSelected = !isCustom && selectedPreset === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`p-4 rounded-2xl border text-center font-mono transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-extrabold shadow-xs ring-2 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800 font-bold'
                    }`}
                  >
                    <span className="text-base block">₹{amt.toLocaleString('en-IN')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Or Enter Custom Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 font-mono">₹</span>
              <input
                type="number"
                step="100"
                placeholder="e.g. 15000"
                value={customAmount}
                onChange={(e) => handleCustomInput(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Banknote Denominations Counter */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Count Inserted Banknotes
          </label>
          <div className="space-y-3">
            {[
              { label: '₹500 Notes', count: notes500, setter: setNotes500, value: 500 },
              { label: '₹200 Notes', count: notes200, setter: setNotes200, value: 200 },
              { label: '₹100 Notes', count: notes100, setter: setNotes100, value: 100 },
            ].map((denom) => (
              <div
                key={denom.label}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-800">{denom.label}</span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      Subtotal: ₹{(denom.count * denom.value).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => denom.setter(Math.max(0, denom.count - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-slate-900">
                    {denom.count}
                  </span>
                  <button
                    type="button"
                    onClick={() => denom.setter(denom.count + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Strip */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs text-slate-500 block">Total Deposit Amount:</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-600">
            ₹{currentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          onClick={validateAndProceed}
          disabled={isProcessing || currentAmount <= 0}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          <span>Insert & Deposit Cash</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <ArrowUpFromLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Confirm ATM Cash Deposit</h3>
              <p className="text-xs text-slate-500">
                Place banknotes into the cash acceptor slot and confirm ledger crediting.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Amount:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  ₹{currentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Crediting Account:</span>
                <span className="font-mono text-slate-800">{account?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated Balance After:</span>
                <span className="font-mono font-bold text-blue-700">
                  ₹{account ? (account.balance + currentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
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
                onClick={handleConfirmDeposit}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                Accept & Credit Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATM Shutter Animation */}
      <ATMDispenserAnimation
        isOpen={showDispenserAnimation}
        type="DEPOSIT"
        amount={currentAmount}
        onComplete={() => {
          setShowDispenserAnimation(false);
        }}
      />

      {/* Digital Receipt */}
      <ATMReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
