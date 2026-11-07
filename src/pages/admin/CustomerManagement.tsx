import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShieldAlert, ShieldCheck, Filter, UserX, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { User, BankAccount } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';

interface CustomerManagementProps {
  onNavigate: (view: string) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = () => {
  const { success, error: toastError } = useToast();
  const [customers, setCustomers] = useState<(User & { account?: BankAccount })[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status Change Modal
  const [selectedCustomer, setSelectedCustomer] = useState<(User & { account?: BankAccount }) | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [reason, setReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchCustomers = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const res = await api.admin.getCustomers(searchTerm);
      setCustomers(res.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const openStatusModal = (cust: User & { account?: BankAccount }, status: 'active' | 'inactive' | 'suspended') => {
    setSelectedCustomer(cust);
    setNewStatus(status);
    setReason('');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (!reason.trim()) {
      toastError('Reason Required', 'Please provide a compliance reason for the customer status update.');
      return;
    }

    setIsUpdating(true);
    try {
      await api.admin.updateCustomerStatus(selectedCustomer.userId, newStatus, reason.trim());
      success('Customer Status Updated', `${selectedCustomer.fullName} is now set to ${newStatus.toUpperCase()}`);
      setSelectedCustomer(null);
      fetchCustomers(search);
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update customer status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Customer Directory & Access Control</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer KYC information, examine linked bank accounts, and enforce compliance actions
        </p>
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, email, ID, or account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>
        <button
          onClick={() => fetchCustomers(search)}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No customers found matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Account Number</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5 text-right">Balance</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center uppercase">
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: {c.customerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.account ? (
                        <div>
                          <span className="font-mono font-bold text-slate-800">{c.account.accountNumber}</span>
                          <span className="text-[10px] text-blue-600 block uppercase font-semibold">
                            {c.account.accountType}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No Account</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p>{c.email}</p>
                      <p className="text-[11px] text-slate-400">{c.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-slate-800">
                      ₹{c.account ? c.account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.accountStatus === 'suspended'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.accountStatus === 'active'
                              ? 'bg-emerald-500'
                              : c.accountStatus === 'suspended'
                              ? 'bg-rose-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{c.accountStatus}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {c.accountStatus !== 'active' && (
                        <button
                          onClick={() => openStatusModal(c, 'active')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      {c.accountStatus !== 'suspended' && (
                        <button
                          onClick={() => openStatusModal(c, 'suspended')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                        >
                          Suspend
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

      {/* Compliance Status Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102A43]">Update Customer Status</h3>
              <p className="text-xs text-slate-500">
                You are modifying the administrative standing of{' '}
                <strong className="text-slate-900">{selectedCustomer.fullName}</strong>.
              </p>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Target Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="active">ACTIVE - Allow all operations</option>
                  <option value="inactive">INACTIVE - Restrict new transactions</option>
                  <option value="suspended">SUSPENDED - Complete access lock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Compliance Audit Justification (Mandatory)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State reason for audit log entry (e.g. Identity reverification completed)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                >
                  {isUpdating ? 'Recording...' : 'Commit Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
