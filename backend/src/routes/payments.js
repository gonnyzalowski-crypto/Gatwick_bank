import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import prisma from '../config/prisma.js';
import * as paymentService from '../services/paymentService.js';

const paymentsRouter = express.Router();

/**
 * POST /api/v1/payments/deposit
 * Create deposit request (requires admin approval)
 */
paymentsRouter.post('/deposit', verifyAuth, upload.single('paymentProof'), async (req, res) => {
  try {
    const { accountId, amount, description, gatewayId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required',
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Generate unique reference
    const reference = `DEP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.userId,
        gatewayId: gatewayId || null,
        amount: parseFloat(amount),
        method: gatewayId ? 'CRYPTO' : 'OTHER',
        reference,
        description: description || 'Deposit request',
        paymentProof: req.file ? req.file.path : null,
        status: 'PENDING'
      }
    });

    // Create notification for admins
    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: 'deposit',
        title: 'Deposit Request Submitted',
        message: `Your deposit request of $${amount} is pending admin approval.`,
        metadata: {
          depositId: deposit.id,
          reference,
          amount: parseFloat(amount)
        }
      }
    });

    return res.status(201).json({
      success: true,
      deposit,
      message: 'Deposit request submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('Error in POST /deposit:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/payments/withdrawal
 * Create a withdrawal request (pending admin approval)
 */
paymentsRouter.post('/withdrawal', verifyAuth, async (req, res) => {
  try {
    const { accountId, amount, description, gatewayId, backupCode } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'Account ID is required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0',
      });
    }

    if (!backupCode || backupCode.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Valid 6-digit backup code is required',
      });
    }

    // Verify backup code
    const validBackupCode = await prisma.backupCode.findFirst({
      where: {
        userId: req.user.userId,
        code: backupCode,
        isUsed: false
      }
    });

    if (!validBackupCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or already used backup code',
      });
    }

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found or unauthorized',
      });
    }

    // Check sufficient balance
    if (parseFloat(account.balance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
      });
    }

    // Create pending withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.userId,
        accountId,
        amount: parseFloat(amount),
        description: description || 'Withdrawal request',
        gatewayId,
        status: 'PENDING',
        reference: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        metadata: {
          backupCodeUsed: validBackupCode.id
        }
      }
    });

    // Mark backup code as used
    await prisma.backupCode.update({
      where: { id: validBackupCode.id },
      data: { isUsed: true }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: 'withdrawal',
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request of $${amount} is pending admin approval.`,
        metadata: {
          withdrawalId: withdrawal.id,
          amount: parseFloat(amount)
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Error in POST /withdrawal:', error);

    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/payments/international-transfer
 * International transfer via SWIFT/IBAN
 */
paymentsRouter.post('/international-transfer', verifyAuth, async (req, res) => {
  try {
    const { fromAccountId, recipientName, recipientIBAN, recipientBank, recipientCountry, amount, description } = req.body;

    if (!fromAccountId || !recipientName || !recipientIBAN || !recipientBank || !recipientCountry) {
      return res.status(400).json({
        success: false,
        message: 'All recipient details are required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const result = await paymentService.internationalTransfer(fromAccountId, req.user.userId, {
      recipientName,
      recipientIBAN,
      recipientBank,
      recipientCountry,
      amount,
      description: description || 'International transfer',
    });

    return res.status(201).json({
      success: true,
      payment: result.payment,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error in POST /international-transfer:', error);

    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/payments/transfer
 * Transfer money between user's own accounts
 */
paymentsRouter.post('/transfer', verifyAuth, async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Both source and destination accounts are required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const result = await paymentService.transferMoney(fromAccountId, toAccountId, req.user.userId, {
      amount,
      description,
    });

    return res.status(201).json({
      success: true,
      payment: result.payment,
      transactions: result.transactions,
    });
  } catch (error) {
    console.error('Error in POST /transfer:', error);

    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/payments/p2p
 * Send peer-to-peer payment to another user
 */
paymentsRouter.post('/p2p', verifyAuth, async (req, res) => {
  try {
    const { fromAccountId, toUserId, amount, description, toAccountId } = req.body;

    if (!fromAccountId || !toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Source account and recipient are required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const result = await paymentService.sendPeerPayment(
      fromAccountId,
      toUserId,
      req.user.userId,
      { amount, description, toAccountId },
    );

    return res.status(201).json({
      success: true,
      payment: result.payment,
      transactions: result.transactions,
    });
  } catch (error) {
    console.error('Error in POST /p2p:', error);

    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/payments/bill
 * Pay a bill from an account
 */
paymentsRouter.post('/bill', verifyAuth, async (req, res) => {
  try {
    const { accountId, billName, amount, reference, description } = req.body;

    if (!accountId || !billName) {
      return res.status(400).json({
        success: false,
        message: 'Account and bill name are required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const result = await paymentService.payBill(accountId, req.user.userId, {
      billName,
      amount,
      reference,
      description,
    });

    return res.status(201).json({
      success: true,
      payment: result.payment,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error in POST /bill:', error);

    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/v1/payments/account/:accountId
 * Get payment history for an account
 */
paymentsRouter.get('/account/:accountId', verifyAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const result = await paymentService.getPaymentHistory(
      req.user.userId,
      accountId,
      limit,
      offset,
    );

    return res.json({
      success: true,
      payments: result.payments,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error('Error in GET /account/:accountId:', error);

    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/v1/payments/history
 * Get all payments for user (combined from all accounts)
 */
paymentsRouter.get('/history', verifyAuth, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const result = await paymentService.getUserPayments(
      req.user.userId,
      limit,
      offset,
    );

    return res.json({
      success: true,
      payments: result.payments,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error('Error in GET /history:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/v1/payments/stats/overview
 * Get payment statistics for user
 */
paymentsRouter.get('/stats/overview', verifyAuth, async (req, res) => {
  try {
    const stats = await paymentService.getPaymentStats(req.user.userId);
    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Error in GET /stats/overview:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export { paymentsRouter };
