import React, { useState, useEffect } from 'react';
import { Search, Filter, Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck, Download } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Transaction, ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';
import { useToast } from '../../components/Toast.tsx';

interface TransactionManagementProps {
  onNavigate: (view: string) => void;
}

export const TransactionManagement: React.FC<TransactionManagementProps> = () => {
  const { success } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ATMReceiptData | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getTransactions(search, type);
      setTransactions(res.transactions);
    } catch (err) {
      console.error('Failed to load admin transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const viewReceiptForTx = (tx: Transaction) => {
    const holder = tx.senderName || tx.receiverName || 'BANK CUSTOMER';
    const acct = tx.senderAccountNumber || tx.receiverAccountNumber || 'ACCT-XXXX-XXXX-XXXX';
    const r: ATMReceiptData = {
      bankName: 'APEX DIGITAL BANK - ATM TERMINAL',
      terminalId: 'ATM-BLR-0492',
      transactionId: tx.transactionId,
      accountHolder: holder,
      maskedAccountNumber: acct.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1-••••-••••-$4'),
      accountType: 'SAVINGS',
      transactionType: tx.transactionType,
      transactionDate: tx.createdAt,
      transactionAmount: tx.amount,
      previousBalance: tx.previousBalance,
      updatedBalance: tx.updatedBalance,
      transactionStatus: tx.transactionStatus,
      recipientAccount: tx.receiverAccountNumber || undefined,
      recipientName: tx.receiverName || undefined,
      referenceNumber: `REF-${tx.transactionId.replace('TXN-', '')}-AUD`,
    };
    setSelectedReceipt(r);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">System Transaction Monitor</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete, unalterable ledger feed of all cash withdrawals, ATM deposits, and inter-bank transfers
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by TXN ID, account number, or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
        >
          <option value="ALL">All Types</option>
          <option value="WITHDRAWAL">Cash Withdrawals</option>
          <option value="DEPOSIT">Cash Deposits</option>
          <option value="TRANSFER">Fund Transfers</option>
        </select>

        <button
          onClick={fetchTransactions}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading ledger transaction stream...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Party / Target</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-700">
                      {tx.transactionId}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          tx.transactionType === 'DEPOSIT'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.transactionType === 'WITHDRAWAL'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {tx.transactionType === 'DEPOSIT' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{tx.transactionType}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{tx.description}</p>
                      {tx.remarks && <p className="text-[11px] text-slate-400 mt-0.5">{tx.remarks}</p>}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        <span>SUCCESS</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => viewReceiptForTx(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Inspect ATM Thermal Slip"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Thermal Receipt Modal */}
      <ATMReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
