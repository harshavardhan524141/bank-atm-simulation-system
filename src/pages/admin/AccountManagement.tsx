import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, CreditCard, ShieldAlert, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { BankAccount } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';

interface AccountManagementProps {
  onNavigate: (view: string) => void;
}

export const AccountManagement: React.FC<AccountManagementProps> = () => {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<
    (BankAccount & { holderName: string; holderEmail: string; holderPhone: string })[]
  >([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Freeze Modal State
  const [selectedAccount, setSelectedAccount] = useState<
    (BankAccount & { holderName: string; holderEmail: string; holderPhone: string }) | null
  >(null);
  const [shouldFreeze, setShouldFreeze] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchAccounts = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const res = await api.admin.getAccounts(searchTerm);
      setAccounts(res.accounts);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts(search);
  };

  const openFreezeModal = (
    acc: BankAccount & { holderName: string; holderEmail: string; holderPhone: string },
    freeze: boolean
  ) => {
    setSelectedAccount(acc);
    setShouldFreeze(freeze);
    setReason('');
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (!reason.trim()) {
      toastError('Reason Required', 'An administrative audit reason is required to freeze/unfreeze accounts.');
      return;
    }

    setIsUpdating(true);
    try {
      await api.admin.freezeAccount(selectedAccount.accountId, shouldFreeze, reason.trim());
      success(
        shouldFreeze ? 'Account Frozen' : 'Account Reactivated',
        `Account ${selectedAccount.accountNumber} has been updated in ledger.`
      );
      setSelectedAccount(null);
      fetchAccounts(search);
    } catch (err: any) {
      toastError('Action Failed', err.message || 'Could not update account freeze state.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Bank Account Ledger & Liquidity Protection</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect provisioned customer accounts, check balances, and execute compliance freezes
        </p>
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by account number, holder name, account ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>
        <button
          onClick={() => fetchAccounts(search)}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading bank accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No bank accounts found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Account Number</th>
                  <th className="px-6 py-3.5">Account Holder</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Ledger Balance</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Freeze Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.accountId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {acc.accountNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{acc.holderName}</p>
                      <p className="text-[11px] text-slate-400">{acc.holderEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-700 uppercase">{acc.accountType}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-slate-900">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          acc.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            acc.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{acc.accountStatus}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {acc.accountStatus === 'active' ? (
                        <button
                          onClick={() => openFreezeModal(acc, true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold ml-auto transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Freeze Account</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openFreezeModal(acc, false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold ml-auto transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unfreeze Account</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Freeze Action Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                  shouldFreeze ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {shouldFreeze ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">
                {shouldFreeze ? 'Freeze Bank Account' : 'Reactivate / Unfreeze Bank Account'}
              </h3>
              <p className="text-xs text-slate-500">
                Target: <strong className="text-slate-800">{selectedAccount.holderName}</strong> (
                {selectedAccount.accountNumber})
              </p>
            </div>

            <form onSubmit={handleFreezeSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {shouldFreeze
                    ? 'Freezing prevents all ATM withdrawals, deposits, and outgoing fund transfers for this customer.'
                    : 'Unfreezing will restore full ATM operations and outgoing transfer capabilities.'}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Compliance Audit Justification (Mandatory)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify regulatory or risk reason for audit trail..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition-colors shadow-xs ${
                    shouldFreeze ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isUpdating ? 'Recording...' : shouldFreeze ? 'Freeze Now' : 'Unfreeze Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
