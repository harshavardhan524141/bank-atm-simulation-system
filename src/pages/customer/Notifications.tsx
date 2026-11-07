import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert, ArrowDownLeft, ArrowUpRight, Info } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { NotificationItem } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';

interface NotificationsProps {
  onNavigate: (view: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.customer.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.customer.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.customer.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('Notifications Cleared', 'All alerts marked as read.');
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">Security & Transaction Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts sent to your digital account</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No alerts or notifications recorded.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notificationId}
              onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50/70 ${
                !n.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {n.notificationType === 'SECURITY' ? (
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                ) : n.notificationType === 'TRANSACTION' ? (
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <div className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
