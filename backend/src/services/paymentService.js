import prisma from '../config/prisma.js';

// Ensure an account belongs to the given user
const getUserAccountOrThrow = async (accountId, userId) => {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    throw new Error('Account not found or unauthorized');
  }
  return account;
};

// Deposit money into an account
export const depositMoney = async (accountId, userId, { amount, description }) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new Error('Account not found or unauthorized');

    const updatedAccount = await tx.account.update({
      where: { id: account.id },
      data: { balance: account.balance.plus(amount) },
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId: account.id,
        amount,
        type: 'credit',
        description: description || 'Deposit',
        category: 'deposit',
        status: 'completed',
      },
    });

    return { account: updatedAccount, transaction };
  });
};

// Withdraw money from an account
export const withdrawMoney = async (accountId, userId, { amount, description }) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new Error('Account not found or unauthorized');

    const accountBalance = Number(account.balance);
    if (accountBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const updatedAccount = await tx.account.update({
      where: { id: account.id },
      data: { balance: account.balance.minus(amount) },
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId: account.id,
        amount,
        type: 'debit',
        description: description || 'Withdrawal',
        category: 'withdrawal',
        status: 'completed',
      },
    });

    return { account: updatedAccount, transaction };
  });
};

// International transfer
export const internationalTransfer = async (fromAccountId, userId, { recipientName, recipientIBAN, recipientBank, recipientCountry, amount, description }) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({ where: { id: fromAccountId, userId } });
    if (!account) throw new Error('Account not found or unauthorized');

    const accountBalance = Number(account.balance);
    if (accountBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const updatedAccount = await tx.account.update({
      where: { id: account.id },
      data: { balance: account.balance.minus(amount) },
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId: account.id,
        amount,
        type: 'TRANSFER',
        description: description || `International transfer to ${recipientName}`,
        category: 'international_transfer',
        status: 'PENDING', // International transfers are pending initially
        merchantName: recipientBank,
      },
    });

    // Create a transfer request for admin approval
    const transferRequest = await tx.transferRequest.create({
      data: {
        userId,
        fromAccountId,
        destinationBank: recipientBank,
        routingNumber: recipientIBAN, // Using IBAN as routing number for international
        accountNumber: recipientIBAN,
        accountName: recipientName,
        amount,
        description: description || `International transfer to ${recipientName}`,
        reference: `INT-${Date.now()}`,
        status: 'PENDING',
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      },
    });

    return { account: updatedAccount, transaction, transferRequest };
  });
};

// Transfer between two accounts owned by the same user
export const transferMoney = async (fromAccountId, toAccountId, userId, { amount, description }) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const from = await tx.account.findFirst({ where: { id: fromAccountId, userId } });
    if (!from) throw new Error('Source account not found or unauthorized');

    const to = await tx.account.findFirst({ where: { id: toAccountId, userId } });
    if (!to) throw new Error('Destination account not found or unauthorized');

    const fromBalance = Number(from.balance);
    if (fromBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const updatedFrom = await tx.account.update({
      where: { id: from.id },
      data: { balance: from.balance.minus(amount) },
    });

    const updatedTo = await tx.account.update({
      where: { id: to.id },
      data: { balance: to.balance.plus(amount) },
    });

    const debitTransaction = await tx.transaction.create({
      data: {
        accountId: from.id,
        amount,
        type: 'debit',
        description: description || `Transfer to ${to.accountNumber}`,
        category: 'transfer',
        status: 'completed',
      },
    });

    const creditTransaction = await tx.transaction.create({
      data: {
        accountId: to.id,
        amount,
        type: 'credit',
        description: description || `Transfer from ${from.accountNumber}`,
        category: 'transfer',
        status: 'completed',
      },
    });

    return {
      payment: {
        fromAccountId: from.id,
        toAccountId: to.id,
        amount,
        description,
      },
      transactions: {
        debit: debitTransaction,
        credit: creditTransaction,
      },
    };
  });
};

