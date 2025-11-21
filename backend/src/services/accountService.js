import prisma from '../config/prisma.js';
import { generateCryptoWalletAddress, detectCryptoType } from '../utils/walletGenerator.js';

// Generate 10-digit account number starting with 7
export const generateAccountNumber = (accountType) => {
  // Generate 9 random digits (0-999999999)
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  // All account numbers start with 7
  return '7' + randomDigits;
};

// Calculate balances for an account
export const calculateBalances = async (accountId) => {
  // Get all transactions for account
  const transactions = await prisma.transaction.findMany({
    where: { accountId }
  });
  
  let available = 0;
  let pending = 0;
  
  transactions.forEach(tx => {
    const amount = parseFloat(tx.amount);
    if (tx.status === 'COMPLETED') {
      available += amount;
    } else if (tx.status === 'PENDING') {
      pending += amount;
    }
  });
  
  const current = available + pending;
  
  // Update account
  await prisma.account.update({
    where: { id: accountId },
    data: {
      availableBalance: available,
      pendingBalance: pending,
      balance: current
    }
  });
  
  return { available, pending, current };
};

// Create new account
export const createAccount = async (userId, accountType, accountName) => {
  let accountNumber;
  
  // Generate wallet address for crypto accounts, regular account number for others
  if (accountType === 'CRYPTO_WALLET') {
    const cryptoType = detectCryptoType(accountName);
    accountNumber = generateCryptoWalletAddress(cryptoType);
  } else {
    accountNumber = generateAccountNumber(accountType);
  }
  
  const account = await prisma.account.create({
    data: {
      userId,
      accountType,
      accountNumber,
      accountName: accountName || `${accountType} Account`,
      balance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      currency: 'USD',
      isActive: true,
      isPrimary: false
    }
  });
  
  return account;
};

// Get accounts by type
export const getAccountsByType = async (userId, type) => {
  return await prisma.account.findMany({
    where: {
      userId,
      accountType: type,
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Get account balances breakdown
export const getAccountBalances = async (accountId, userId) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      accountNumber: true,
      balance: true,
      availableBalance: true,
      pendingBalance: true,
      currency: true
    }
  });
  
  if (!account) {
    throw new Error('Account not found or unauthorized');
  }
  
  return {
    success: true,
    balances: {
      current: Number(account.balance),
      available: Number(account.availableBalance),
      pending: Number(account.pendingBalance),
      currency: account.currency
    }
  };
};

// Get all accounts for a user
export const getUserAccounts = async (userId) => {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      accountType: true,
      accountNumber: true,
      balance: true,
      availableBalance: true,
      pendingBalance: true,
      accountName: true,
      currency: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    count: accounts.length,
    accounts,
  };
};

// Get a specific account by ID (ensuring it belongs to the user)
export const getAccountById = async (accountId, userId) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      accountType: true,
      accountNumber: true,
      balance: true,
      currency: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      cards: {
        select: {
          id: true,
          cardType: true,
          isActive: true,
          isFrozen: true,
          dailyLimit: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      transactions: {
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          category: true,
          merchantName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!account) {
    throw new Error('Account not found or unauthorized');
  }

  return {
    success: true,
    account,
  };
};

// Get account summary (used by /api/v1/accounts/summary and /api/v1/dashboard)
export const getAccountSummary = async (userId) => {
  const [accounts, cards, recentTransactions] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        accountType: true,
        balance: true,
        availableBalance: true,
      },
    }),
    prisma.card.findMany({
      where: {
        account: { userId },
      },
      select: {
        id: true,
        isActive: true,
        isFrozen: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        account: { userId },
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0,
  );

  const availableBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.availableBalance || acc.balance),
    0,
  );

  const pendingBalance = totalBalance - availableBalance;

  const activeCards = cards.filter((c) => c.isActive && !c.isFrozen).length;

  const summary = {
    totalBalance: Number(totalBalance.toFixed(2)),
    availableBalance: Number(availableBalance.toFixed(2)),
    pendingBalance: Number(pendingBalance.toFixed(2)),
    accountCount: accounts.length,
    totalCards: cards.length,
    activeCards,
    recentTransactionCount: recentTransactions.length,
  };

  return {
    success: true,
    summary,
    recentTransactions,
  };
};

// Get account statistics for analytics (used by /api/v1/accounts/stats)
export const getAccountStats = async (userId) => {
  const [accounts, allTransactions] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        account: { userId },
      },
      select: {
        amount: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const totalTransactions = allTransactions.length;

  // Spending by category
  const spendingByCategory = {};
  for (const tx of allTransactions) {
    const category = tx.category || 'Other';
    const amount = Number(tx.amount);
    spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
  }

  // Monthly spending trend (YYYY-MM)
  const monthlySpending = {};
  for (const tx of allTransactions) {
    const month = new Date(tx.createdAt).toISOString().slice(0, 7);
    const amount = Number(tx.amount);
    monthlySpending[month] = (monthlySpending[month] || 0) + amount;
  }

  return {
    success: true,
    stats: {
      accountCount: accounts.length,
      totalTransactions,
      spendingByCategory,
      monthlySpending,
    },
  };
};
