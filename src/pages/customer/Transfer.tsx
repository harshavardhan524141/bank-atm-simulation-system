import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Search, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';
import type { ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';

interface TransferProps {
  onNavigate: (view: string) => void;
}

export const Transfer: React.FC<TransferProps> = ({ onNavigate }) => {
  const { account, refreshAccount } = useAuth();
  const { success, error: toastError } = useToast();

  const [receiverAccount, setReceiverAccount] = useState<string>('');
  const [recipientInfo, setRecipientInfo] = useState<{
    valid: boolean;
    recipientName: string;
    accountType: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');

  const [amount, setAmount] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transferReceipt, setTransferReceipt] = useState<ATMReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sample quick targets for smooth testing
  const sampleRecipients = [
    { name: 'Sarah Connor', account: 'ACCT-5820-1940-7731', type: 'CURRENT' },
    { name: 'Priya Sharma', account: 'ACCT-9102-3341-6508', type: 'SAVINGS' },
  ];

  const verifyRecipient = async (accNum: string) => {
    const clean = accNum.trim();
    if (!clean) return;

    setIsVerifying(true);
    setVerifyError('');
    setRecipientInfo(null);

    try {
      const res = await api.customer.verifyRecipient(clean);
      setRecipientInfo({
        valid: true,
        recipientName: res.recipientName,
        accountType: res.accountType,
      });
    } catch (err: any) {
      setVerifyError(err.message || 'Recipient account not found');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectSample = (sampleAcc: string) => {
    setReceiverAccount(sampleAcc);
    verifyRecipient(sampleAcc);
  };

  const validateTransfer = () => {
    setErrorMessage('');
    const numAmount = Number(amount);

    if (!receiverAccount) {
      setErrorMessage('Please enter the recipient bank account number.');
      return;
    }

    if (!recipientInfo || !recipientInfo.valid) {
      setErrorMessage('Please verify recipient account before initiating transfer.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount greater than ₹0.');
      return;
    }

    if (!account) {
      setErrorMessage('Sender account details unavailable.');
      return;
    }

    if (account.accountStatus !== 'active') {
      setErrorMessage(`Your account is currently ${account.accountStatus}. Fund transfers are restricted.`);
      return;
    }

    if (numAmount > account.balance) {
      setErrorMessage(
        `Insufficient balance for transfer. Available balance: ₹${account.balance.toLocaleString('en-IN')}, Requested: ₹${numAmount.toLocaleString('en-IN')}`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setErrorMessage('');

    const idempotencyKey = `TRANSFER-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await api.customer.transfer({
        receiverAccountNumber: receiverAccount.trim(),
        amount: Number(amount),
        remarks,
        idempotencyKey,
      });

      setTransferReceipt(res.receipt);
      await refreshAccount();
      setAmount('');
      setRemarks('');
      setRecipientInfo(null);
      setReceiverAccount('');

      success(
        'Fund Transfer Executed!',
        `Transferred ₹${Number(amount).toLocaleString('en-IN')} to ${res.receipt.recipientName}`
      );
    } catch (err: any) {
      const msg = err.message || 'Transfer failed to process';
      setErrorMessage(msg);
      toastError('Transfer Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Inter-Bank Fund Transfer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Atomic dual-leg fund transfer with real-time recipient verification and instant ledger settlement
        </p>
      </div>

      {/* Account Info Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Debit Source Account</span>
          <span className="font-mono text-xs font-bold text-slate-800">{account?.accountNumber}</span>
        </div>

        <div className="text-xs text-right">
          <span className="text-slate-400 block">Available Balance:</span>
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
            <p className="font-bold">Transfer Blocked</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Transfer Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Sample Targets Helper */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
          <span className="text-xs font-bold text-blue-900 block mb-1.5">
            Quick Test Accounts (Click to auto-verify):
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleRecipients.map((s) => (
              <button
                key={s.account}
                type="button"
                onClick={() => handleSelectSample(s.account)}
                className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 hover:border-blue-600 text-xs text-slate-800 font-medium transition-all shadow-2xs text-left"
              >
                <span className="font-bold">{s.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{s.account}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Account Input with Verify Button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Recipient Bank Account Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ACCT-XXXX-XXXX-XXXX"
                value={receiverAccount}
                onChange={(e) => {
                  setReceiverAccount(e.target.value);
                  setRecipientInfo(null);
                  setVerifyError('');
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              />
            </div>
            <button
              type="button"
              onClick={() => verifyRecipient(receiverAccount)}
              disabled={isVerifying || !receiverAccount.trim()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              {isVerifying ? 'Checking...' : 'Verify Account'}
            </button>
          </div>

          {/* Verification feedback */}
          {recipientInfo && (
            <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500">Verified Recipient:</span>{' '}
                <strong className="font-bold text-slate-900">{recipientInfo.recipientName}</strong> (
                {recipientInfo.accountType} Account)
              </div>
            </div>
          )}

          {verifyError && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}
        </div>

        {/* Transfer Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Transfer Amount (INR ₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 font-mono">₹</span>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Remarks / Purpose (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Project fee, Rent reimbursement"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={validateTransfer}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Review & Confirm Transfer</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Confirm Fund Transfer</h3>
              <p className="text-xs text-slate-500">
                This transaction will immediately deduct funds from your account and credit the receiver.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Transfer:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-800">{recipientInfo?.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Account:</span>
                <span className="font-mono text-slate-800">{receiverAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Your Balance After:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ₹{account ? (account.balance - Number(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
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
                onClick={handleExecuteTransfer}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Transfer Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt */}
      <ATMReceiptModal receipt={transferReceipt} onClose={() => setTransferReceipt(null)} />
    </div>
  );
};
