import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { getAuditLogs, getAuditStats } from '../services/auditService.js';
import prisma from '../config/prisma.js';
import { upload } from '../middleware/upload.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * Middleware to verify admin access
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

// Get admin dashboard stats
// GET /api/v1/mybanker/stats
router.get('/stats', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const [totalUsers, pendingKYC, activeAccounts, recentAudits] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
      prisma.auditLog.count({
        where: {
          action: { in: ['FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY'] },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      })
    ]);

    return res.json({
      totalUsers,
      pendingKYC,
      activeAccounts,
      securityAlerts: recentAudits
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Create new user (Admin only)
// POST /api/v1/mybanker/users
router.post('/users', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      password,
      accountType,
      initialBalance,
      setAsActive,
      securityQuestions
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate unique account number (00 + 10 random digits)
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      accountNumber = `00${randomDigits}`;
      const existing = await prisma.user.findUnique({ where: { accountNumber } });
      if (!existing) isUnique = true;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all details
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        address,
        city,
        state,
        zipCode,
        country,
        accountNumber,
        accountStatus: setAsActive ? 'ACTIVE' : 'LIMITED',
        kycStatus: setAsActive ? 'VERIFIED' : 'NOT_SUBMITTED'
      }
    });

    // Create primary account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountType,
        accountNumber, // Use same account number for primary account
        balance: parseFloat(initialBalance) || 0,
        isPrimary: true
      }
    });

    // Create security questions
    for (const sq of securityQuestions) {
      const answerHash = await bcrypt.hash(sq.answer.toLowerCase(), 10);
      await prisma.securityQuestion.create({
        data: {
          userId: user.id,
          question: sq.question,
          answerHash
        }
      });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 5; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(code, 10);
      await prisma.backupCode.create({
        data: {
          userId: user.id,
          codeHash
        }
      });
      backupCodes.push(code);
    }

    // Create initial transaction if balance > 0
    if (parseFloat(initialBalance) > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          amount: parseFloat(initialBalance),
          type: 'CREDIT',
          description: 'Initial deposit by admin',
          status: 'COMPLETED'
        }
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_USER',
        description: `Admin created new user: ${email}`,
        severity: 'MEDIUM',
        ipAddress: req.ip,
        metadata: {
          newUserId: user.id,
          accountNumber,
          accountType,
          initialBalance
        }
      }
    });

    return res.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        accountStatus: user.accountStatus,
        kycStatus: user.kycStatus
      },
      backupCodes // Return backup codes to admin
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
// GET /api/v1/mybanker/users
router.get('/users', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, kycStatus, accountStatus } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (accountStatus) {
      where.accountStatus = accountStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          accountNumber: true,
          profilePhoto: true,
          accountStatus: true,
          kycStatus: true,
          totalSentAmount: true,
          createdAt: true,
          accounts: {
            where: { isPrimary: true },
            select: {
              balance: true,
              accountType: true
            }
          },
          _count: {
            select: {
              accounts: true,
              backupCodes: { where: { used: false } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    // Format users with balance from primary account
    const formattedUsers = users.map(user => ({
      ...user,
      balance: user.accounts[0]?.balance || 0,
      accountType: user.accounts[0]?.accountType || 'N/A',
      accounts: undefined // Remove accounts array from response
    }));

    return res.json({
      users: formattedUsers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details
// GET /api/v1/mybanker/users/:userId
router.get('/users/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching user details for:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            balance: true,
            accountType: true,
            accountNumber: true,
            isPrimary: true
          }
        },
        securityQuestions: {
          select: {
            question: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            transactions: true,
            backupCodes: { where: { used: false } }
          }
        }
      }
    });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.email, 'Accounts:', user.accounts.length);

    // Format response
    const formattedUser = {
      ...user,
      balance: user.accounts[0]?.balance || 0,
      accountType: user.accounts[0]?.accountType || 'N/A',
      accountNumber: user.accounts[0]?.accountNumber || 'N/A',
      password: undefined, // Never send password
      hashedPassword: undefined
    };

    return res.json({ success: true, user: formattedUser });
  } catch (error) {
    console.error('Get user details error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Failed to fetch user details', details: error.message });
  }
});

