import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import * as fixedDepositService from '../services/fixedDepositService.js';

const router = express.Router();

/**
 * POST /api/v1/fixed-deposits
 * Create a new fixed deposit
 */
router.post('/', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId, principalAmount, interestRate, termMonths, autoRenew } = req.body;

    // Validation
    if (!accountId || !principalAmount || !interestRate || !termMonths) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountId, principalAmount, interestRate, termMonths' 
      });
    }

    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);
    const term = parseInt(termMonths);

    if (principal <= 0) {
      return res.status(400).json({ error: 'Principal amount must be greater than 0' });
    }

    if (rate <= 0 || rate > 100) {
      return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
    }

    if (term < 1 || term > 120) {
      return res.status(400).json({ error: 'Term must be between 1 and 120 months' });
    }

    const fixedDeposit = await fixedDepositService.createFixedDeposit(
      userId,
      accountId,
      principal,
      rate,
      term,
      autoRenew || false
    );

    return res.status(201).json({
      success: true,
      message: 'Fixed deposit created successfully',
      data: fixedDeposit
    });

  } catch (error) {
    console.error('Create fixed deposit error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create fixed deposit' 
    });
  }
});

/**
 * GET /api/v1/fixed-deposits
 * Get all fixed deposits for logged-in user
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deposits = await fixedDepositService.getUserFixedDeposits(userId);

    return res.json({
      success: true,
      data: deposits
    });

  } catch (error) {
    console.error('Get fixed deposits error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch fixed deposits' 
    });
  }
});

/**
 * GET /api/v1/fixed-deposits/stats
 * Get fixed deposit statistics for user
 */
router.get('/stats', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await fixedDepositService.getFixedDepositStats(userId);

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get fixed deposit stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch statistics' 
    });
  }
});

/**
 * GET /api/v1/fixed-deposits/:depositId
 * Get specific fixed deposit details
 */
router.get('/:depositId', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { depositId } = req.params;

    const deposit = await fixedDepositService.getFixedDepositById(depositId, userId);

    return res.json({
      success: true,
      data: deposit
    });

  } catch (error) {
    console.error('Get fixed deposit error:', error);
    return res.status(404).json({ 
      error: error.message || 'Fixed deposit not found' 
    });
  }
});

/**
 * POST /api/v1/fixed-deposits/:depositId/withdraw
 * Withdraw a fixed deposit
 */
router.post('/:depositId/withdraw', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { depositId } = req.params;

    const result = await fixedDepositService.withdrawFixedDeposit(depositId, userId);

    return res.json({
      success: true,
      message: result.isMatured 
        ? 'Fixed deposit matured and withdrawn successfully' 
        : 'Fixed deposit withdrawn early (principal only)',
      data: result
    });

  } catch (error) {
    console.error('Withdraw fixed deposit error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to withdraw fixed deposit' 
    });
  }
});

export default router;
