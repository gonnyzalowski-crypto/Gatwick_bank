import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCryptoWalletAddress, detectCryptoType } from '../utils/walletGenerator.js';

const router = express.Router();
const prisma = new PrismaClient();

// Generate 10-digit account number starting with 7
const generateAccountNumber = () => {
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return '7' + randomDigits;
};

// POST /api/v1/fix-accounts - Fix all account numbers
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Starting account number standardization...');

    // Get all accounts
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        accountName: true,
        userId: true
      }
    });

    console.log(`📊 Found ${accounts.length} accounts to check`);

    let updatedCount = 0;
    let cryptoWalletCount = 0;
    let regularAccountCount = 0;
    const updates = [];

    for (const account of accounts) {
      let needsUpdate = false;
      let newAccountNumber = account.accountNumber;

      // Check if it's a crypto wallet
      if (account.accountType === 'CRYPTO_WALLET') {
        // Check if it has a proper crypto address format
        const isBitcoinAddress = account.accountNumber.startsWith('bc1');
        const isEthereumAddress = account.accountNumber.startsWith('0x') && account.accountNumber.length === 42;
        
        if (!isBitcoinAddress && !isEthereumAddress) {
          // Generate proper crypto wallet address
          const cryptoType = detectCryptoType(account.accountName);
          newAccountNumber = generateCryptoWalletAddress(cryptoType);
          needsUpdate = true;
          cryptoWalletCount++;
          updates.push({
            id: account.id,
            type: 'CRYPTO_WALLET',
            old: account.accountNumber,
            new: newAccountNumber
          });
        }
      } else {
        // Regular account (CHECKING, SAVINGS, BUSINESS)
        // Check if it follows the 7XXXXXXXXX format (10 digits starting with 7)
        const isValidFormat = /^7\d{9}$/.test(account.accountNumber);
        
        if (!isValidFormat) {
          newAccountNumber = generateAccountNumber();
          needsUpdate = true;
          regularAccountCount++;
          updates.push({
            id: account.id,
            type: account.accountType,
            old: account.accountNumber,
            new: newAccountNumber
          });
        }
      }

      // Update if needed
      if (needsUpdate) {
        await prisma.account.update({
          where: { id: account.id },
          data: { accountNumber: newAccountNumber }
        });
        updatedCount++;
      }
    }

    return res.json({
      success: true,
      message: 'Account standardization complete',
      summary: {
        totalAccounts: accounts.length,
        accountsUpdated: updatedCount,
        cryptoWalletsFixed: cryptoWalletCount,
        regularAccountsFixed: regularAccountCount,
        alreadyCompliant: accounts.length - updatedCount
      },
      updates
    });

  } catch (error) {
    console.error('❌ Error fixing account numbers:', error);
    return res.status(500).json({ 
      error: 'Failed to fix account numbers',
      details: error.message 
    });
  }
});

export default router;