// Get user transactions
// GET /api/v1/mybanker/users/:userId/transactions
router.get('/users/:userId/transactions', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId: userId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    return res.json({ transactions });
  } catch (error) {
    console.error('Get user transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get user backup codes (decrypted for admin view)
// GET /api/v1/mybanker/users/:userId/backup-codes
router.get('/users/:userId/backup-codes', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const backupCodes = await prisma.backupCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // For security, we can't decrypt the codes, but we can show which are used
    const codes = backupCodes.map((bc, idx) => ({
      id: bc.id,
      code: `******${idx + 1}`, // Masked - codes are hashed and can't be retrieved
      used: bc.used,
      usedAt: bc.usedAt,
      usedFor: bc.usedFor
    }));

    return res.json({ codes });
  } catch (error) {
    console.error('Get backup codes error:', error);
    return res.status(500).json({ error: 'Failed to fetch backup codes' });
  }
});

// Update user status
// PUT /api/v1/mybanker/users/:userId/status
router.put('/users/:userId/status', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountStatus } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountStatus: true
      }
    });

    return res.json({ user, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Credit or Debit money to/from user account
// POST /api/v1/mybanker/users/:userId/credit-debit
router.post('/users/:userId/credit-debit', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, amount, description, accountId } = req.body;

    if (!['CREDIT', 'DEBIT'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Get the specified account
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Check if debit would result in negative balance
    if (type === 'DEBIT' && account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        amount: parseFloat(amount),
        type,
        description: description || `Admin ${type.toLowerCase()} adjustment`,
        status: 'COMPLETED'
      }
    });

    // Update account balance
    const newBalance = type === 'CREDIT' 
      ? parseFloat(account.balance) + parseFloat(amount)
      : parseFloat(account.balance) - parseFloat(amount);

    await prisma.account.update({
      where: { id: account.id },
      data: { balance: newBalance }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `ADMIN_${type}`,
        description: `Admin ${type.toLowerCase()}ed $${amount} ${type === 'CREDIT' ? 'to' : 'from'} user account`,
        severity: 'HIGH',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          amount,
          transactionId: transaction.id,
          description
        }
      }
    });

    return res.json({
      message: `Successfully ${type.toLowerCase()}ed $${amount}`,
      transaction,
      newBalance
    });
  } catch (error) {
    console.error('Credit/Debit error:', error);
    return res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Update user (Admin only)
// PUT /api/v1/mybanker/users/:userId
router.put('/users/:userId', verifyAuth, verifyAdmin, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      accountStatus,
      kycStatus,
      accountType,
      loginPreference,
      isAdmin,
      newPassword,
      securityQuestions
    } = req.body;

    // Build update data
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
      city,
      state,
      zipCode,
      country,
      accountStatus,
      kycStatus,
      loginPreference,
      isAdmin: isAdmin === 'true' || isAdmin === true
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Handle profile photo upload
    if (req.file) {
      updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    // Handle password update
    if (newPassword && newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update account type if provided
    if (accountType) {
      await prisma.account.updateMany({
        where: {
          userId,
          isPrimary: true
        },
        data: {
          accountType
        }
      });
    }

    // Update security questions if provided
    if (securityQuestions) {
      const questions = JSON.parse(securityQuestions);
      
      if (questions.length > 0) {
        // Delete existing security questions
        await prisma.securityQuestion.deleteMany({
          where: { userId }
        });

        // Create new security questions
        for (const sq of questions) {
          const answerHash = await bcrypt.hash(sq.answer.toLowerCase(), 10);
          await prisma.securityQuestion.create({
            data: {
              userId,
              question: sq.question,
              answerHash
            }
          });
        }
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_USER',
        description: `Admin updated user: ${email}`,
        severity: 'MEDIUM',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          updatedFields: Object.keys(updateData)
        }
      }
    });

    return res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountStatus: user.accountStatus,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
// DELETE /api/v1/mybanker/users/:userId
router.delete('/users/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId }
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get pending KYC submissions
// GET /api/v1/mybanker/kyc/pending
router.get('/kyc/pending', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const submissions = await prisma.kYCDocument.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            accountNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ submissions });
  } catch (error) {
    console.error('Get KYC submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch KYC submissions' });
  }
});

// Approve KYC
// PUT /api/v1/mybanker/kyc/:kycId/approve
router.put('/kyc/:kycId/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: { 
        status: 'VERIFIED',
        verifiedAt: new Date()
      }
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: 'VERIFIED' }
    });

    return res.json({ message: 'KYC approved successfully' });
  } catch (error) {
    console.error('Approve KYC error:', error);
    return res.status(500).json({ error: 'Failed to approve KYC' });
  }
});

