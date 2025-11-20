import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  getUserTransactions,
  getTransactionById,
  createTransaction,
  getTransactionsByCategory,
  getSpendingSummary,
} from '../services/transactionService.js';

export const transactionsRouter = Router();

// Protect all transaction routes
transactionsRouter.use(verifyAuth);

/**
 * GET /api/v1/transactions
 * Get all transactions for the current user
 * Query params: accountId (optional), limit (default 50), offset (default 0)
 */
transactionsRouter.get('/', async (req, res) => {
  try {
    const accountId = req.query.accountId || null;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const result = await getUserTransactions(req.user.userId, accountId, limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transactions/summary
 * Get spending summary for analytics
 */
transactionsRouter.get('/summary/spending', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await getSpendingSummary(req.user.userId, days);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /transactions/summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transactions/category/:category
 * Get transactions by category
 */
transactionsRouter.get('/category/:category', async (req, res) => {
  try {
    const result = await getTransactionsByCategory(
      req.user.userId,
      req.params.category,
      parseInt(req.query.limit) || 50
    );
    res.json(result);
  } catch (error) {
    console.error('Error in GET /transactions/category/:category:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transactions/:id
 * Get a specific transaction by ID
 */
transactionsRouter.get('/:id', async (req, res) => {
  try {
    const result = await getTransactionById(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /transactions/:id:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * POST /api/v1/transactions
 * Create a new transaction (admin/system use)
 */
transactionsRouter.post('/', async (req, res) => {
  try {
    const { accountId, cardId, amount, type, description, category, merchantName } = req.body;

    if (!accountId || !amount || !type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: accountId, amount, type, description',
      });
    }
    const result = await createTransaction(accountId, {
      cardId,
      amount,
      type,
      description,
      category,
      merchantName,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /transactions:', error);
    return res.status(500).json({ error: error.message });
  }
});