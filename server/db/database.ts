import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  BankAccount,
  Transaction,
  NotificationItem,
  AuditLog,
  TransactionType,
  TransactionStatus,
  ATMReceiptData
} from '../../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bank_system.json');

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  accounts: BankAccount[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  sessions: { token: string; userId: string; expiresAt: number }[];
}

// Simple in-process lock to prevent race conditions during financial operations
class AsyncLock {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const run = () => {
        this.locked = true;
        resolve(() => {
          this.locked = false;
          const next = this.queue.shift();
          if (next) next();
        });
      };

      if (!this.locked) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}

const dbLock = new AsyncLock();

// Password hashing utility using scrypt
export function hashPassword(password: string, providedSalt?: string): { hash: string; salt: string } {
  const salt = providedSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculatedHash, 'hex'));
  } catch {
    return false;
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    accounts: [],
    transactions: [],
    notifications: [],
    auditLogs: [],
    sessions: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
        return;
      } catch (err) {
        console.error('Failed to parse existing database file, reseeding:', err);
      }
    }

    this.seedInitialData();
  }

  private persist() {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public seedInitialData() {
    console.log('Seeding initial banking data...');
    const now = new Date();
    const today = getTodayString();

    // 1. Administrators
    const adminPass = hashPassword('AdminPassword@123');
    const adminUser: StoredUser = {
      userId: 'USR-ADMIN-01',
      customerId: 'ADMIN-1001',
      fullName: 'Alexander Vance',
      email: 'admin@apexbank.com',
      phone: '+91 98765 43210',
      address: 'Central Banking Plaza, Tower A, Financial District',
      dateOfBirth: '1984-06-15',
      username: 'admin',
      role: 'admin',
      accountStatus: 'active',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
    };

    // 2. Demo Customers
    const cust1Pass = hashPassword('CustomerPassword@123');
    const cust1User: StoredUser = {
      userId: 'USR-CUST-01',
      customerId: 'CUST-849201',
      fullName: 'Johnathan Doe',
      email: 'john.doe@example.com',
      phone: '+91 98123 45678',
      address: '42 Greenway Boulevard, Silicon Avenue, Tech City',
      dateOfBirth: '1992-04-18',
      username: 'john_doe',
      role: 'customer',
      accountStatus: 'active',
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
      passwordHash: cust1Pass.hash,
      salt: cust1Pass.salt,
    };

    const cust2Pass = hashPassword('CustomerPassword@123');
    const cust2User: StoredUser = {
      userId: 'USR-CUST-02',
      customerId: 'CUST-391084',
      fullName: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      phone: '+91 99234 56789',
      address: '77 Cyberdyne Way, Innovation Park',
      dateOfBirth: '1990-11-28',
      username: 'sarah_connor',
      role: 'customer',
      accountStatus: 'active',
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      passwordHash: cust2Pass.hash,
      salt: cust2Pass.salt,
    };

    const cust3Pass = hashPassword('CustomerPassword@123');
    const cust3User: StoredUser = {
      userId: 'USR-CUST-03',
      customerId: 'CUST-602914',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 97345 67890',
      address: '15 Lotus Heritage, Metro Heights',
      dateOfBirth: '1995-08-12',
      username: 'priya_sharma',
      role: 'customer',
      accountStatus: 'active',
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      passwordHash: cust3Pass.hash,
      salt: cust3Pass.salt,
    };

    // Bank Accounts
    const acc1: BankAccount = {
      accountId: 'ACC-849201',
      userId: cust1User.userId,
      accountNumber: 'ACCT-4091-8823-1092',
      accountType: 'SAVINGS',
      balance: 45500.0,
      accountStatus: 'active',
      dailyWithdrawalLimit: 50000,
      dailyWithdrawnToday: 2000,
      lastWithdrawalDate: today,
      createdAt: cust1User.createdAt,
    };

    const acc2: BankAccount = {
      accountId: 'ACC-391084',
      userId: cust2User.userId,
      accountNumber: 'ACCT-5820-1940-7731',
      accountType: 'CURRENT',
      balance: 12800.0,
      accountStatus: 'active',
      dailyWithdrawalLimit: 100000,
      dailyWithdrawnToday: 0,
      lastWithdrawalDate: today,
      createdAt: cust2User.createdAt,
    };

    const acc3: BankAccount = {
      accountId: 'ACC-602914',
      userId: cust3User.userId,
      accountNumber: 'ACCT-9102-3341-6508',
      accountType: 'SAVINGS',
      balance: 94250.0,
      accountStatus: 'active',
      dailyWithdrawalLimit: 50000,
      dailyWithdrawnToday: 0,
      lastWithdrawalDate: today,
      createdAt: cust3User.createdAt,
    };

    // Realistic Initial Transactions for John Doe
    const tx1: Transaction = {
      transactionId: 'TXN-90214811',
      senderAccountId: null,
      senderAccountNumber: null,
      senderName: null,
      receiverAccountId: acc1.accountId,
      receiverAccountNumber: acc1.accountNumber,
      receiverName: cust1User.fullName,
      transactionType: 'DEPOSIT',
      amount: 50000,
      previousBalance: 0,
      updatedBalance: 50000,
      description: 'Initial Cash Deposit at Apex ATM #01',
      remarks: 'Initial Account Funding',
      transactionStatus: 'SUCCESS',
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    };

    const tx2: Transaction = {
      transactionId: 'TXN-90214812',
      senderAccountId: acc1.accountId,
      senderAccountNumber: acc1.accountNumber,
      senderName: cust1User.fullName,
      receiverAccountId: null,
      receiverAccountNumber: null,
      receiverName: null,
      transactionType: 'WITHDRAWAL',
      amount: 2500,
      previousBalance: 50000,
      updatedBalance: 47500,
      description: 'Cash Withdrawal at Apex ATM #01',
      remarks: 'ATM Cash Withdrawal',
      transactionStatus: 'SUCCESS',
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    };

    const tx3: Transaction = {
      transactionId: 'TXN-90214813',
      senderAccountId: acc1.accountId,
      senderAccountNumber: acc1.accountNumber,
      senderName: cust1User.fullName,
      receiverAccountId: acc2.accountId,
      receiverAccountNumber: acc2.accountNumber,
      receiverName: cust2User.fullName,
      transactionType: 'TRANSFER',
      amount: 5000,
      previousBalance: 47500,
      updatedBalance: 42500,
      description: 'Fund Transfer to Sarah Connor (ACCT-5820-1940-7731)',
      remarks: 'Project reimbursement',
      transactionStatus: 'SUCCESS',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    };

    const tx4: Transaction = {
      transactionId: 'TXN-90214814',
      senderAccountId: null,
      senderAccountNumber: null,
      senderName: null,
      receiverAccountId: acc1.accountId,
      receiverAccountNumber: acc1.accountNumber,
      receiverName: cust1User.fullName,
      transactionType: 'DEPOSIT',
      amount: 5000,
      previousBalance: 42500,
      updatedBalance: 47500,
      description: 'Cash Deposit at Apex ATM #04',
      remarks: 'ATM Cash Deposit',
      transactionStatus: 'SUCCESS',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    };

    const tx5: Transaction = {
      transactionId: 'TXN-90214815',
      senderAccountId: acc1.accountId,
      senderAccountNumber: acc1.accountNumber,
      senderName: cust1User.fullName,
      receiverAccountId: null,
      receiverAccountNumber: null,
      receiverName: null,
      transactionType: 'WITHDRAWAL',
      amount: 2000,
      previousBalance: 47500,
      updatedBalance: 45500,
      description: 'Cash Withdrawal at Apex ATM #02',
      remarks: 'Daily Expense Cash',
      transactionStatus: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    // Notifications
    const notifs: NotificationItem[] = [
      {
        notificationId: 'NOTIF-101',
        userId: cust1User.userId,
        title: 'Welcome to Apex Bank Digital ATM',
        message: 'Your account ACCT-4091-8823-1092 is active and ready for simulated digital transactions.',
        notificationType: 'ACCOUNT',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      },
      {
        notificationId: 'NOTIF-102',
        userId: cust1User.userId,
        title: 'Debit Alert: ₹2,000 Withdrawn',
        message: '₹2,000 was withdrawn at Apex ATM #02. Your updated balance is ₹45,500.00.',
        notificationType: 'TRANSACTION',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    // Audit logs
    const audit: AuditLog[] = [
      {
        logId: 'AUD-001',
        adminId: adminUser.userId,
        adminName: adminUser.fullName,
        action: 'SYSTEM_BOOTSTRAP',
        targetId: 'SYSTEM',
        targetType: 'SYSTEM',
        description: 'Initial Bank ATM Simulation core database initialized with default configurations.',
        timestamp: new Date(now.getTime() - 45 * 86400000).toISOString(),
      },
      {
        logId: 'AUD-002',
        adminId: adminUser.userId,
        adminName: adminUser.fullName,
        action: 'CUSTOMER_VERIFICATION',
        targetId: cust1User.userId,
        targetType: 'USER',
        description: 'Customer Johnathan Doe verified and granted Standard Savings privileges.',
        timestamp: new Date(now.getTime() - 40 * 86400000).toISOString(),
      },
    ];

    this.data = {
      users: [adminUser, cust1User, cust2User, cust3User],
      accounts: [acc1, acc2, acc3],
      transactions: [tx1, tx2, tx3, tx4, tx5],
      notifications: notifs,
      auditLogs: audit,
      sessions: [],
    };

    this.persist();
  }

  // Session handling
  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    this.data.sessions.push({ token, userId, expiresAt });
    this.persist();
    return token;
  }

  public validateSession(token: string): StoredUser | null {
    const session = this.data.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;
    return this.data.users.find((u) => u.userId === session.userId) || null;
  }

  public removeSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  // User queries
  public findUserById(userId: string): StoredUser | null {
    return this.data.users.find((u) => u.userId === userId) || null;
  }

  public findUserByUsernameOrEmail(identifier: string): StoredUser | null {
    const clean = identifier.trim().toLowerCase();
    return (
      this.data.users.find(
        (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
      ) || null
    );
  }

  public getAllUsers(): User[] {
    // Return sanitized users without password hash & salt
    return this.data.users.map(({ passwordHash, salt, ...rest }) => rest);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    username: string;
    password: string;
    accountType?: 'SAVINGS' | 'CURRENT';
  }): { user: User; account: BankAccount } {
    const existing = this.findUserByUsernameOrEmail(userData.username);
    if (existing) {
      throw new Error('Username is already registered');
    }
    const existingEmail = this.findUserByUsernameOrEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email address is already registered');
    }

    const { hash, salt } = hashPassword(userData.password);
    const userId = `USR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const customerId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate formatted account number ACCT-XXXX-XXXX-XXXX
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `ACCT-${p1}-${p2}-${p3}`;
    const accountId = `ACC-${customerId.replace('CUST-', '')}`;

    const newUser: StoredUser = {
      userId,
      customerId,
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      address: userData.address.trim(),
      dateOfBirth: userData.dateOfBirth,
      username: userData.username.trim(),
      role: 'customer',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };

    const newAccount: BankAccount = {
      accountId,
      userId,
      accountNumber,
      accountType: userData.accountType || 'SAVINGS',
      balance: 0.0, // Initial zero balance as requested
      accountStatus: 'active',
      dailyWithdrawalLimit: userData.accountType === 'CURRENT' ? 100000 : 50000,
      dailyWithdrawnToday: 0,
      lastWithdrawalDate: getTodayString(),
      createdAt: newUser.createdAt,
    };

    // Welcome notification
    const welcomeNotif: NotificationItem = {
      notificationId: `NOTIF-${Date.now()}`,
      userId,
      title: 'Welcome to Apex Bank ATM',
      message: `Your account ${accountNumber} has been created with customer ID ${customerId}. Ready for your first deposit!`,
      notificationType: 'ACCOUNT',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.data.accounts.push(newAccount);
    this.data.notifications.unshift(welcomeNotif);
    this.persist();

    const { passwordHash: _, salt: __, ...sanitizedUser } = newUser;
    return { user: sanitizedUser, account: newAccount };
  }

  public updateUserProfile(
    userId: string,
    updates: { phone?: string; address?: string }
  ): User {
    const user = this.data.users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');

    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.address) user.address = updates.address.trim();
    user.updatedAt = new Date().toISOString();

    this.persist();
    const { passwordHash, salt, ...sanitized } = user;
    return sanitized;
  }

  public changeUserPassword(userId: string, oldPass: string, newPass: string): void {
    const user = this.data.users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');

    if (!verifyPassword(oldPass, user.passwordHash, user.salt)) {
      throw new Error('Current password does not match');
    }

    const { hash, salt } = hashPassword(newPass);
    user.passwordHash = hash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();

    // Security notification
    this.addNotification({
      userId,
      title: 'Security Alert: Password Changed',
      message: 'Your account password was updated successfully. If this was not you, contact branch security immediately.',
      notificationType: 'SECURITY',
    });

    this.persist();
  }

  // Account queries
  public getAccountByUserId(userId: string): BankAccount | null {
    const acc = this.data.accounts.find((a) => a.userId === userId);
    if (acc) this.normalizeDailyLimit(acc);
    return acc || null;
  }

  public getAccountByNumber(accountNumber: string): BankAccount | null {
    const clean = accountNumber.trim().toUpperCase();
    const acc = this.data.accounts.find((a) => a.accountNumber.toUpperCase() === clean);
    if (acc) this.normalizeDailyLimit(acc);
    return acc || null;
  }

  public getAllAccounts(): BankAccount[] {
    return this.data.accounts.map((a) => {
      this.normalizeDailyLimit(a);
      return a;
    });
  }

  private normalizeDailyLimit(account: BankAccount) {
    const today = getTodayString();
    if (account.lastWithdrawalDate !== today) {
      account.dailyWithdrawnToday = 0;
      account.lastWithdrawalDate = today;
    }
  }

  // Transactions
  public getTransactionsForAccount(accountId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.senderAccountId === accountId || t.receiverAccountId === accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllTransactions(): Transaction[] {
    return [...this.data.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Atomic Withdrawal Operation
  public async withdrawCash(
    userId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<{ transaction: Transaction; receipt: ATMReceiptData }> {
    const release = await dbLock.acquire();
    try {
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }
      if (amount % 100 !== 0) {
        throw new Error('Withdrawal amount must be in multiples of ₹100');
      }

      // Check idempotency
      if (idempotencyKey) {
        const existingTx = this.data.transactions.find((t) => t.idempotencyKey === idempotencyKey);
        if (existingTx) {
          const user = this.findUserById(userId)!;
          const account = this.getAccountByUserId(userId)!;
          return {
            transaction: existingTx,
            receipt: this.buildReceipt(existingTx, user, account),
          };
        }
      }

      const user = this.findUserById(userId);
      if (!user) throw new Error('User not found');
      if (user.accountStatus !== 'active') {
        throw new Error(`User account is currently ${user.accountStatus}. Transactions restricted.`);
      }

      const account = this.getAccountByUserId(userId);
      if (!account) throw new Error('Bank account not found');
      if (account.accountStatus !== 'active') {
        throw new Error(`Bank account is ${account.accountStatus}. Cash withdrawal not allowed.`);
      }

      this.normalizeDailyLimit(account);

      if (amount > account.balance) {
        throw new Error(
          `Insufficient funds. Requested: ₹${amount.toLocaleString('en-IN')}, Available: ₹${account.balance.toLocaleString('en-IN')}`
        );
      }

      if (account.dailyWithdrawnToday + amount > account.dailyWithdrawalLimit) {
        const remainingLimit = account.dailyWithdrawalLimit - account.dailyWithdrawnToday;
        throw new Error(
          `Daily ATM withdrawal limit exceeded. Remaining limit for today is ₹${remainingLimit.toLocaleString('en-IN')}`
        );
      }

      // Atomic State Mutation
      const previousBalance = account.balance;
      account.balance = Math.round((account.balance - amount) * 100) / 100;
      account.dailyWithdrawnToday += amount;

      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newTx: Transaction = {
        transactionId,
        senderAccountId: account.accountId,
        senderAccountNumber: account.accountNumber,
        senderName: user.fullName,
        receiverAccountId: null,
        receiverAccountNumber: null,
        receiverName: null,
        transactionType: 'WITHDRAWAL',
        amount,
        previousBalance,
        updatedBalance: account.balance,
        description: `Cash Withdrawal at Digital ATM #${Math.floor(10 + Math.random() * 90)}`,
        remarks: 'ATM Dispenser Cash Out',
        transactionStatus: 'SUCCESS',
        idempotencyKey: idempotencyKey || null,
        createdAt: new Date().toISOString(),
      };

      this.data.transactions.unshift(newTx);

      // Notification
      this.addNotification({
        userId,
        title: 'Debit Alert: Cash Withdrawal',
        message: `₹${amount.toLocaleString('en-IN')} withdrawn from ATM. Available balance: ₹${account.balance.toLocaleString('en-IN')}.`,
        notificationType: 'TRANSACTION',
      });

      this.persist();

      const receipt = this.buildReceipt(newTx, user, account);
      return { transaction: newTx, receipt };
    } finally {
      release();
    }
  }

  // Atomic Deposit Operation
  public async depositCash(
    userId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<{ transaction: Transaction; receipt: ATMReceiptData }> {
    const release = await dbLock.acquire();
    try {
      if (amount <= 0) {
        throw new Error('Deposit amount must be greater than zero');
      }
      if (amount > 1000000) {
        throw new Error('Single deposit limit is ₹10,00,000');
      }

      if (idempotencyKey) {
        const existingTx = this.data.transactions.find((t) => t.idempotencyKey === idempotencyKey);
        if (existingTx) {
          const user = this.findUserById(userId)!;
          const account = this.getAccountByUserId(userId)!;
          return {
            transaction: existingTx,
            receipt: this.buildReceipt(existingTx, user, account),
          };
        }
      }

      const user = this.findUserById(userId);
      if (!user) throw new Error('User not found');
      if (user.accountStatus !== 'active') {
        throw new Error(`User account is ${user.accountStatus}`);
      }

      const account = this.getAccountByUserId(userId);
      if (!account) throw new Error('Bank account not found');
      if (account.accountStatus !== 'active') {
        throw new Error(`Bank account is ${account.accountStatus}. Cash deposit blocked.`);
      }

      const previousBalance = account.balance;
      account.balance = Math.round((account.balance + amount) * 100) / 100;

      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newTx: Transaction = {
        transactionId,
        senderAccountId: null,
        senderAccountNumber: null,
        senderName: null,
        receiverAccountId: account.accountId,
        receiverAccountNumber: account.accountNumber,
        receiverName: user.fullName,
        transactionType: 'DEPOSIT',
        amount,
        previousBalance,
        updatedBalance: account.balance,
        description: `Cash Deposit via Digital ATM Slot #${Math.floor(10 + Math.random() * 90)}`,
        remarks: 'ATM Cash Acceptor Inward',
        transactionStatus: 'SUCCESS',
        idempotencyKey: idempotencyKey || null,
        createdAt: new Date().toISOString(),
      };

      this.data.transactions.unshift(newTx);

      this.addNotification({
        userId,
        title: 'Credit Alert: Cash Deposit',
        message: `₹${amount.toLocaleString('en-IN')} credited to your account via ATM deposit. Updated balance: ₹${account.balance.toLocaleString('en-IN')}.`,
        notificationType: 'TRANSACTION',
      });

      this.persist();

      const receipt = this.buildReceipt(newTx, user, account);
      return { transaction: newTx, receipt };
    } finally {
      release();
    }
  }

  // Atomic Transfer Operation
  public async transferFunds(
    senderUserId: string,
    receiverAccountNumber: string,
    amount: number,
    remarks?: string,
    idempotencyKey?: string
  ): Promise<{ transaction: Transaction; receipt: ATMReceiptData }> {
    const release = await dbLock.acquire();
    try {
      if (amount <= 0) {
        throw new Error('Transfer amount must be greater than zero');
      }

      if (idempotencyKey) {
        const existingTx = this.data.transactions.find((t) => t.idempotencyKey === idempotencyKey);
        if (existingTx) {
          const senderUser = this.findUserById(senderUserId)!;
          const senderAccount = this.getAccountByUserId(senderUserId)!;
          return {
            transaction: existingTx,
            receipt: this.buildReceipt(existingTx, senderUser, senderAccount),
          };
        }
      }

      const senderUser = this.findUserById(senderUserId);
      if (!senderUser) throw new Error('Sender user not found');
      if (senderUser.accountStatus !== 'active') {
        throw new Error(`Sender account is ${senderUser.accountStatus}`);
      }

      const senderAccount = this.getAccountByUserId(senderUserId);
      if (!senderAccount) throw new Error('Sender bank account not found');
      if (senderAccount.accountStatus !== 'active') {
        throw new Error(`Your bank account is ${senderAccount.accountStatus}`);
      }

      const receiverAccount = this.getAccountByNumber(receiverAccountNumber);
      if (!receiverAccount) {
        throw new Error('Recipient account number not found');
      }
      if (receiverAccount.accountNumber === senderAccount.accountNumber) {
        throw new Error('Cannot transfer money to the same account');
      }
      if (receiverAccount.accountStatus !== 'active') {
        throw new Error(`Recipient bank account is ${receiverAccount.accountStatus} and cannot receive funds.`);
      }

      const receiverUser = this.findUserById(receiverAccount.userId);
      if (!receiverUser) throw new Error('Recipient user not found');

      if (amount > senderAccount.balance) {
        throw new Error(
          `Insufficient balance for transfer. Available: ₹${senderAccount.balance.toLocaleString('en-IN')}, Requested: ₹${amount.toLocaleString('en-IN')}`
        );
      }

      // Atomic Balance Mutation (Both debit and credit succeed together)
      const senderPrevBalance = senderAccount.balance;
      senderAccount.balance = Math.round((senderAccount.balance - amount) * 100) / 100;

      const receiverPrevBalance = receiverAccount.balance;
      receiverAccount.balance = Math.round((receiverAccount.balance + amount) * 100) / 100;

      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const cleanRemarks = remarks?.trim() || 'Online Fund Transfer';

      const transferTx: Transaction = {
        transactionId,
        senderAccountId: senderAccount.accountId,
        senderAccountNumber: senderAccount.accountNumber,
        senderName: senderUser.fullName,
        receiverAccountId: receiverAccount.accountId,
        receiverAccountNumber: receiverAccount.accountNumber,
        receiverName: receiverUser.fullName,
        transactionType: 'TRANSFER',
        amount,
        previousBalance: senderPrevBalance,
        updatedBalance: senderAccount.balance,
        description: `Fund Transfer to ${receiverUser.fullName} (${receiverAccount.accountNumber})`,
        remarks: cleanRemarks,
        transactionStatus: 'SUCCESS',
        idempotencyKey: idempotencyKey || null,
        createdAt: new Date().toISOString(),
      };

      this.data.transactions.unshift(transferTx);

      // Notify Sender
      this.addNotification({
        userId: senderUserId,
        title: 'Debit Alert: Fund Transfer',
        message: `₹${amount.toLocaleString('en-IN')} transferred to ${receiverUser.fullName} (${receiverAccount.accountNumber}). Balance: ₹${senderAccount.balance.toLocaleString('en-IN')}.`,
        notificationType: 'TRANSACTION',
      });

      // Notify Receiver
      this.addNotification({
        userId: receiverUser.userId,
        title: 'Credit Alert: Inward Fund Transfer',
        message: `₹${amount.toLocaleString('en-IN')} received from ${senderUser.fullName}. Updated balance: ₹${receiverAccount.balance.toLocaleString('en-IN')}.`,
        notificationType: 'TRANSACTION',
      });

      this.persist();

      const receipt = this.buildReceipt(transferTx, senderUser, senderAccount, receiverAccount.accountNumber, receiverUser.fullName);
      return { transaction: transferTx, receipt };
    } finally {
      release();
    }
  }

  // Admin Operations
  public updateCustomerStatus(
    adminId: string,
    targetUserId: string,
    newStatus: 'active' | 'inactive' | 'suspended',
    reason: string
  ): User {
    const admin = this.findUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized administrative action');

    const targetUser = this.findUserById(targetUserId);
    if (!targetUser) throw new Error('Customer not found');
    if (targetUser.role === 'admin') throw new Error('Cannot change administrator account status');

    const oldStatus = targetUser.accountStatus;
    targetUser.accountStatus = newStatus;
    targetUser.updatedAt = new Date().toISOString();

    // Audit log
    this.addAuditLog({
      adminId: admin.userId,
      adminName: admin.fullName,
      action: 'UPDATE_CUSTOMER_STATUS',
      targetId: targetUser.userId,
      targetType: 'USER',
      description: `Changed customer status of ${targetUser.fullName} from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
    });

    this.persist();
    const { passwordHash, salt, ...sanitized } = targetUser;
    return sanitized;
  }

  public freezeAccount(
    adminId: string,
    accountId: string,
    freeze: boolean,
    reason: string
  ): BankAccount {
    const admin = this.findUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized administrative action');

    const account = this.data.accounts.find((a) => a.accountId === accountId);
    if (!account) throw new Error('Bank account not found');

    const oldStatus = account.accountStatus;
    account.accountStatus = freeze ? 'frozen' : 'active';

    this.addAuditLog({
      adminId: admin.userId,
      adminName: admin.fullName,
      action: freeze ? 'FREEZE_ACCOUNT' : 'UNFREEZE_ACCOUNT',
      targetId: account.accountId,
      targetType: 'BANK_ACCOUNT',
      description: `${freeze ? 'Froze' : 'Unfroze'} account ${account.accountNumber} (User ID: ${account.userId}). Reason: ${reason}`,
    });

    this.addNotification({
      userId: account.userId,
      title: freeze ? 'Account Alert: Account Frozen' : 'Account Alert: Account Activated',
      message: freeze
        ? `Your bank account ${account.accountNumber} has been frozen by banking compliance. Please contact support.`
        : `Your bank account ${account.accountNumber} has been reactivated for all transactions.`,
      notificationType: 'SECURITY',
    });

    this.persist();
    return account;
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(userId: string, notificationId: string) {
    const n = this.data.notifications.find(
      (item) => item.notificationId === notificationId && item.userId === userId
    );
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.data.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => (n.isRead = true));
    this.persist();
  }

  private addNotification(data: {
    userId: string;
    title: string;
    message: string;
    notificationType: 'TRANSACTION' | 'SECURITY' | 'ACCOUNT';
  }) {
    const item: NotificationItem = {
      notificationId: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      notificationType: data.notificationType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(item);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private addAuditLog(log: Omit<AuditLog, 'logId' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      logId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
  }

  // Aggregate Reporting & Statistics
  public getAdminStats() {
    const customers = this.data.users.filter((u) => u.role === 'customer');
    const accounts = this.data.accounts;
    const transactions = this.data.transactions.filter((t) => t.transactionStatus === 'SUCCESS');

    let totalDepositVolume = 0;
    let totalWithdrawalVolume = 0;
    let totalTransferVolume = 0;

    transactions.forEach((t) => {
      if (t.transactionType === 'DEPOSIT') totalDepositVolume += t.amount;
      if (t.transactionType === 'WITHDRAWAL') totalWithdrawalVolume += t.amount;
      if (t.transactionType === 'TRANSFER') totalTransferVolume += t.amount;
    });

    const totalSystemVault = accounts.reduce((acc, a) => acc + a.balance, 0);

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.accountStatus === 'active').length,
      totalBankAccounts: accounts.length,
      frozenAccounts: accounts.filter((a) => a.accountStatus === 'frozen').length,
      totalDeposits: transactions.filter((t) => t.transactionType === 'DEPOSIT').length,
      totalDepositVolume,
      totalWithdrawals: transactions.filter((t) => t.transactionType === 'WITHDRAWAL').length,
      totalWithdrawalVolume,
      totalTransfers: transactions.filter((t) => t.transactionType === 'TRANSFER').length,
      totalTransferVolume,
      totalTransactionVolume: totalDepositVolume + totalWithdrawalVolume + totalTransferVolume,
      totalSystemVault,
    };
  }

  private buildReceipt(
    tx: Transaction,
    user: User,
    account: BankAccount,
    recipientAccount?: string,
    recipientName?: string
  ): ATMReceiptData {
    const masked = account.accountNumber.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, '$1-••••-••••-$4');
    return {
      bankName: 'APEX DIGITAL BANK - ATM TERMINAL',
      terminalId: 'ATM-BLR-0492',
      transactionId: tx.transactionId,
      accountHolder: user.fullName,
      maskedAccountNumber: masked,
      accountType: account.accountType,
      transactionType: tx.transactionType,
      transactionDate: tx.createdAt,
      transactionAmount: tx.amount,
      previousBalance: tx.previousBalance,
      updatedBalance: tx.updatedBalance,
      transactionStatus: tx.transactionStatus,
      recipientAccount,
      recipientName,
      referenceNumber: `REF-${tx.transactionId.replace('TXN-', '')}-APX`,
    };
  }
}

export const db = new Database();
