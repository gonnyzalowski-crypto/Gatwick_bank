import prisma from '../config/prisma.js';

// Helper to build a standard invoice object from transactions
const buildInvoiceFromTransactions = (user, transactions, options = {}) => {
  const issuedAt = options.issuedAt || new Date();
  const currency = options.currency || 'USD';

  let total = 0;
  const items = transactions.map((tx) => {
    const amountNumber = Number(tx.amount);
    total += amountNumber;
    return {
      id: tx.id,
      description: tx.description || 'Payment',
      amount: amountNumber,
      category: tx.category || null,
      createdAt: tx.createdAt,
    };
  });

  return {
    id: options.id || `INV-${transactions[0].id.slice(0, 8).toUpperCase()}`,
    userId: user.id,
    customer: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    currency,
    issuedAt,
    items,
    total,
  };
};

// Generate invoice from a single payment (transaction)
export const generatePaymentInvoice = async (userId, paymentId) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: paymentId,
      account: { userId },
    },
    include: {
      account: true,
    },
  });

  if (!transaction) {
    throw new Error('Payment not found or unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const invoice = buildInvoiceFromTransactions(user, [transaction], {
    currency: transaction.account?.currency || 'USD',
    issuedAt: transaction.createdAt,
  });

  return invoice;
};

// Generate invoice from multiple payments (transactions)
export const generateBatchInvoice = async (userId, paymentIds) => {
  if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
    throw new Error('paymentIds array is required');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      id: { in: paymentIds },
      account: { userId },
    },
    include: {
      account: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (transactions.length === 0) {
    throw new Error('No payments found for invoice');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const firstTx = transactions[0];
  const invoice = buildInvoiceFromTransactions(user, transactions, {
    id: `INV-BATCH-${firstTx.id.slice(0, 6).toUpperCase()}`,
    currency: firstTx.account?.currency || 'USD',
    issuedAt: firstTx.createdAt,
  });

  return invoice;
};

// Generate simple HTML representation of an invoice
export const generateInvoiceHTML = (invoice) => {
  const { customer, items, total, currency, id, issuedAt } = invoice;

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align:right;">${item.amount.toFixed(2)} ${currency}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; }
        tfoot td { font-weight: bold; }
        .meta { margin-top: 8px; color: #555; }
      </style>
    </head>
    <body>
      <h1>Invoice ${id}</h1>
      <div class="meta">
        <div>Date: ${new Date(issuedAt).toLocaleString()}</div>
        <div>Customer: ${customer.firstName} ${customer.lastName} (${customer.email})</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td style="text-align:right;">${total.toFixed(2)} ${currency}</td>
          </tr>
        </tfoot>
      </table>
    </body>
  </html>`;
};