// Reject KYC
// PUT /api/v1/mybanker/kyc/:kycId/reject
router.put('/kyc/:kycId/reject', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { kycId } = req.params;
    const { reason } = req.body;

    const kyc = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: 'REJECTED' }
    });

    return res.json({ message: 'KYC rejected successfully' });
  } catch (error) {
    console.error('Reject KYC error:', error);
    return res.status(500).json({ error: 'Failed to reject KYC' });
  }
});

// Get all transactions
// GET /api/v1/mybanker/transactions
router.get('/transactions', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { type, status, dateRange } = req.query;

    const where = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
      }
      
      if (startDate) {
        where.createdAt = { gte: startDate };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get audit logs
// GET /api/v1/mybanker/audit-logs
router.get('/audit-logs', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { action, severity } = req.query;

    const where = {};
    
    if (action && action !== 'all') {
      where.action = action;
    }
    
    if (severity && severity !== 'all') {
      where.severity = severity;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit statistics
// GET /api/v1/admin/audit-stats
router.get('/audit-stats', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await getAuditStats(startDate, endDate);
    return res.json(stats);
  } catch (error) {
    console.error('Get audit stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Download backup codes PDF for a user
// GET /api/v1/admin/users/:userId/backup-codes
router.get('/users/:userId/backup-codes', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pdfPath = `/app/storage/backup-codes/user_${userId}/gatwick-backup-codes-${user.firstName}-${user.lastName}.pdf`;

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'Backup codes PDF not found' });
    }

    res.download(pdfPath, `backup-codes-${user.firstName}-${user.lastName}.pdf`);
  } catch (error) {
    console.error('Download backup codes error:', error);
    return res.status(500).json({ error: 'Failed to download backup codes' });
  }
});

// Get KYC submissions pending review
// GET /api/v1/admin/kyc/pending
router.get('/kyc/pending', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const pendingKYC = await prisma.kYCDocument.findMany({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({ submissions: pendingKYC });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    return res.status(500).json({ error: 'Failed to fetch KYC submissions' });
  }
});

// Get KYC document details
// GET /api/v1/admin/kyc/:kycId
router.get('/kyc/:kycId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await prisma.kYCDocument.findUnique({
      where: { id: kycId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!kyc) {
      return res.status(404).json({ error: 'KYC document not found' });
    }

    return res.json({ kyc });
  } catch (error) {
    console.error('Get KYC details error:', error);
    return res.status(500).json({ error: 'Failed to fetch KYC details' });
  }
});

// Approve or reject KYC
// POST /api/v1/admin/kyc/:kycId/review
router.post('/kyc/:kycId/review', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { kycId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const kyc = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: {
        status,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      },
      include: { user: true }
    });

    // Update user account status if approved
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: kyc.userId },
        data: {
          kycStatus: 'APPROVED',
          accountStatus: 'ACTIVE'
        }
      });
    } else {
      await prisma.user.update({
        where: { id: kyc.userId },
        data: { kycStatus: 'REJECTED' }
      });
    }

    // Create notification
    const { notifyKYCStatus } = await import('../services/notificationService.js');
    await notifyKYCStatus(kyc.userId, status, rejectionReason);

    return res.json({
      message: `KYC ${status.toLowerCase()} successfully`,
      kyc
    });
  } catch (error) {
    console.error('Review KYC error:', error);
    return res.status(500).json({ error: 'Failed to review KYC' });
  }
});

// Get pending KYC users (users with PENDING status)
// GET /api/v1/mybanker/kyc/users/pending
router.get('/kyc/users/pending', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      include: {
        kycDocuments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { kycSubmittedAt: 'asc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      phoneCountryCode: user.phoneCountryCode,
      isBusinessAccount: user.isBusinessAccount,
      businessName: user.businessName,
      kycSubmittedAt: user.kycSubmittedAt,
      documentCount: user.kycDocuments.length,
      createdAt: user.createdAt
    }));

    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get pending KYC users error:', error);
    return res.status(500).json({ error: 'Failed to fetch pending KYC users' });
  }
});

// Get user's KYC details and documents
// GET /api/v1/mybanker/kyc/users/:userId
router.get('/kyc/users/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycDocuments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Group documents by category
    const documentsByCategory = user.kycDocuments.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    }, {});

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
        isBusinessAccount: user.isBusinessAccount,
        businessName: user.businessName,
        businessType: user.businessType,
        taxId: user.taxId,
        businessAddress: user.businessAddress,
        businessCity: user.businessCity,
        businessState: user.businessState,
        businessZip: user.businessZip,
        businessCountry: user.businessCountry,
        representativeName: user.representativeName,
        representativeTitle: user.representativeTitle,
        kycStatus: user.kycStatus,
        kycRejectionReason: user.kycRejectionReason,
        kycSubmittedAt: user.kycSubmittedAt,
        kycReviewedAt: user.kycReviewedAt,
        createdAt: user.createdAt
      },
      documents: documentsByCategory,
      totalDocuments: user.kycDocuments.length
    });
  } catch (error) {
    console.error('Get user KYC details error:', error);
    return res.status(500).json({ error: 'Failed to fetch KYC details' });
  }
});

