import { Router } from 'express';
import { db } from '../db/database.ts';
import { requireAuth, requireCustomer } from '../middleware/auth.ts';

export const customerRouter = Router();

// Apply customer auth to all routes in this router
customerRouter.use(requireAuth, requireCustomer);

// Get current customer bank account details & limits
customerRouter.get('/account', (req, res) => {
  const account = db.getAccountByUserId(req.user!.userId);
  if (!account) {
    res.status(404).json({ error: 'Bank account not found' });
    return;
  }
  res.json({ account, user: req.user });
});

// ATM Cash Withdrawal
customerRouter.post('/withdraw', async (req, res) => {
  try {
    const { amount, idempotencyKey } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid withdrawal amount' });
      return;
    }

    const result = await db.withdrawCash(req.user!.userId, numAmount, idempotencyKey);
    res.json({
      message: `Withdrawal Successful! Amount: ₹${numAmount.toLocaleString('en-IN')}`,
      transaction: result.transaction,
      receipt: result.receipt,
      remainingBalance: result.transaction.updatedBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal failed' });
  }
});

// ATM Cash Deposit
customerRouter.post('/deposit', async (req, res) => {
  try {
    const { amount, idempotencyKey } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid deposit amount' });
      return;
    }

    const result = await db.depositCash(req.user!.userId, numAmount, idempotencyKey);
    res.json({
      message: `Deposit Successful! Amount: ₹${numAmount.toLocaleString('en-IN')}`,
      transaction: result.transaction,
      receipt: result.receipt,
      updatedBalance: result.transaction.updatedBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit failed' });
  }
});

// Verify Recipient Account for Transfer
customerRouter.get('/transfer/verify-recipient', (req, res) => {
  const accountNumber = String(req.query.accountNumber || '').trim();
  if (!accountNumber) {
    res.status(400).json({ error: 'Account number is required' });
    return;
  }

  const senderAccount = db.getAccountByUserId(req.user!.userId);
  if (senderAccount && senderAccount.accountNumber.toUpperCase() === accountNumber.toUpperCase()) {
    res.status(400).json({ error: 'You cannot transfer funds to your own account' });
    return;
  }

  const receiverAccount = db.getAccountByNumber(accountNumber);
  if (!receiverAccount) {
    res.status(404).json({ error: 'Recipient account number not found in Apex Bank registry' });
    return;
  }

  if (receiverAccount.accountStatus !== 'active') {
    res.status(400).json({ error: `Recipient account is ${receiverAccount.accountStatus} and cannot receive transfers` });
    return;
  }

  const receiverUser = db.findUserById(receiverAccount.userId);
  if (!receiverUser) {
    res.status(404).json({ error: 'Recipient user record not found' });
    return;
  }

  res.json({
    valid: true,
    accountNumber: receiverAccount.accountNumber,
    accountType: receiverAccount.accountType,
    recipientName: receiverUser.fullName,
  });
});

// Fund Transfer
customerRouter.post('/transfer', async (req, res) => {
  try {
    const { receiverAccountNumber, amount, remarks, idempotencyKey } = req.body;
    const numAmount = Number(amount);

    if (!receiverAccountNumber) {
      res.status(400).json({ error: 'Receiver account number is required' });
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please specify a valid transfer amount' });
      return;
    }

    const result = await db.transferFunds(
      req.user!.userId,
      receiverAccountNumber,
      numAmount,
      remarks,
      idempotencyKey
    );

    res.json({
      message: `Transfer of ₹${numAmount.toLocaleString('en-IN')} was processed successfully!`,
      transaction: result.transaction,
      receipt: result.receipt,
      remainingBalance: result.transaction.updatedBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Transfer failed' });
  }
});

// Transaction History with Search, Filter & Pagination
customerRouter.get('/transactions', (req, res) => {
  const account = db.getAccountByUserId(req.user!.userId);
  if (!account) {
    res.status(404).json({ error: 'Bank account not found' });
    return;
  }

  let transactions = db.getTransactionsForAccount(account.accountId);

  // Filter by Type
  const type = String(req.query.type || '').toUpperCase();
  if (type && type !== 'ALL') {
    transactions = transactions.filter((t) => t.transactionType === type);
  }

  // Filter by Search Query (ID, description, recipient/sender)
  const query = String(req.query.search || '').trim().toLowerCase();
  if (query) {
    transactions = transactions.filter((t) => {
      return (
        t.transactionId.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.remarks && t.remarks.toLowerCase().includes(query)) ||
        (t.senderName && t.senderName.toLowerCase().includes(query)) ||
        (t.receiverName && t.receiverName.toLowerCase().includes(query))
      );
    });
  }

  // Filter by Date Range (startDate, endDate)
  const startDate = String(req.query.startDate || '').trim();
  const endDate = String(req.query.endDate || '').trim();
  if (startDate) {
    const start = new Date(startDate).getTime();
    transactions = transactions.filter((t) => new Date(t.createdAt).getTime() >= start);
  }
  if (endDate) {
    // Add end of day
    const end = new Date(`${endDate}T23:59:59.999Z`).getTime();
    transactions = transactions.filter((t) => new Date(t.createdAt).getTime() <= end);
  }

  // Sort
  const sortBy = String(req.query.sortBy || 'date_desc');
  if (sortBy === 'amount_asc') {
    transactions.sort((a, b) => a.amount - b.amount);
  } else if (sortBy === 'amount_desc') {
    transactions.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === 'date_asc') {
    transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Pagination
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '10'), 10)));
  const total = transactions.length;
  const paginated = transactions.slice((page - 1) * limit, page * limit);

  res.json({
    transactions: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// Notifications
customerRouter.get('/notifications', (req, res) => {
  const notifs = db.getNotifications(req.user!.userId);
  const unreadCount = notifs.filter((n) => !n.isRead).length;
  res.json({ notifications: notifs, unreadCount });
});

customerRouter.post('/notifications/:id/read', (req, res) => {
  db.markNotificationAsRead(req.user!.userId, req.params.id);
  res.json({ success: true });
});

customerRouter.post('/notifications/mark-all-read', (req, res) => {
  db.markAllNotificationsAsRead(req.user!.userId);
  res.json({ success: true });
});

// Update Profile (Phone, Address)
customerRouter.put('/profile', (req, res) => {
  try {
    const { phone, address } = req.body;
    const updated = db.updateUserProfile(req.user!.userId, { phone, address });
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Profile update failed' });
  }
});
