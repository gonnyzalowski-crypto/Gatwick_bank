import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  getBankList,
  validateRoutingNumber,
  createTransferRequest,
  getUserTransfers,
  getTransferById,
  saveBeneficiary,
  getBeneficiaries,
  deleteBeneficiary
} from '../services/transferService.js';

export const transfersRouter = Router();

// Protect all routes
transfersRouter.use(verifyAuth);

/**
 * GET /api/v1/transfers/banks
 * Get list of all banks
 */
transfersRouter.get('/banks', async (req, res) => {
  try {
    const result = await getBankList();
    res.json(result);
  } catch (error) {
    console.error('Error getting banks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/transfers/validate-routing
 * Validate routing number
 */
transfersRouter.post('/validate-routing', async (req, res) => {
  try {
    const { routingNumber } = req.body;
    
    if (!routingNumber) {
      return res.status(400).json({ error: 'Routing number is required' });
    }
    
    const result = await validateRoutingNumber(routingNumber);
    res.json(result);
  } catch (error) {
    console.error('Error validating routing number:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/transfers
 * Create transfer request
 */
transfersRouter.post('/', async (req, res) => {
  try {
    const { fromAccountId, destinationBank, routingNumber, accountNumber, accountName, amount, description, saveBeneficiary, beneficiaryNickname } = req.body;
    
    if (!fromAccountId || !destinationBank || !routingNumber || !accountNumber || !accountName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await createTransferRequest(req.user.userId, {
      fromAccountId,
      destinationBank,
      routingNumber,
      accountNumber,
      accountName,
      amount: parseFloat(amount),
      description,
      saveBeneficiary,
      beneficiaryNickname
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transfers
 * Get user's transfers
 */
transfersRouter.get('/', async (req, res) => {
  try {
    const result = await getUserTransfers(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting transfers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transfers/:id
 * Get transfer by ID
 */
transfersRouter.get('/:id', async (req, res) => {
  try {
    const result = await getTransferById(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting transfer:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * POST /api/v1/transfers/beneficiaries
 * Save beneficiary
 */
transfersRouter.post('/beneficiaries', async (req, res) => {
  try {
    const { bankName, routingNumber, accountNumber, accountName, nickname } = req.body;
    
    if (!bankName || !routingNumber || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await saveBeneficiary(req.user.userId, {
      bankName,
      routingNumber,
      accountNumber,
      accountName,
      nickname
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving beneficiary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/transfers/beneficiaries
 * Get beneficiaries
 */
transfersRouter.get('/beneficiaries/list', async (req, res) => {
  try {
    const result = await getBeneficiaries(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting beneficiaries:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/transfers/beneficiaries/:id
 * Delete beneficiary
 */
transfersRouter.delete('/beneficiaries/:id', async (req, res) => {
  try {
    const result = await deleteBeneficiary(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default transfersRouter;
