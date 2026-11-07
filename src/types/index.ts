export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type AccountStatus = 'active' | 'frozen' | 'inactive';
export type AccountType = 'SAVINGS' | 'CURRENT' | 'SALARY';
export type TransactionType = 'WITHDRAWAL' | 'DEPOSIT' | 'TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface User {
  userId: string;
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  username: string;
  role: UserRole;
  accountStatus: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BankAccount {
  accountId: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  accountStatus: AccountStatus;
  dailyWithdrawalLimit: number;
  dailyWithdrawnToday: number;
  lastWithdrawalDate: string;
  createdAt: string;
}

export interface Transaction {
  transactionId: string;
  senderAccountId: string | null;
  senderAccountNumber: string | null;
  senderName: string | null;
  receiverAccountId: string | null;
  receiverAccountNumber: string | null;
  receiverName: string | null;
  transactionType: TransactionType;
  amount: number;
  previousBalance: number;
  updatedBalance: number;
  description: string;
  remarks?: string;
  transactionStatus: TransactionStatus;
  idempotencyKey?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  notificationType: 'TRANSACTION' | 'SECURITY' | 'ACCOUNT';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetType: string;
  description: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  account?: BankAccount;
}

export interface ATMReceiptData {
  bankName: string;
  terminalId: string;
  transactionId: string;
  accountHolder: string;
  maskedAccountNumber: string;
  accountType: AccountType;
  transactionType: TransactionType;
  transactionDate: string;
  transactionAmount: number;
  previousBalance: number;
  updatedBalance: number;
  transactionStatus: TransactionStatus;
  recipientAccount?: string;
  recipientName?: string;
  referenceNumber: string;
}
