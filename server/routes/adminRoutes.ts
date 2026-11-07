import { Router } from 'express';
import { db } from '../db/database.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';

export const adminRouter = Router();

// Require admin privileges on all admin endpoints
adminRouter.use(requireAuth, requireAdmin);

// Admin dashboard statistics
adminRouter.get('/stats', (_req, res) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// Customer Management: List all customers with their associated bank account
adminRouter.get('/customers', (req, res) => {
  const allUsers = db.getAllUsers().filter((u) => u.role === 'customer');
  const allAccounts = db.getAllAccounts();

  const search = String(req.query.search || '').trim().toLowerCase();
  let customers = allUsers.map((user) => {
    const account = allAccounts.find((a) => a.userId === user.userId);
    return {
      ...user,
      account,
    };
  });

  if (search) {
    customers = customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.customerId.toLowerCase().includes(search) ||
        (c.account && c.account.accountNumber.toLowerCase().includes(search))
    );
  }

  res.json({ customers });
});

// Update Customer Status (active/inactive/suspended)
adminRouter.patch('/customers/:id/status', (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Valid status (active, inactive, suspended) is required' });
      return;
    }
    const cleanReason = reason?.trim() || 'Administrative compliance review';

    const updatedUser = db.updateCustomerStatus(req.user!.userId, req.params.id, status, cleanReason);
    res.json({ message: `Customer status updated to ${status}`, user: updatedUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update customer status' });
  }
});

// Account Management: List all bank accounts
adminRouter.get('/accounts', (req, res) => {
  const allAccounts = db.getAllAccounts();
  const allUsers = db.getAllUsers();

  const search = String(req.query.search || '').trim().toLowerCase();
  let accountsWithHolders = allAccounts.map((account) => {
    const holder = allUsers.find((u) => u.userId === account.userId);
    return {
      ...account,
      holderName: holder ? holder.fullName : 'Unknown Holder',
      holderEmail: holder ? holder.email : '',
      holderPhone: holder ? holder.phone : '',
    };
  });

  if (search) {
    accountsWithHolders = accountsWithHolders.filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(search) ||
        a.holderName.toLowerCase().includes(search) ||
        a.accountId.toLowerCase().includes(search)
    );
  }

  res.json({ accounts: accountsWithHolders });
});

// Freeze or Unfreeze Bank Account
adminRouter.patch('/accounts/:id/freeze', (req, res) => {
  try {
    const { freeze, reason } = req.body;
    if (typeof freeze !== 'boolean') {
      res.status(400).json({ error: 'Field "freeze" (boolean) is required' });
      return;
    }
    const cleanReason = reason?.trim() || (freeze ? 'Risk prevention freeze' : 'Account cleared by risk team');

    const updatedAccount = db.freezeAccount(req.user!.userId, req.params.id, freeze, cleanReason);
    res.json({
      message: `Account ${updatedAccount.accountNumber} is now ${freeze ? 'FROZEN' : 'ACTIVE'}`,
      account: updatedAccount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update account freeze status' });
  }
});

// Transaction Management: View all system-wide transactions
adminRouter.get('/transactions', (req, res) => {
  let transactions = db.getAllTransactions();

  const search = String(req.query.search || '').trim().toLowerCase();
  const type = String(req.query.type || '').toUpperCase();

  if (type && type !== 'ALL') {
    transactions = transactions.filter((t) => t.transactionType === type);
  }

  if (search) {
    transactions = transactions.filter(
      (t) =>
        t.transactionId.toLowerCase().includes(search) ||
        (t.senderAccountNumber && t.senderAccountNumber.toLowerCase().includes(search)) ||
        (t.receiverAccountNumber && t.receiverAccountNumber.toLowerCase().includes(search)) ||
        (t.senderName && t.senderName.toLowerCase().includes(search)) ||
        (t.receiverName && t.receiverName.toLowerCase().includes(search)) ||
        t.description.toLowerCase().includes(search)
    );
  }

  res.json({ transactions });
});

// Comprehensive Reports
adminRouter.get('/reports', (_req, res) => {
  const transactions = db.getAllTransactions().filter((t) => t.transactionStatus === 'SUCCESS');

  // Breakdown by type
  let totalDeposits = 0;
  let totalDepositVol = 0;
  let totalWithdrawals = 0;
  let totalWithdrawalVol = 0;
  let totalTransfers = 0;
  let totalTransferVol = 0;

  // Breakdown by past 7 days
  const dailyMap: Record<string, { date: string; deposits: number; withdrawals: number; transfers: number; volume: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    dailyMap[d] = { date: d, deposits: 0, withdrawals: 0, transfers: 0, volume: 0 };
  }

  transactions.forEach((tx) => {
    const day = tx.createdAt.split('T')[0];
    if (tx.transactionType === 'DEPOSIT') {
      totalDeposits++;
      totalDepositVol += tx.amount;
      if (dailyMap[day]) {
        dailyMap[day].deposits += tx.amount;
        dailyMap[day].volume += tx.amount;
      }
    } else if (tx.transactionType === 'WITHDRAWAL') {
      totalWithdrawals++;
      totalWithdrawalVol += tx.amount;
      if (dailyMap[day]) {
        dailyMap[day].withdrawals += tx.amount;
        dailyMap[day].volume += tx.amount;
      }
    } else if (tx.transactionType === 'TRANSFER') {
      totalTransfers++;
      totalTransferVol += tx.amount;
      if (dailyMap[day]) {
        dailyMap[day].transfers += tx.amount;
        dailyMap[day].volume += tx.amount;
      }
    }
  });

  const dailyTrend = Object.values(dailyMap);

  res.json({
    summary: {
      totalDeposits,
      totalDepositVol,
      totalWithdrawals,
      totalWithdrawalVol,
      totalTransfers,
      totalTransferVol,
      totalTransactions: transactions.length,
      grandTotalVolume: totalDepositVol + totalWithdrawalVol + totalTransferVol,
    },
    dailyTrend,
  });
});

// Audit Logs
adminRouter.get('/audit-logs', (_req, res) => {
  const logs = db.getAuditLogs();
  res.json({ logs });
});

// Reset database to initial sample demo data
adminRouter.post('/seed-reset', (req, res) => {
  db.seedInitialData();
  res.json({ message: 'Database reset to default demo environment successfully' });
});
