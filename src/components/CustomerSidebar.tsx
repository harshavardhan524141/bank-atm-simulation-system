import React from 'react';
import {
  LayoutDashboard,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  History,
  UserCheck,
  Bell,
  Lock,
  LogOut,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface CustomerSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { user, account, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'check-balance', label: 'Check Balance', icon: Eye },
    { id: 'withdraw', label: 'Withdraw Cash', icon: ArrowDownToLine },
    { id: 'deposit', label: 'Deposit Cash', icon: ArrowUpFromLine },
    { id: 'transfer', label: 'Transfer Money', icon: Send },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'account-details', label: 'Account Details', icon: UserCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Security & Password', icon: Lock },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#102A43] text-white border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Quick Account Card */}
          <div className="bg-slate-900/80 border border-blue-500/20 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-300">
              <span className="font-semibold uppercase tracking-wider">Debit Card / Account</span>
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-mono text-xs tracking-wider text-slate-200">
              {account?.accountNumber ? account.accountNumber.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1 •••• •••• $4') : '•••• •••• •••• ••••'}
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Balance</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ₹{account ? account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              ATM Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="truncate text-xs">
              <p className="font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.customerId}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
