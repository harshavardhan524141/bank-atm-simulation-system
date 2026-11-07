import React, { useState, useEffect } from 'react';
import { Landmark, Bell, Shield, User as UserIcon, LogOut, ArrowRight, Menu, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { NotificationItem } from '../types/index.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onToggleSidebar }) => {
  const { user, account, isAuthenticated, isAdmin, logout, quickLoginDemo } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      api.customer.getNotifications()
        .then((res) => {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, isAdmin, currentView]);

  const handleMarkAllRead = async () => {
    try {
      await api.customer.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigate(isAuthenticated ? (isAdmin ? 'admin-dashboard' : 'dashboard') : 'home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#102A43] text-white flex items-center justify-center shadow-xs group-hover:bg-blue-600 transition-colors">
              <Landmark className="w-5 h-5 text-blue-300 group-hover:text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-base font-extrabold text-[#102A43] tracking-tight block">
                APEX BANK
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                ATM Simulation
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line whitespace-nowrap) */}
        {!isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              Services
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              Security
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              About ATM
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
              Role: <strong className="uppercase text-blue-700">{user?.role}</strong>
            </span>
            {account && (
              <span className="hidden lg:inline text-slate-500 font-mono">
                Acct: <strong className="text-slate-800">{account.accountNumber}</strong>
              </span>
            )}
          </div>
        )}

        {/* Zone 3: Primary Action / Auth Profile Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                Register Account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Notification Center */}
              {!isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Notifications ({unreadCount} unread)
                        </h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.notificationId}
                              className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                                !n.isRead ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="pt-2 px-3 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            onNavigate('notifications');
                          }}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User profile capsule */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.fullName.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <span className="font-semibold text-slate-900 block truncate max-w-[120px]">
                    {user?.fullName}
                  </span>
                  <span className="text-slate-400 capitalize block text-[11px]">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                  title="Secure Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Switcher Button for easy testing */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-[11px]">
            <span className="text-slate-400 px-1 font-mono">Demo:</span>
            <button
              onClick={() => quickLoginDemo('customer')}
              className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 font-medium shadow-xs transition-colors"
            >
              Customer
            </button>
            <button
              onClick={() => quickLoginDemo('admin')}
              className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 font-medium shadow-xs transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
