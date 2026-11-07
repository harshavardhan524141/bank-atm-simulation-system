import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Transaction, ATMReceiptData } from '../../types/index.ts';
import { ATMReceiptModal } from '../../components/ATMReceiptModal.tsx';
import { useToast } from '../../components/Toast.tsx';

interface TransactionHistoryProps {
  onNavigate: (view: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = () => {
  const { user, account } = useAuth();
  const { success } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  const [selectedReceipt, setSelectedReceipt] = useState<ATMReceiptData | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.customer.getTransactions({
        search,
        type,
        startDate,
        endDate,
        sortBy,
        page,
        limit: 10,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('date_desc');
    setPage(1);
    setTimeout(fetchTransactions, 50);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Type',
      'Date & Time',
      'Description',
      'Amount (INR)',
      'Previous Balance',
      'Updated Balance',
      'Status',
    ];

    const rows = transactions.map((t) => {
      const isDebit =
        t.transactionType === 'WITHDRAWAL' ||
        (t.transactionType === 'TRANSFER' && t.senderAccountId === account?.accountId);

      return [
        t.transactionId,
        t.transactionType,
        `"${new Date(t.createdAt).toLocaleString('en-IN')}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        `${isDebit ? '-' : '+'}${t.amount}`,
        t.previousBalance,
        t.updatedBalance,
        t.transactionStatus,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex-Bank-Statement-${account?.accountNumber || 'account'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Statement Exported', 'CSV statement file downloaded successfully.');
  };

  const viewReceipt = (tx: Transaction) => {
    if (!user || !account) return;
    const r: ATMReceiptData = {
      bankName: 'APEX DIGITAL BANK - ATM TERMINAL',
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
    setSelectedReceipt(r);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official banking statement, real-time ledger entries, and verifiable ATM slips
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Statement (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by TXN ID, description, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="WITHDRAWAL">Cash Withdrawals</option>
            <option value="DEPOSIT">Cash Deposits</option>
            <option value="TRANSFER">Fund Transfers</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Filter
          </button>

          {(search || type !== 'ALL' || startDate || endDate || sortBy !== 'date_desc') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Reset
            </button>
          )}
        </form>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setPage(1);
                fetchTransactions();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
            >
              Apply Date
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading verified transaction records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions matched your selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Description & Counterparty</th>
                  <th className="px-6 py-3.5 text-right">Debit / Credit</th>
                  <th className="px-6 py-3.5 text-right">Updated Balance</th>
                  <th className="px-6 py-3.5 text-center">ATM Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isDebit =
                    tx.transactionType === 'WITHDRAWAL' ||
                    (tx.transactionType === 'TRANSFER' && tx.senderAccountId === account?.accountId);

                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
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
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{tx.description}</p>
                        {tx.remarks && <p className="text-[11px] text-slate-400 mt-0.5">{tx.remarks}</p>}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                          isDebit ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                        ₹{tx.updatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewReceipt(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Digital Receipt"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {transactions.length} of {total} total transactions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ATM Receipt Modal */}
      <ATMReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