// Approve user's KYC
// POST /api/v1/mybanker/kyc/users/:userId/approve
router.post('/kyc/users/:userId/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    // Update user KYC status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
        kycRejectionReason: null
      }
    });

    // Update all user's documents to VERIFIED
    await prisma.kYCDocument.updateMany({
      where: { userId },
      data: {
        status: 'VERIFIED',
        reviewNotes: 'Approved by admin'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'kyc',
        title: 'KYC Verified!',
        message: 'Congratulations! Your KYC has been verified. You now have full access to all banking features.',
        metadata: {
          verifiedAt: new Date().toISOString(),
          verifiedBy: adminId
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'APPROVE_KYC',
        description: `Admin approved KYC for user: ${user.email}`,
        severity: 'HIGH',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          userEmail: user.email
        }
      }
    });

    return res.json({
      message: 'KYC approved successfully',
      user: {
        id: user.id,
        email: user.email,
        kycStatus: user.kycStatus,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    return res.status(500).json({ error: 'Failed to approve KYC' });
  }
});

// Reject user's KYC
// POST /api/v1/mybanker/kyc/users/:userId/reject
router.post('/kyc/users/:userId/reject', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Update user KYC status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectionReason: reason,
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId
      }
    });

    // Update all user's documents to REJECTED
    await prisma.kYCDocument.updateMany({
      where: { userId },
      data: {
        status: 'REJECTED',
        reviewNotes: reason
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'kyc',
        title: 'KYC Rejected',
        message: `Your KYC submission has been rejected. Reason: ${reason}. Please correct the issues and re-submit.`,
        metadata: {
          rejectedAt: new Date().toISOString(),
          reason
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REJECT_KYC',
        description: `Admin rejected KYC for user: ${user.email}`,
        severity: 'HIGH',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          userEmail: user.email,
          reason
        }
      }
    });

    return res.json({
      message: 'KYC rejected successfully',
      user: {
        id: user.id,
        email: user.email,
        kycStatus: user.kycStatus,
        rejectionReason: user.kycRejectionReason
      }
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    return res.status(500).json({ error: 'Failed to reject KYC' });
  }
});

// Request additional documents
// POST /api/v1/mybanker/kyc/users/:userId/request-more
router.post('/kyc/users/:userId/request-more', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const adminId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Request message is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'kyc',
        title: 'Additional Documents Requested',
        message: `Admin has requested additional documents: ${message}`,
        metadata: {
          requestedAt: new Date().toISOString(),
          requestMessage: message
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REQUEST_KYC_DOCUMENTS',
        description: `Admin requested additional KYC documents from user: ${user.email}`,
        severity: 'MEDIUM',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          requestMessage: message
        }
      }
    });

    return res.json({
      message: 'Document request sent successfully'
    });
  } catch (error) {
    console.error('Request documents error:', error);
    return res.status(500).json({ error: 'Failed to request documents' });
  }
});

// Get dashboard statistics
// GET /api/v1/admin/stats
router.get('/stats', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      totalTransactions,
      totalBalance
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
      prisma.kYCDocument.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count(),
      prisma.account.aggregate({
        _sum: { balance: true }
      })
    ]);

    return res.json({
      totalUsers,
      activeUsers,
      pendingKYC,
      totalTransactions,
      totalBalance: totalBalance._sum.balance || 0
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get backup codes for a user
// GET /api/v1/mybanker/users/:userId/backup-codes
router.get('/users/:userId/backup-codes', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const codes = await prisma.backupCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        used: true,
        usedAt: true,
        usedFor: true,
        createdAt: true
      }
    });

    // Don't return actual code hashes for security
    const sanitizedCodes = codes.map(code => ({
      id: code.id,
      code: code.used ? null : '******', // Hide code value, just show if used
      used: code.used,
      usedAt: code.usedAt,
      usedFor: code.usedFor,
      createdAt: code.createdAt
    }));

    return res.json({ codes: sanitizedCodes });
  } catch (error) {
    console.error('Get backup codes error:', error);
    return res.status(500).json({ error: 'Failed to fetch backup codes' });
  }
});