// Send peer-to-peer payment to another user
export const sendPeerPayment = async (
  fromAccountId,
  toUserId,
  userId,
  { amount, description, toAccountId }
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const from = await tx.account.findFirst({ where: { id: fromAccountId, userId } });
    if (!from) throw new Error('Source account not found or unauthorized');

    const targetUser = await tx.user.findUnique({ where: { id: toUserId } });
    if (!targetUser) throw new Error('Recipient user not found');

    let to;
    if (toAccountId) {
      to = await tx.account.findFirst({ where: { id: toAccountId, userId: toUserId } });
    } else {
      // pick any active account of recipient
      to = await tx.account.findFirst({ where: { userId: toUserId, isActive: true } });
    }

    if (!to) throw new Error('Recipient account not found');

    const fromBalance = Number(from.balance);
    if (fromBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const updatedFrom = await tx.account.update({
      where: { id: from.id },
      data: { balance: from.balance.minus(amount) },
    });

    const updatedTo = await tx.account.update({
      where: { id: to.id },
      data: { balance: to.balance.plus(amount) },
    });

    const debitTransaction = await tx.transaction.create({
      data: {
        accountId: from.id,
        amount,
        type: 'debit',
        description: description || `P2P payment to ${targetUser.email}`,
        category: 'p2p',
        status: 'completed',
      },
    });

    const creditTransaction = await tx.transaction.create({
      data: {
        accountId: to.id,
        amount,
        type: 'credit',
        description: description || `P2P payment from ${updatedFrom.accountNumber}`,
        category: 'p2p',
        status: 'completed',
      },
    });

    return {
      payment: {
        fromAccountId: from.id,
        toAccountId: to.id,
        toUserId,
        amount,
        description,
      },
      transactions: {
        debit: debitTransaction,
        credit: creditTransaction,
      },
    };
  });
};

// Pay a bill from a specific account
export const payBill = async (accountId, userId, { billName, amount, reference, description }) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new Error('Account not found or unauthorized');

    const balance = Number(account.balance);
    if (balance < amount) {
      throw new Error('Insufficient funds');
    }

    const updated = await tx.account.update({
      where: { id: account.id },
      data: { balance: account.balance.minus(amount) },
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId: account.id,
        amount,
        type: 'debit',
        description: description || `Bill payment: ${billName}`,
        category: 'bill',
        merchantName: billName,
        status: 'completed',
      },
    });

    return {
      payment: {
        accountId: account.id,
        billName,
        amount,
        reference,
        description,
      },
      transaction,
    };
  });
};

// Get payment history for a single account
export const getPaymentHistory = async (userId, accountId, limit = 20, offset = 0) => {
  const account = await getUserAccountOrThrow(accountId, userId);

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({
      where: {
        accountId: account.id,
        type: 'debit',
      },
    }),
    prisma.transaction.findMany({
      where: {
        accountId: account.id,
        type: 'debit',
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    payments: transactions,
    total,
    offset,
    limit,
    hasMore: offset + transactions.length < total,
  };
};

// Get all payments for user (all accounts)
export const getUserPayments = async (userId, limit = 20, offset = 0) => {
  const [total, transactions] = await Promise.all([
    prisma.transaction.count({
      where: {
        type: 'debit',
        account: { userId },
      },
    }),
    prisma.transaction.findMany({
      where: {
        type: 'debit',
        account: { userId },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { account: true },
    }),
  ]);

  return {
    payments: transactions,
    total,
    offset,
    limit,
    hasMore: offset + transactions.length < total,
  };
};

// Basic payment stats for a user
export const getPaymentStats = async (userId) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      type: 'debit',
      account: { userId },
      createdAt: { gte: since },
    },
  });

  let totalSpent = 0;
  const byCategory = {};

  for (const tx of transactions) {
    const amountNum = Number(tx.amount);
    totalSpent += amountNum;
    const key = tx.category || 'uncategorized';
    byCategory[key] = (byCategory[key] || 0) + amountNum;
  }

  return {
    periodDays: 30,
    totalSpent,
    byCategory,
    count: transactions.length,
  };
};
