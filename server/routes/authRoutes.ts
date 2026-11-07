import { Router } from 'express';
import { db, verifyPassword } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  try {
    const { fullName, email, phone, address, dateOfBirth, username, password, accountType } = req.body;

    if (!fullName || !email || !phone || !address || !dateOfBirth || !username || !password) {
      res.status(400).json({ error: 'All registration fields are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email address format' });
      return;
    }

    const { user, account } = db.createUser({
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      username,
      password,
      accountType: accountType === 'CURRENT' ? 'CURRENT' : 'SAVINGS',
    });

    const token = db.createSession(user.userId);
    res.status(201).json({
      message: 'Account registered successfully',
      user,
      account,
      token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

authRouter.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/Email and password are required' });
      return;
    }

    const user = db.findUserByUsernameOrEmail(identifier);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ error: 'Your account has been suspended by bank administration.' });
      return;
    }

    const token = db.createSession(user.userId);
    const { passwordHash: _, salt: __, ...sanitized } = user;
    const account = user.role === 'customer' ? db.getAccountByUserId(user.userId) : null;

    res.json({
      message: 'Login successful',
      user: sanitized,
      account,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

authRouter.post('/logout', requireAuth, (req, res) => {
  if (req.token) {
    db.removeSession(req.token);
  }
  res.json({ message: 'Logged out successfully' });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  const account = user.role === 'customer' ? db.getAccountByUserId(user.userId) : null;
  res.json({ user, account });
});

authRouter.post('/change-password', requireAuth, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Both old and new passwords are required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    db.changeUserPassword(req.user!.userId, oldPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update password' });
  }
});
