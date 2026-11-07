import type {
  User,
  BankAccount,
  Transaction,
  NotificationItem,
  AuditLog,
  ATMReceiptData,
} from '../types/index.ts';

const TOKEN_KEY = 'apex_atm_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { identifier: string; password: string }) =>
      request<{ message: string; user: User; account?: BankAccount; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (payload: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      dateOfBirth: string;
      username: string;
      password: string;
      accountType?: 'SAVINGS' | 'CURRENT';
    }) =>
      request<{ message: string; user: User; account: BankAccount; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      }),

    me: () =>
      request<{ user: User; account?: BankAccount }>('/api/auth/me'),

    changePassword: (passwords: { oldPassword: string; newPassword: string }) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      }),
  },

  customer: {
    getAccount: () =>
      request<{ account: BankAccount; user: User }>('/api/customer/account'),

    withdraw: (payload: { amount: number; idempotencyKey?: string }) =>
      request<{
        message: string;
        transaction: Transaction;
        receipt: ATMReceiptData;
        remainingBalance: number;
      }>('/api/customer/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    deposit: (payload: { amount: number; idempotencyKey?: string }) =>
      request<{
        message: string;
        transaction: Transaction;
        receipt: ATMReceiptData;
        updatedBalance: number;
      }>('/api/customer/deposit', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    verifyRecipient: (accountNumber: string) =>
      request<{
        valid: boolean;
        accountNumber: string;
        accountType: string;
        recipientName: string;
      }>(`/api/customer/transfer/verify-recipient?accountNumber=${encodeURIComponent(accountNumber)}`),

    transfer: (payload: {
      receiverAccountNumber: string;
      amount: number;
      remarks?: string;
      idempotencyKey?: string;
    }) =>
      request<{
        message: string;
        transaction: Transaction;
        receipt: ATMReceiptData;
        remainingBalance: number;
      }>('/api/customer/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getTransactions: (params?: {
      type?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.type) q.set('type', params.type);
      if (params?.search) q.set('search', params.search);
      if (params?.startDate) q.set('startDate', params.startDate);
      if (params?.endDate) q.set('endDate', params.endDate);
      if (params?.sortBy) q.set('sortBy', params.sortBy);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));

      return request<{
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/api/customer/transactions?${q.toString()}`);
    },

    getNotifications: () =>
      request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/customer/notifications'),

    markNotificationRead: (id: string) =>
      request<{ success: boolean }>(`/api/customer/notifications/${id}/read`, {
        method: 'POST',
      }),

    markAllNotificationsRead: () =>
      request<{ success: boolean }>('/api/customer/notifications/mark-all-read', {
        method: 'POST',
      }),

    updateProfile: (profile: { phone?: string; address?: string }) =>
      request<{ message: string; user: User }>('/api/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
  },

  admin: {
    getStats: () =>
      request<{
        stats: {
          totalCustomers: number;
          activeCustomers: number;
          totalBankAccounts: number;
          frozenAccounts: number;
          totalDeposits: number;
          totalDepositVolume: number;
          totalWithdrawals: number;
          totalWithdrawalVolume: number;
          totalTransfers: number;
          totalTransferVolume: number;
          totalTransactionVolume: number;
          totalSystemVault: number;
        };
      }>('/api/admin/stats'),

    getCustomers: (search?: string) =>
      request<{
        customers: (User & { account?: BankAccount })[];
      }>(`/api/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    updateCustomerStatus: (userId: string, status: 'active' | 'inactive' | 'suspended', reason?: string) =>
      request<{ message: string; user: User }>(`/api/admin/customers/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),

    getAccounts: (search?: string) =>
      request<{
        accounts: (BankAccount & { holderName: string; holderEmail: string; holderPhone: string })[];
      }>(`/api/admin/accounts${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    freezeAccount: (accountId: string, freeze: boolean, reason?: string) =>
      request<{ message: string; account: BankAccount }>(`/api/admin/accounts/${accountId}/freeze`, {
        method: 'PATCH',
        body: JSON.stringify({ freeze, reason }),
      }),

    getTransactions: (search?: string, type?: string) => {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (type) q.set('type', type);
      return request<{ transactions: Transaction[] }>(`/api/admin/transactions?${q.toString()}`);
    },

    getReports: () =>
      request<{
        summary: {
          totalDeposits: number;
          totalDepositVol: number;
          totalWithdrawals: number;
          totalWithdrawalVol: number;
          totalTransfers: number;
          totalTransferVol: number;
          totalTransactions: number;
          grandTotalVolume: number;
        };
        dailyTrend: {
          date: string;
          deposits: number;
          withdrawals: number;
          transfers: number;
          volume: number;
        }[];
      }>('/api/admin/reports'),

    getAuditLogs: () =>
      request<{ logs: AuditLog[] }>('/api/admin/audit-logs'),

    seedReset: () =>
      request<{ message: string }>('/api/admin/seed-reset', {
        method: 'POST',
      }),
  },
};