// Regenerate backup codes for a user
// POST /api/v1/mybanker/users/:userId/regenerate-backup-codes
router.post('/users/:userId/regenerate-backup-codes', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all existing backup codes
    await prisma.backupCode.deleteMany({
      where: { userId }
    });

    // Generate 100 new backup codes
    const { regenerateBackupCodes } = await import('../services/securityService.js');
    const { codes } = await regenerateBackupCodes(userId);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REGENERATE_BACKUP_CODES',
        description: `Admin regenerated backup codes for user: ${user.email}`,
        severity: 'HIGH',
        ipAddress: req.ip,
        metadata: {
          targetUserId: userId,
          codesGenerated: codes.length
        }
      }
    });

    // Return the new codes (only for admin to download/send to user)
    const sanitizedCodes = codes.map((code, index) => ({
      id: `new-${index}`,
      code: code, // Return actual codes for download
      used: false,
      usedAt: null,
      createdAt: new Date()
    }));

    return res.json({
      message: 'Backup codes regenerated successfully',
      codes: sanitizedCodes
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

// Create new user (simplified endpoint for Add New User form)
// POST /api/v1/mybanker/users/create
router.post('/users/create', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      password,
      isAdmin = false,
      accountStatus = 'LIMITED'
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate unique account number
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      accountNumber = `00${randomDigits}`;
      const existing = await prisma.user.findUnique({ where: { accountNumber } });
      if (!existing) isUnique = true;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        accountNumber,
        accountStatus,
        kycStatus: 'NOT_SUBMITTED',
        isAdmin
      }
    });

    // Create default security questions for admin-created users
    const defaultQuestions = [
      { question: "What was the name of your first pet?", answer: 'admin' },
      { question: "In what city were you born?", answer: 'admin' },
      { question: "What is your mother's maiden name?", answer: 'admin' }
    ];
    
    for (const sq of defaultQuestions) {
      const answerHash = await bcrypt.hash(sq.answer.toLowerCase().trim(), 10);
      await prisma.securityQuestion.create({
        data: {
          userId: user.id,
          question: sq.question,
          answerHash
        }
      });
    }

    // Generate 100 backup codes
    const backupCodes = [];
    for (let i = 0; i < 100; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(code, 10);
      await prisma.backupCode.create({
        data: {
          userId: user.id,
          codeHash
        }
      });
      backupCodes.push(code);
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE_USER',
        description: `Admin created new user: ${email}`,
        severity: 'MEDIUM',
        ipAddress: req.ip,
        metadata: {
          newUserId: user.id,
          accountNumber,
          isAdmin
        }
      }
    });

    return res.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        accountStatus: user.accountStatus,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin
      },
      backupCodesGenerated: backupCodes.length
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all deposits with filtering
// GET /api/v1/mybanker/deposits?status=all
router.get('/deposits', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build where clause based on status filter
    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    const deposits = await prisma.deposit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            accountNumber: true
          }
        },
        gateway: {
          select: {
            id: true,
            name: true,
            type: true,
            network: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      count: deposits.length,
      deposits
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Approve deposit
// POST /api/v1/mybanker/deposits/:depositId/approve
router.post('/deposits/:depositId/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { depositId } = req.params;
    const { notes } = req.body;
    
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true, gateway: true }
    });
    
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deposit has already been processed' });
    }
    
    // Get user's primary account
    const primaryAccount = await prisma.account.findFirst({
      where: {
        userId: deposit.userId,
        isPrimary: true
      }
    });
    
    if (!primaryAccount) {
      return res.status(404).json({ error: 'User primary account not found' });
    }
    
    // Update deposit and credit account in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: 'COMPLETED',
          processedBy: req.user.userId,
          processedAt: new Date(),
          adminNotes: notes
        }
      });
      
      // Credit the primary account
      const updatedAccount = await tx.account.update({
        where: { id: primaryAccount.id },
        data: {
          balance: { increment: deposit.amount },
          availableBalance: { increment: deposit.amount }
        }
      });
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          accountId: primaryAccount.id,
          amount: deposit.amount,
          type: 'DEPOSIT',
          description: deposit.description || 'Deposit approved by admin',
          status: 'COMPLETED',
          category: 'deposit',
          reference: deposit.reference
        }
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: deposit.userId,
          type: 'deposit',
          title: 'Deposit Approved',
          message: `Your deposit of $${deposit.amount.toFixed(2)} has been approved and credited to your account.`,
          metadata: {
            depositId: deposit.id,
            amount: deposit.amount,
            reference: deposit.reference
          }
        }
      });
      
      return { updatedDeposit, updatedAccount };
    });
    
    return res.json({
      success: true,
      message: 'Deposit approved successfully',
      deposit: result.updatedDeposit
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Reject deposit
// POST /api/v1/mybanker/deposits/:depositId/reject
router.post('/deposits/:depositId/reject', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { depositId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });
    
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }
    
    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deposit has already been processed' });
    }
    
    // Update deposit status
    const updatedDeposit = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: 'REJECTED',
        processedBy: req.user.userId,
        processedAt: new Date(),
        rejectionReason: reason,
        adminNotes: reason
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: deposit.userId,
        type: 'deposit',
        title: 'Deposit Rejected',
        message: `Your deposit of $${deposit.amount.toFixed(2)} was rejected. Reason: ${reason}`,
        metadata: {
          depositId: deposit.id,
          amount: deposit.amount,
          reason
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Deposit rejected successfully',
      deposit: updatedDeposit
    });
  } catch (error) {
    console.error('Reject deposit error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// WITHDRAWAL MANAGEMENT ROUTES
// ============================================

// Get all withdrawals (admin)
// GET /api/v1/mybanker/withdrawals
router.get('/withdrawals', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Approve withdrawal
// POST /api/v1/mybanker/withdrawals/:withdrawalId/approve
router.post('/withdrawals/:withdrawalId/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { notes } = req.body;
    
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: true,
        account: true
      }
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Withdrawal has already been processed' });
    }
    
    // Check if account has sufficient balance
    if (parseFloat(withdrawal.account.balance) < parseFloat(withdrawal.amount)) {
      return res.status(400).json({ error: 'Insufficient balance in account' });
    }
    
    // Process withdrawal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          processedBy: req.user.userId,
          processedAt: new Date(),
          adminNotes: notes || 'Approved by admin'
        }
      });
      
      // Deduct from account balance
      const updatedAccount = await tx.account.update({
        where: { id: withdrawal.accountId },
        data: {
          balance: {
            decrement: parseFloat(withdrawal.amount)
          },
          availableBalance: {
            decrement: parseFloat(withdrawal.amount)
          }
        }
      });
      
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: withdrawal.accountId,
          type: 'WITHDRAWAL',
          amount: parseFloat(withdrawal.amount),
          description: withdrawal.description || 'Withdrawal',
          status: 'COMPLETED',
          reference: `WTH-${Date.now()}`,
          metadata: {
            withdrawalId: withdrawal.id,
            approvedBy: req.user.userId,
            notes
          }
        }
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          type: 'withdrawal',
          title: 'Withdrawal Approved',
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been approved and processed.`,
          metadata: {
            withdrawalId: withdrawal.id,
            amount: withdrawal.amount,
            transactionId: transaction.id
          }
        }
      });
      
      return { updatedWithdrawal, updatedAccount, transaction };
    });
    
    return res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal: result.updatedWithdrawal
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Reject withdrawal
// POST /api/v1/mybanker/withdrawals/:withdrawalId/reject
router.post('/withdrawals/:withdrawalId/reject', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Withdrawal has already been processed' });
    }
    
    // Update withdrawal status
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        processedBy: req.user.userId,
        processedAt: new Date(),
        rejectionReason: reason,
        adminNotes: reason
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        type: 'withdrawal',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} was rejected. Reason: ${reason}`,
        metadata: {
          withdrawalId: withdrawal.id,
          amount: withdrawal.amount,
          reason
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Withdrawal rejected successfully',
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get user accounts
// GET /api/v1/mybanker/users/:userId/accounts
router.get('/users/:userId/accounts', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching accounts for user:', userId);
    
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        availableBalance: true,
        isPrimary: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { isPrimary: 'desc' }
    });
    
    console.log(`Found ${accounts.length} accounts for user ${userId}`);
    
    return res.json({
      success: true,
      accounts
    });
  } catch (error) {
    console.error('Get user accounts error:', error);
    console.error('Error details:', error.message);
    return res.status(500).json({ error: error.message, details: 'Failed to load user accounts' });
  }
});

