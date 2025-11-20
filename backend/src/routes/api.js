import express from 'express';
import authRouter from './auth.js';
import { accountsRouter } from './accounts.js';
import { cardsRouter } from './cards.js';
import { transactionsRouter } from './transactions.js';
import { paymentsRouter } from './payments.js';
import { invoicesRouter } from './invoices.js';
import adminRouter from './admin.js';
import adminCardsRouter from './adminCards.js';
import adminTransfersRouter from './adminTransfers.js';
import notificationsRouter from './notifications.js';
import kycRouter from './kyc.js';
import transfersRouter from './transfers.js';
import marketsRouter from './markets.js';
import supportRouter from './support.js';
import gatewaysRouter from './gateways.js';
import supportTicketsRouter from './supportTickets.js';
import fixUsersRouter from './fix-users.js';
import { verifyAuth } from '../middleware/auth.js';
import { getAccountSummary } from '../services/accountService.js';

const router = express.Router();

// API versioning: /api/v1/*
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/cards', cardsRouter);
router.use('/transactions', transactionsRouter);
router.use('/payments', paymentsRouter);
router.use('/invoices', invoicesRouter);
router.use('/mybanker', adminRouter);
router.use('/admin/cards', adminCardsRouter);
router.use('/admin/transfers', adminTransfersRouter);
router.use('/transfers', transfersRouter);
router.use('/markets', marketsRouter);
router.use('/support', supportRouter);
router.use('/gateways', gatewaysRouter);
router.use('/support-tickets', supportTicketsRouter);
router.use('/notifications', notificationsRouter);
router.use('/kyc', kycRouter);
router.use('/', fixUsersRouter); // Temporary fix route

/**
 * GET /api/v1/dashboard
 * Get dashboard data (summary of all accounts, cards, transactions)
 */
router.get('/dashboard', verifyAuth, async (req, res) => {
	try {
		const summary = await getAccountSummary(req.user.userId);
		res.json({
			success: true,
			dashboard: {
				timestamp: new Date().toISOString(),
				summary: summary.summary,
				recentTransactions: summary.recentTransactions,
			},
		});
	} catch (error) {
		console.error('Error in GET /dashboard:', error);
		res.status(500).json({ error: error.message });
	}
});

export default router;