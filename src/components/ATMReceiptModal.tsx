import React from 'react';
import { Printer, Download, CheckCircle, X, ShieldCheck } from 'lucide-react';
import type { ATMReceiptData } from '../types/index.ts';

interface ATMReceiptModalProps {
  receipt: ATMReceiptData | null;
  onClose: () => void;
}

export const ATMReceiptModal: React.FC<ATMReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
========================================
       APEX DIGITAL BANK - ATM
     DIGITAL TRANSACTION RECEIPT
========================================
TERMINAL ID     : ${receipt.terminalId}
TRANSACTION ID  : ${receipt.transactionId}
REFERENCE NO    : ${receipt.referenceNumber}
DATE & TIME     : ${new Date(receipt.transactionDate).toLocaleString('en-IN')}
----------------------------------------
CARDHOLDER      : ${receipt.accountHolder.toUpperCase()}
ACCOUNT NUMBER  : ${receipt.maskedAccountNumber}
ACCOUNT TYPE    : ${receipt.accountType}
TRANSACTION     : ${receipt.transactionType}
STATUS          : ${receipt.transactionStatus}
${receipt.recipientAccount ? `RECIPIENT ACCT  : ${receipt.recipientAccount}\n` : ''}${
      receipt.recipientName ? `RECIPIENT NAME  : ${receipt.recipientName}\n` : ''
    }----------------------------------------
AMOUNT          : INR ₹${receipt.transactionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
PREVIOUS BAL    : INR ₹${receipt.previousBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
UPDATED BALANCE : INR ₹${receipt.updatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
----------------------------------------
THANK YOU FOR BANKING WITH APEX BANK
24x7 CUSTOMER CARE: 1800-420-APEX
ENCRYPTED TRANSACTION VERIFIED
========================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATM-Receipt-${receipt.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-[#102A43] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm tracking-wider">
              AB
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">ATM Digital Receipt</h3>
              <p className="text-xs text-blue-200">Apex Terminal #0492</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close receipt modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Slip Area */}
        <div id="atm-printable-receipt" className="p-6 bg-[#FCFDFE]">
          <div className="border border-slate-200 border-dashed rounded-xl p-5 bg-white shadow-xs font-mono text-xs text-slate-700 space-y-4">
            {/* Bank Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-[#102A43] uppercase tracking-wider font-sans">
                Apex Digital Bank
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">Automated Teller Machine Record</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-sans font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Transaction Approved
              </div>
            </div>

            {/* Transaction Data Rows */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Terminal:</span>
                <span className="font-semibold">{receipt.terminalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Txn ID:</span>
                <span className="font-semibold text-blue-700">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date/Time:</span>
                <span>{new Date(receipt.transactionDate).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cardholder:</span>
                <span className="font-semibold">{receipt.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span>{receipt.maskedAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span>{receipt.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-bold text-slate-900">{receipt.transactionType}</span>
              </div>
              {receipt.recipientAccount && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-semibold text-right">
                    {receipt.recipientName ? `${receipt.recipientName} (${receipt.recipientAccount})` : receipt.recipientAccount}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="border-t border-b border-slate-200 py-3 space-y-1.5">
              <div className="flex justify-between text-sm font-bold text-slate-900">
                <span>Amount:</span>
                <span className="text-blue-700">
                  ₹{receipt.transactionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Previous Balance:</span>
                <span>₹{receipt.previousBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Updated Balance:</span>
                <span className="text-emerald-700 font-bold">
                  ₹{receipt.updatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Stylized Barcode */}
            <div className="pt-2 text-center space-y-1">
              <div className="h-9 w-48 mx-auto flex items-stretch justify-center gap-0.5 opacity-80">
                {[4, 2, 6, 1, 3, 5, 2, 7, 3, 2, 5, 1, 4, 6, 2, 3, 5, 2, 6, 1, 3, 4, 5, 2, 7, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="bg-slate-800"
                      style={{ width: `${w}px`, opacity: i % 2 === 0 ? 0.9 : 0.6 }}
                    />
                  )
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">{receipt.referenceNumber}</p>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Certified 256-Bit Cryptographic ATM Ledger Record</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Done
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