// Create admin deposit (direct credit)
// POST /api/v1/mybanker/deposits
router.post('/deposits', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userEmail, amount, method, description } = req.body;
    
    if (!userEmail || !amount) {
      return res.status(400).json({ error: 'User email and amount are required' });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's primary account
    const primaryAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        isPrimary: true
      }
    });
    
    if (!primaryAccount) {
      return res.status(404).json({ error: 'User primary account not found' });
    }
    
    // Generate unique reference
    const reference = `ADM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Create deposit and transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit record
      const deposit = await tx.deposit.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          method: method || 'ADMIN_CREDIT',
          reference,
          description: description || 'Admin deposit',
          status: 'COMPLETED',
          processedBy: req.user.userId,
          processedAt: new Date()
        }
      });
      
      // Credit the primary account
      const updatedAccount = await tx.account.update({
        where: { id: primaryAccount.id },
        data: {
          balance: { increment: parseFloat(amount) },
          availableBalance: { increment: parseFloat(amount) }
        }
      });
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: primaryAccount.id,
          amount: parseFloat(amount),
          type: 'DEPOSIT',
          description: description || 'Admin deposit',
          status: 'COMPLETED',
          category: 'admin_deposit',
          reference
        }
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'deposit',
          title: 'Deposit Received',
          message: `$${parseFloat(amount).toFixed(2)} has been credited to your account by admin.`,
          metadata: {
            depositId: deposit.id,
            amount: parseFloat(amount),
            reference
          }
        }
      });
      
      return { deposit, updatedAccount };
    });
    
    return res.json({
      success: true,
      message: 'Deposit created and account credited successfully',
      deposit: result.deposit
    });
  } catch (error) {
    console.error('Create admin deposit error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Save admin settings
// POST /api/v1/mybanker/settings
router.post('/settings', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    // Store settings in database or configuration
    // For now, we'll just acknowledge receipt
    // In production, you'd save to a Settings table
    
    return res.json({
      success: true,
      message: 'Settings saved successfully',
      settings
    });
  } catch (error) {
    console.error('Save settings error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get user cards (debit and credit)
// GET /api/v1/mybanker/users/:userId/cards
router.get('/users/:userId/cards', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get debit cards
    const debitCards = await prisma.debitCard.findMany({
      where: {
        account: {
          userId
        }
      },
      include: {
        account: {
          select: {
            accountType: true,
            accountNumber: true
          }
        }
      }
    });
    
    // Get credit cards
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
      select: {
        id: true,
        cardNumber: true,
        cvv: true,
        expiryDate: true,
        cardHolderName: true,
        status: true,
        creditLimit: true,
        availableCredit: true,
        currentBalance: true,
        apr: true,
        isActive: true,
        isFrozen: true,
        createdAt: true
      }
    });
    
    // Format debit cards
    const formattedDebitCards = debitCards.map(card => ({
      id: card.id,
      cardNumber: card.cardNumber,
      cvv: card.cvv,
      expiryDate: card.expiryDate,
      cardholderName: card.cardholderName,
      cardType: 'DEBIT',
      status: card.isActive ? (card.isFrozen ? 'FROZEN' : 'ACTIVE') : 'INACTIVE',
      dailyLimit: card.dailyLimit ? parseFloat(card.dailyLimit.toString()) : 0,
      monthlyLimit: card.monthlyLimit ? parseFloat(card.monthlyLimit.toString()) : 0,
      accountType: card.account?.accountType,
      accountNumber: card.account?.accountNumber,
      createdAt: card.createdAt
    }));
    
    // Format credit cards
    const formattedCreditCards = creditCards.map(card => ({
      id: card.id,
      cardNumber: card.cardNumber,
      cvv: card.cvv,
      expiryDate: card.expiryDate,
      cardholderName: card.cardHolderName,
      cardType: 'CREDIT',
      status: card.status,
      creditLimit: card.creditLimit ? parseFloat(card.creditLimit.toString()) : 0,
      availableCredit: card.availableCredit ? parseFloat(card.availableCredit.toString()) : 0,
      currentBalance: card.currentBalance ? parseFloat(card.currentBalance.toString()) : 0,
      apr: card.apr ? parseFloat(card.apr.toString()) : 0,
      isActive: card.isActive,
      isFrozen: card.isFrozen,
      accountType: 'CREDIT',
      createdAt: card.createdAt
    }));
    
    // Combine all cards
    const allCards = [...formattedDebitCards, ...formattedCreditCards].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return res.json({
      success: true,
      cards: allCards
    });
  } catch (error) {
    console.error('Get user cards error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Update card limits and status
// PUT /api/v1/mybanker/cards/:cardId
router.put('/cards/:cardId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { cardNumber, expiryDate, dailyLimit, monthlyLimit, status } = req.body;
    
    // Try to find as debit card first
    let debitCard = await prisma.debitCard.findUnique({
      where: { id: cardId }
    });
    
    if (debitCard) {
      // Update debit card
      const updateData = {};
      if (cardNumber !== undefined) {
        // Encode card number to base64
        updateData.cardNumber = Buffer.from(cardNumber).toString('base64');
      }
      if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
      if (dailyLimit !== undefined) updateData.dailyLimit = parseFloat(dailyLimit);
      if (monthlyLimit !== undefined) updateData.monthlyLimit = parseFloat(monthlyLimit);
      if (status !== undefined) {
        updateData.isActive = status === 'ACTIVE' || status === 'FROZEN';
        updateData.isFrozen = status === 'FROZEN';
      }
      
      const updatedCard = await prisma.debitCard.update({
        where: { id: cardId },
        data: updateData
      });
      
      return res.json({
        success: true,
        message: 'Debit card updated successfully',
        card: updatedCard
      });
    }
    
    // Try credit card
    let creditCard = await prisma.creditCard.findUnique({
      where: { id: cardId }
    });
    
    if (creditCard) {
      // Update credit card
      const updateData = {};
      if (cardNumber !== undefined) {
        // Encode card number to base64
        updateData.cardNumber = Buffer.from(cardNumber).toString('base64');
      }
      if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
      // Credit cards use creditLimit, not dailyLimit/monthlyLimit
      if (dailyLimit !== undefined) updateData.creditLimit = parseFloat(dailyLimit);
      if (status !== undefined) updateData.status = status;
      
      const updatedCard = await prisma.creditCard.update({
        where: { id: cardId },
        data: updateData
      });
      
      return res.json({
        success: true,
        message: 'Credit card updated successfully',
        card: updatedCard
      });
    }
    
    return res.status(404).json({ error: 'Card not found' });
  } catch (error) {
    console.error('Update card error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete card (debit or credit)
// DELETE /api/v1/mybanker/cards/:cardId
router.delete('/cards/:cardId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    
    // Try to find as debit card first
    let debitCard = await prisma.debitCard.findUnique({
      where: { id: cardId }
    });
    
    if (debitCard) {
      // Delete debit card
      await prisma.debitCard.delete({
        where: { id: cardId }
      });
      
      return res.json({
        success: true,
        message: 'Debit card deleted successfully'
      });
    }
    
    // Try credit card
    let creditCard = await prisma.creditCard.findUnique({
      where: { id: cardId }
    });
    
    if (creditCard) {
      // Delete credit card
      await prisma.creditCard.delete({
        where: { id: cardId }
      });
      
      return res.json({
        success: true,
        message: 'Credit card deleted successfully'
      });
    }
    
    return res.status(404).json({ error: 'Card not found' });
  } catch (error) {
    console.error('Delete card error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Fix missing accounts for users
// POST /api/v1/mybanker/fix-accounts/:userId
router.post('/fix-accounts/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fixing accounts for user:', userId);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check existing accounts
    const existingAccounts = await prisma.account.findMany({
      where: { userId }
    });
    
    console.log(`User has ${existingAccounts.length} existing accounts`);
    
    const createdAccounts = [];
    
    // Create Savings account if missing
    const hasSavings = existingAccounts.some(acc => acc.accountType === 'SAVINGS');
    if (!hasSavings) {
      const savingsNumber = `7${String(Math.floor(100000000 + Math.random() * 900000000))}`;
      const savingsAccount = await prisma.account.create({
        data: {
          userId: user.id,
          accountType: 'SAVINGS',
          accountNumber: savingsNumber,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'USD',
          isActive: true,
          isPrimary: existingAccounts.length === 0 // Primary if first account
        }
      });
      createdAccounts.push(savingsAccount);
      console.log('Created Savings account:', savingsNumber);
    }
    
    // Create Checking account if missing
    const hasChecking = existingAccounts.some(acc => acc.accountType === 'CHECKING');
    if (!hasChecking) {
      const checkingNumber = `03${String(Math.floor(100000000 + Math.random() * 900000000))}`;
      const checkingAccount = await prisma.account.create({
        data: {
          userId: user.id,
          accountType: 'CHECKING',
          accountNumber: checkingNumber,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'USD',
          isActive: true,
          isPrimary: false
        }
      });
      createdAccounts.push(checkingAccount);
      console.log('Created Checking account:', checkingNumber);
    }
    
    if (createdAccounts.length === 0) {
      return res.json({
        success: true,
        message: 'User already has all required accounts',
        accounts: existingAccounts
      });
    }
    
    return res.json({
      success: true,
      message: `Created ${createdAccounts.length} missing account(s)`,
      createdAccounts,
      allAccounts: [...existingAccounts, ...createdAccounts]
    });
  } catch (error) {
    console.error('Fix accounts error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
