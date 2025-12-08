import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import prisma from '../config/prisma.js';

const router = express.Router();

// Helper functions
function generateRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function randomAmount(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Verify admin middleware
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
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * POST /api/v1/admin/generate-transactions/:userId
 * Generate 3 years of realistic transaction history for a user
 */
router.post('/generate-transactions/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetBalance = 1725916 } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.accounts.find(a => a.isPrimary) || user.accounts[0];
    if (!account) {
      return res.status(400).json({ error: 'User has no accounts' });
    }

    // Delete existing transactions for clean slate
    await prisma.transaction.deleteMany({ where: { accountId: account.id } });
    await prisma.loan.deleteMany({ where: { userId: user.id } });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    const transactions = [];

    // 1. CONOCOPHILLIPS SALARY (3x yearly, -)
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const salaryMonths = [2, 6, 10];
      for (const month of salaryMonths) {
        const payDate = new Date(year, month, randomAmount(10, 25));
        if (payDate >= startDate && payDate <= endDate) {
          transactions.push({
            accountId: account.id, amount: randomAmount(900000, 2000000), type: 'CREDIT',
            description: `ConocoPhillips - Contractor Payment Q${Math.floor((month + 1) / 3)}`,
            category: 'SALARY', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas',
            status: 'COMPLETED', reference: generateRef('COP'), createdAt: payDate
          });
        }
      }
    }

    // 2. BITENDERS LLC INVESTMENT (quarterly )
    let investDate = new Date(startDate);
    while (investDate <= endDate) {
      transactions.push({
        accountId: account.id, amount: 150000, type: 'CREDIT',
        description: 'Bitenders LLC - Quarterly Investment Return',
        category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment Company',
        status: 'COMPLETED', reference: generateRef('BIT'), createdAt: new Date(investDate)
      });
      investDate.setMonth(investDate.getMonth() + 3);
    }

    // 3. DAUGHTER UPKEEP (monthly - + tuition)
    let upkeepDate = new Date(startDate);
    while (upkeepDate <= endDate) {
      transactions.push({
        accountId: account.id, amount: randomAmount(3000, 5000), type: 'DEBIT',
        description: 'International Wire Transfer - Daughter Upkeep (Canada)',
        category: 'FAMILY', merchantName: 'TD Bank Canada', merchantCategory: 'Wire Transfer',
        status: 'COMPLETED', reference: generateRef('WIRE'), createdAt: new Date(upkeepDate)
      });
      if (upkeepDate.getMonth() === 0 || upkeepDate.getMonth() === 8) {
        transactions.push({
          accountId: account.id, amount: randomAmount(15000, 25000), type: 'DEBIT',
          description: `University of Toronto - Tuition Payment ${upkeepDate.getMonth() === 0 ? 'Spring' : 'Fall'} Semester`,
          category: 'EDUCATION', merchantName: 'University of Toronto', merchantCategory: 'Education',
          status: 'COMPLETED', reference: generateRef('EDU'), createdAt: addDays(upkeepDate, 5)
        });
      }
      upkeepDate.setMonth(upkeepDate.getMonth() + 1);
    }

    // 4. SUBCONTRACTOR PAYMENTS (17 people, 3x yearly, -)
    const subcontractors = ['James Mitchell', 'Robert Chen', 'Michael Torres', 'David Okonkwo',
      'William Patel', 'Richard Nguyen', 'Joseph Kim', 'Thomas Anderson', 'Christopher Lee',
      'Daniel Martinez', 'Matthew Brown', 'Anthony Davis', 'Mark Wilson', 'Steven Taylor',
      'Paul Jackson', 'Andrew White', 'Joshua Harris'];
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const contractMonths = [[1, 2], [5, 6], [9, 10]];
      for (const [, endMonth] of contractMonths) {
        const payDate = new Date(year, endMonth, randomAmount(25, 28));
        if (payDate >= startDate && payDate <= endDate) {
          for (const contractor of subcontractors) {
            transactions.push({
              accountId: account.id, amount: randomAmount(11000, 19000), type: 'DEBIT',
              description: `Subcontractor Payment - ${contractor}`,
              category: 'BUSINESS', merchantName: contractor, merchantCategory: 'Contractor Services',
              status: 'COMPLETED', reference: generateRef('SUB'), createdAt: addDays(payDate, Math.random() * 3)
            });
          }
        }
      }
    }

    // 5. MONTHLY SUBSCRIPTIONS
    let subDate = new Date(startDate);
    while (subDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 15.99, type: 'DEBIT', description: 'Netflix Premium Subscription', category: 'ENTERTAINMENT', merchantName: 'Netflix Inc', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('NFLX'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 1) });
      transactions.push({ accountId: account.id, amount: 189.99, type: 'DEBIT', description: 'AT&T Wireless & Internet Bundle', category: 'UTILITIES', merchantName: 'AT&T', merchantCategory: 'Telecommunications', status: 'COMPLETED', reference: generateRef('ATT'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 5) });
      transactions.push({ accountId: account.id, amount: 9.99, type: 'DEBIT', description: 'Apple TV+ Monthly Subscription', category: 'ENTERTAINMENT', merchantName: 'Apple Inc', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('APTV'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 8) });
      transactions.push({ accountId: account.id, amount: 10.99, type: 'DEBIT', description: 'Spotify Premium Family', category: 'ENTERTAINMENT', merchantName: 'Spotify AB', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('SPOT'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 12) });
      subDate.setMonth(subDate.getMonth() + 1);
    }

    // 6. TAXES
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const fedTaxDate = new Date(year, 3, 15);
      if (fedTaxDate >= startDate && fedTaxDate <= endDate) {
        transactions.push({ accountId: account.id, amount: randomAmount(180000, 350000), type: 'DEBIT', description: `IRS Federal Income Tax Payment - Tax Year ${year - 1}`, category: 'TAXES', merchantName: 'Internal Revenue Service', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('IRS'), createdAt: fedTaxDate });
        transactions.push({ accountId: account.id, amount: randomAmount(25000, 55000), type: 'DEBIT', description: `Missouri Dept of Revenue - State Income Tax ${year - 1}`, category: 'TAXES', merchantName: 'Missouri Dept of Revenue', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('MOTR'), createdAt: addDays(fedTaxDate, 1) });
      }
      for (const month of [5, 11]) {
        const propTaxDate = new Date(year, month, 15);
        if (propTaxDate >= startDate && propTaxDate <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(4500, 6500), type: 'DEBIT', description: `Cole County - Property Tax ${month === 5 ? 'First Half' : 'Second Half'}`, category: 'TAXES', merchantName: 'Cole County Collector', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('PROP'), createdAt: propTaxDate });
        }
      }
      for (const month of [0, 3, 6, 9]) {
        const estTaxDate = new Date(year, month, 15);
        if (estTaxDate >= startDate && estTaxDate <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(45000, 85000), type: 'DEBIT', description: `IRS Quarterly Estimated Tax Payment Q${Math.floor(month / 3) + 1}`, category: 'TAXES', merchantName: 'Internal Revenue Service', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('ESTX'), createdAt: estTaxDate });
        }
      }
    }

    // 7. AMAZON & EBAY
    let shopDate = new Date(startDate);
    while (shopDate <= endDate) {
      const amazonCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < amazonCount; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(25, 450), type: 'DEBIT', description: 'Amazon.com Purchase', category: 'SHOPPING', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: generateRef('AMZN'), createdAt: randomDate(shopDate, addDays(shopDate, 28)) });
      }
      const ebayCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < ebayCount; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(15, 300), type: 'DEBIT', description: 'eBay Purchase', category: 'SHOPPING', merchantName: 'eBay Inc', merchantCategory: 'Online Marketplace', status: 'COMPLETED', reference: generateRef('EBAY'), createdAt: randomDate(shopDate, addDays(shopDate, 28)) });
      }
      shopDate.setMonth(shopDate.getMonth() + 1);
    }

    // 8. CAR EXPENSES
    let carDate = new Date(startDate);
    while (carDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        transactions.push({ accountId: account.id, amount: randomAmount(55, 95), type: 'DEBIT', description: 'Shell Gas Station - Fuel', category: 'TRANSPORTATION', merchantName: 'Shell Oil', merchantCategory: 'Gas Station', status: 'COMPLETED', reference: generateRef('FUEL'), createdAt: addDays(carDate, week * 7 + Math.random() * 3) });
      }
      if (carDate.getMonth() % 3 === 0) {
        transactions.push({ accountId: account.id, amount: randomAmount(150, 800), type: 'DEBIT', description: 'Firestone Complete Auto Care - Service', category: 'TRANSPORTATION', merchantName: 'Firestone', merchantCategory: 'Auto Service', status: 'COMPLETED', reference: generateRef('AUTO'), createdAt: addDays(carDate, 10) });
      }
      transactions.push({ accountId: account.id, amount: 285.00, type: 'DEBIT', description: 'State Farm Insurance - Auto Premium', category: 'INSURANCE', merchantName: 'State Farm', merchantCategory: 'Insurance', status: 'COMPLETED', reference: generateRef('INSUR'), createdAt: new Date(carDate.getFullYear(), carDate.getMonth(), 20) });
      carDate.setMonth(carDate.getMonth() + 1);
    }

    // 9. HOUSE MAINTENANCE & UTILITIES
    let houseDate = new Date(startDate);
    while (houseDate <= endDate) {
      transactions.push({ accountId: account.id, amount: randomAmount(180, 350), type: 'DEBIT', description: 'Ameren Missouri - Electric Bill', category: 'UTILITIES', merchantName: 'Ameren Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('ELEC'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 18) });
      transactions.push({ accountId: account.id, amount: randomAmount(45, 120), type: 'DEBIT', description: 'Spire Missouri - Natural Gas', category: 'UTILITIES', merchantName: 'Spire Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('GAS'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 22) });
      transactions.push({ accountId: account.id, amount: 85.00, type: 'DEBIT', description: 'Jefferson City Water - Water & Sewer', category: 'UTILITIES', merchantName: 'Jefferson City Utilities', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('WATR'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 25) });
      if (Math.random() > 0.6) {
        const stores = ['Home Depot', 'Lowes', 'Ace Hardware'];
        transactions.push({ accountId: account.id, amount: randomAmount(50, 500), type: 'DEBIT', description: `${stores[Math.floor(Math.random() * stores.length)]} - Home Improvement`, category: 'HOME', merchantName: stores[Math.floor(Math.random() * stores.length)], merchantCategory: 'Home Improvement', status: 'COMPLETED', reference: generateRef('HOME'), createdAt: randomDate(houseDate, addDays(houseDate, 28)) });
      }
      if (houseDate.getMonth() >= 3 && houseDate.getMonth() <= 9) {
        transactions.push({ accountId: account.id, amount: 175.00, type: 'DEBIT', description: 'TruGreen Lawn Care - Monthly Service', category: 'HOME', merchantName: 'TruGreen', merchantCategory: 'Lawn Care', status: 'COMPLETED', reference: generateRef('LAWN'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 10) });
      }
      houseDate.setMonth(houseDate.getMonth() + 1);
    }

    // 10. GIFTS
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const xmasDate = new Date(year, 11, randomAmount(10, 20));
      if (xmasDate >= startDate && xmasDate <= endDate) {
        transactions.push({ accountId: account.id, amount: randomAmount(500, 2500), type: 'DEBIT', description: 'Nordstrom - Holiday Gifts', category: 'GIFTS', merchantName: 'Nordstrom', merchantCategory: 'Department Store', status: 'COMPLETED', reference: generateRef('GIFT'), createdAt: xmasDate });
      }
      for (let i = 0; i < 4; i++) {
        const bday = randomDate(new Date(year, 0, 1), new Date(year, 11, 31));
        if (bday >= startDate && bday <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(50, 300), type: 'DEBIT', description: 'Best Buy - Gift Purchase', category: 'GIFTS', merchantName: 'Best Buy', merchantCategory: 'Electronics', status: 'COMPLETED', reference: generateRef('GIFT'), createdAt: bday });
        }
      }
    }

    // 11. AVASFLOWERS - Nov 17, 2025
    transactions.push({ accountId: account.id, amount: 209.96, type: 'DEBIT', description: 'Avasflowers.net - Flower Arrangement Delivery', category: 'GIFTS', merchantName: 'Avasflowers.net', merchantCategory: 'Florist', status: 'COMPLETED', reference: generateRef('FLWR'), createdAt: new Date(2025, 10, 17) });

    // 12. DINING & GROCERIES
    let dineDate = new Date(startDate);
    while (dineDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        const groceryStores = ['Walmart', 'Hy-Vee', 'Schnucks', 'Costco'];
        transactions.push({ accountId: account.id, amount: randomAmount(120, 350), type: 'DEBIT', description: `${groceryStores[Math.floor(Math.random() * groceryStores.length)]} - Groceries`, category: 'GROCERIES', merchantName: groceryStores[Math.floor(Math.random() * groceryStores.length)], merchantCategory: 'Grocery Store', status: 'COMPLETED', reference: generateRef('GROC'), createdAt: addDays(dineDate, week * 7 + Math.random() * 2) });
      }
      const diningCount = Math.floor(Math.random() * 3) + 2;
      const restaurants = ['Olive Garden', 'Texas Roadhouse', 'Applebees', 'Outback Steakhouse', 'Red Lobster', 'The Capital Grille'];
      for (let i = 0; i < diningCount; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(45, 250), type: 'DEBIT', description: `${restaurants[Math.floor(Math.random() * restaurants.length)]} - Dining`, category: 'DINING', merchantName: restaurants[Math.floor(Math.random() * restaurants.length)], merchantCategory: 'Restaurant', status: 'COMPLETED', reference: generateRef('DINE'), createdAt: randomDate(dineDate, addDays(dineDate, 28)) });
      }
      dineDate.setMonth(dineDate.getMonth() + 1);
    }

    // 13. HEALTHCARE
    let healthDate = new Date(startDate);
    while (healthDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 650.00, type: 'DEBIT', description: 'Blue Cross Blue Shield - Health Insurance Premium', category: 'HEALTHCARE', merchantName: 'BCBS Missouri', merchantCategory: 'Insurance', status: 'COMPLETED', reference: generateRef('HLTH'), createdAt: new Date(healthDate.getFullYear(), healthDate.getMonth(), 1) });
      if (Math.random() > 0.7) {
        transactions.push({ accountId: account.id, amount: randomAmount(25, 150), type: 'DEBIT', description: 'Capital Region Medical Center - Copay', category: 'HEALTHCARE', merchantName: 'Capital Region Medical', merchantCategory: 'Healthcare', status: 'COMPLETED', reference: generateRef('MED'), createdAt: randomDate(healthDate, addDays(healthDate, 28)) });
      }
      transactions.push({ accountId: account.id, amount: randomAmount(15, 85), type: 'DEBIT', description: 'CVS Pharmacy - Prescription', category: 'HEALTHCARE', merchantName: 'CVS Pharmacy', merchantCategory: 'Pharmacy', status: 'COMPLETED', reference: generateRef('RX'), createdAt: new Date(healthDate.getFullYear(), healthDate.getMonth(), 15) });
      healthDate.setMonth(healthDate.getMonth() + 1);
    }

    // 14. BANK FEES
    let feeDate = new Date(startDate);
    while (feeDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 45.00, type: 'DEBIT', description: 'International Wire Transfer Fee', category: 'FEES', merchantName: 'Gatwick Bank', merchantCategory: 'Bank Fee', status: 'COMPLETED', reference: generateRef('FEE'), createdAt: addDays(new Date(feeDate.getFullYear(), feeDate.getMonth(), 1), 1) });
      feeDate.setMonth(feeDate.getMonth() + 1);
    }

    // 15. REFUNDS
    for (let i = 0; i < 20; i++) {
      transactions.push({ accountId: account.id, amount: randomAmount(25, 500), type: 'CREDIT', description: 'Amazon.com - Refund', category: 'REFUND', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: generateRef('RFND'), createdAt: randomDate(startDate, endDate) });
    }

    // Sort and calculate balance
    transactions.sort((a, b) => a.createdAt - b.createdAt);
    let runningBalance = 0;
    for (const tx of transactions) {
      runningBalance += tx.type === 'CREDIT' ? parseFloat(tx.amount) : -parseFloat(tx.amount);
    }

    // Add adjustment to reach target balance
    const adjustment = targetBalance - runningBalance;
    if (adjustment > 0) {
      transactions.push({ accountId: account.id, amount: Math.abs(adjustment), type: 'CREDIT', description: 'ConocoPhillips - Performance Bonus', category: 'BONUS', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas', status: 'COMPLETED', reference: generateRef('BONUS'), createdAt: new Date(2025, 11, 1) });
    } else if (adjustment < 0) {
      transactions.push({ accountId: account.id, amount: Math.abs(adjustment), type: 'DEBIT', description: 'Investment - Bitenders LLC Additional Stake', category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment', status: 'COMPLETED', reference: generateRef('INVEST'), createdAt: new Date(2025, 11, 1) });
    }

    // Insert transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await prisma.transaction.createMany({ data: batch });
    }

    // Update account balance
    await prisma.account.update({ where: { id: account.id }, data: { balance: targetBalance, availableBalance: targetBalance, pendingBalance: 0 } });

    // Create loans (3 this year, 2 defaulted, 1 paid)
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 75000, interestRate: 8.5, termMonths: 24, monthlyPayment: 3412.50, remainingBalance: 68500, totalPaid: 6500, status: 'DEFAULTED', purpose: 'Home renovation project', createdAt: new Date(2025, 0, 15), approvedAt: new Date(2025, 0, 16), disbursedAt: new Date(2025, 0, 17) }
    });
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'BUSINESS', amount: 150000, interestRate: 7.25, termMonths: 36, monthlyPayment: 4625.00, remainingBalance: 141000, totalPaid: 9000, status: 'DEFAULTED', purpose: 'Equipment purchase for subcontractors', createdAt: new Date(2025, 3, 10), approvedAt: new Date(2025, 3, 12), disbursedAt: new Date(2025, 3, 13) }
    });
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 50000, interestRate: 9.0, termMonths: 12, monthlyPayment: 4378.00, remainingBalance: 0, totalPaid: 52536, status: 'PAID', purpose: 'Daughter education expenses', createdAt: new Date(2025, 7, 1), approvedAt: new Date(2025, 7, 2), disbursedAt: new Date(2025, 7, 3) }
    });

    return res.json({
      success: true,
      message: 'Transaction history generated successfully',
      stats: {
        transactionsCreated: transactions.length,
        loansCreated: 3,
        finalBalance: targetBalance,
        dateRange: { start: startDate, end: endDate }
      }
    });

  } catch (error) {
    console.error('Generate transactions error:', error);
    return res.status(500).json({ error: 'Failed to generate transactions', details: error.message });
  }
});

/**
 * POST /api/v1/admin/generate/seed-brokard
 * Generate transactions for Brokard Williams using secret key (no admin required)
 */
router.post('/seed-brokard', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Simple secret key check
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const targetBalance = 1725916;
    
    // Find Brokard Williams
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'Brokardw@gmail.com', mode: 'insensitive' } },
      include: { accounts: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User Brokardw@gmail.com not found' });
    }

    const account = user.accounts.find(a => a.isPrimary) || user.accounts[0];
    if (!account) {
      return res.status(400).json({ error: 'User has no accounts' });
    }

    // Delete existing transactions for clean slate
    await prisma.transaction.deleteMany({ where: { accountId: account.id } });
    await prisma.loan.deleteMany({ where: { userId: user.id } });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    const transactions = [];

    // 1. CONOCOPHILLIPS SALARY (3x yearly)
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const salaryMonths = [2, 6, 10];
      for (const month of salaryMonths) {
        const payDate = new Date(year, month, Math.floor(randomAmount(10, 25)));
        if (payDate >= startDate && payDate <= endDate) {
          transactions.push({
            accountId: account.id, amount: randomAmount(900000, 2000000), type: 'CREDIT',
            description: `ConocoPhillips - Contractor Payment Q${Math.floor((month + 1) / 3)}`,
            category: 'SALARY', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas',
            status: 'COMPLETED', reference: generateRef('COP'), createdAt: payDate
          });
        }
      }
    }

    // 2. BITENDERS LLC INVESTMENT (quarterly)
    let investDate = new Date(startDate);
    while (investDate <= endDate) {
      transactions.push({
        accountId: account.id, amount: 150000, type: 'CREDIT',
        description: 'Bitenders LLC - Quarterly Investment Return',
        category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment Company',
        status: 'COMPLETED', reference: generateRef('BIT'), createdAt: new Date(investDate)
      });
      investDate.setMonth(investDate.getMonth() + 3);
    }

    // 3. DAUGHTER UPKEEP (monthly + tuition)
    let upkeepDate = new Date(startDate);
    while (upkeepDate <= endDate) {
      transactions.push({
        accountId: account.id, amount: randomAmount(3000, 5000), type: 'DEBIT',
        description: 'International Wire Transfer - Daughter Upkeep (Canada)',
        category: 'FAMILY', merchantName: 'TD Bank Canada', merchantCategory: 'Wire Transfer',
        status: 'COMPLETED', reference: generateRef('WIRE'), createdAt: new Date(upkeepDate)
      });
      if (upkeepDate.getMonth() === 0 || upkeepDate.getMonth() === 8) {
        transactions.push({
          accountId: account.id, amount: randomAmount(15000, 25000), type: 'DEBIT',
          description: `University of Toronto - Tuition Payment ${upkeepDate.getMonth() === 0 ? 'Spring' : 'Fall'} Semester`,
          category: 'EDUCATION', merchantName: 'University of Toronto', merchantCategory: 'Education',
          status: 'COMPLETED', reference: generateRef('EDU'), createdAt: addDays(upkeepDate, 5)
        });
      }
      upkeepDate.setMonth(upkeepDate.getMonth() + 1);
    }

    // 4. SUBCONTRACTOR PAYMENTS (17 people, 3x yearly)
    const subcontractors = ['James Mitchell', 'Robert Chen', 'Michael Torres', 'David Okonkwo',
      'William Patel', 'Richard Nguyen', 'Joseph Kim', 'Thomas Anderson', 'Christopher Lee',
      'Daniel Martinez', 'Matthew Brown', 'Anthony Davis', 'Mark Wilson', 'Steven Taylor',
      'Paul Jackson', 'Andrew White', 'Joshua Harris'];
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const contractMonths = [[1, 2], [5, 6], [9, 10]];
      for (const [, endMonth] of contractMonths) {
        const payDate = new Date(year, endMonth, Math.floor(randomAmount(25, 28)));
        if (payDate >= startDate && payDate <= endDate) {
          for (const contractor of subcontractors) {
            transactions.push({
              accountId: account.id, amount: randomAmount(11000, 19000), type: 'DEBIT',
              description: `Subcontractor Payment - ${contractor}`,
              category: 'BUSINESS', merchantName: contractor, merchantCategory: 'Contractor Services',
              status: 'COMPLETED', reference: generateRef('SUB'), createdAt: addDays(payDate, Math.random() * 3)
            });
          }
        }
      }
    }

    // 5. MONTHLY SUBSCRIPTIONS
    let subDate = new Date(startDate);
    while (subDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 15.99, type: 'DEBIT', description: 'Netflix Premium Subscription', category: 'ENTERTAINMENT', merchantName: 'Netflix Inc', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('NFLX'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 1) });
      transactions.push({ accountId: account.id, amount: 189.99, type: 'DEBIT', description: 'AT&T Wireless & Internet Bundle', category: 'UTILITIES', merchantName: 'AT&T', merchantCategory: 'Telecommunications', status: 'COMPLETED', reference: generateRef('ATT'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 5) });
      transactions.push({ accountId: account.id, amount: 9.99, type: 'DEBIT', description: 'Apple TV+ Monthly Subscription', category: 'ENTERTAINMENT', merchantName: 'Apple Inc', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('APTV'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 8) });
      transactions.push({ accountId: account.id, amount: 10.99, type: 'DEBIT', description: 'Spotify Premium Family', category: 'ENTERTAINMENT', merchantName: 'Spotify AB', merchantCategory: 'Streaming Services', status: 'COMPLETED', reference: generateRef('SPOT'), createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 12) });
      subDate.setMonth(subDate.getMonth() + 1);
    }

    // 6. TAXES
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const fedTaxDate = new Date(year, 3, 15);
      if (fedTaxDate >= startDate && fedTaxDate <= endDate) {
        transactions.push({ accountId: account.id, amount: randomAmount(180000, 350000), type: 'DEBIT', description: `IRS Federal Income Tax Payment - Tax Year ${year - 1}`, category: 'TAXES', merchantName: 'Internal Revenue Service', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('IRS'), createdAt: fedTaxDate });
        transactions.push({ accountId: account.id, amount: randomAmount(25000, 55000), type: 'DEBIT', description: `Missouri Dept of Revenue - State Income Tax ${year - 1}`, category: 'TAXES', merchantName: 'Missouri Dept of Revenue', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('MOTR'), createdAt: addDays(fedTaxDate, 1) });
      }
      for (const month of [5, 11]) {
        const propTaxDate = new Date(year, month, 15);
        if (propTaxDate >= startDate && propTaxDate <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(4500, 6500), type: 'DEBIT', description: `Cole County - Property Tax ${month === 5 ? 'First Half' : 'Second Half'}`, category: 'TAXES', merchantName: 'Cole County Collector', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('PROP'), createdAt: propTaxDate });
        }
      }
      for (const month of [0, 3, 6, 9]) {
        const estTaxDate = new Date(year, month, 15);
        if (estTaxDate >= startDate && estTaxDate <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(45000, 85000), type: 'DEBIT', description: `IRS Quarterly Estimated Tax Payment Q${Math.floor(month / 3) + 1}`, category: 'TAXES', merchantName: 'Internal Revenue Service', merchantCategory: 'Government', status: 'COMPLETED', reference: generateRef('ESTX'), createdAt: estTaxDate });
        }
      }
    }

    // 7. SHOPPING (Amazon & eBay)
    let shopDate = new Date(startDate);
    while (shopDate <= endDate) {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(25, 450), type: 'DEBIT', description: 'Amazon.com Purchase', category: 'SHOPPING', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: generateRef('AMZN'), createdAt: randomDate(shopDate, addDays(shopDate, 28)) });
      }
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(15, 300), type: 'DEBIT', description: 'eBay Purchase', category: 'SHOPPING', merchantName: 'eBay Inc', merchantCategory: 'Online Marketplace', status: 'COMPLETED', reference: generateRef('EBAY'), createdAt: randomDate(shopDate, addDays(shopDate, 28)) });
      }
      shopDate.setMonth(shopDate.getMonth() + 1);
    }

    // 8. CAR EXPENSES
    let carDate = new Date(startDate);
    while (carDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        transactions.push({ accountId: account.id, amount: randomAmount(55, 95), type: 'DEBIT', description: 'Shell Gas Station - Fuel', category: 'TRANSPORTATION', merchantName: 'Shell Oil', merchantCategory: 'Gas Station', status: 'COMPLETED', reference: generateRef('FUEL'), createdAt: addDays(carDate, week * 7 + Math.random() * 3) });
      }
      if (carDate.getMonth() % 3 === 0) {
        transactions.push({ accountId: account.id, amount: randomAmount(150, 800), type: 'DEBIT', description: 'Firestone Complete Auto Care - Service', category: 'TRANSPORTATION', merchantName: 'Firestone', merchantCategory: 'Auto Service', status: 'COMPLETED', reference: generateRef('AUTO'), createdAt: addDays(carDate, 10) });
      }
      transactions.push({ accountId: account.id, amount: 285.00, type: 'DEBIT', description: 'State Farm Insurance - Auto Premium', category: 'INSURANCE', merchantName: 'State Farm', merchantCategory: 'Insurance', status: 'COMPLETED', reference: generateRef('INSUR'), createdAt: new Date(carDate.getFullYear(), carDate.getMonth(), 20) });
      carDate.setMonth(carDate.getMonth() + 1);
    }

    // 9. HOUSE MAINTENANCE & UTILITIES
    let houseDate = new Date(startDate);
    while (houseDate <= endDate) {
      transactions.push({ accountId: account.id, amount: randomAmount(180, 350), type: 'DEBIT', description: 'Ameren Missouri - Electric Bill', category: 'UTILITIES', merchantName: 'Ameren Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('ELEC'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 18) });
      transactions.push({ accountId: account.id, amount: randomAmount(45, 120), type: 'DEBIT', description: 'Spire Missouri - Natural Gas', category: 'UTILITIES', merchantName: 'Spire Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('GAS'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 22) });
      transactions.push({ accountId: account.id, amount: 85.00, type: 'DEBIT', description: 'Jefferson City Water - Water & Sewer', category: 'UTILITIES', merchantName: 'Jefferson City Utilities', merchantCategory: 'Utilities', status: 'COMPLETED', reference: generateRef('WATR'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 25) });
      if (Math.random() > 0.6) {
        const stores = ['Home Depot', 'Lowes', 'Ace Hardware'];
        transactions.push({ accountId: account.id, amount: randomAmount(50, 500), type: 'DEBIT', description: `${stores[Math.floor(Math.random() * stores.length)]} - Home Improvement`, category: 'HOME', merchantName: stores[Math.floor(Math.random() * stores.length)], merchantCategory: 'Home Improvement', status: 'COMPLETED', reference: generateRef('HOME'), createdAt: randomDate(houseDate, addDays(houseDate, 28)) });
      }
      if (houseDate.getMonth() >= 3 && houseDate.getMonth() <= 9) {
        transactions.push({ accountId: account.id, amount: 175.00, type: 'DEBIT', description: 'TruGreen Lawn Care - Monthly Service', category: 'HOME', merchantName: 'TruGreen', merchantCategory: 'Lawn Care', status: 'COMPLETED', reference: generateRef('LAWN'), createdAt: new Date(houseDate.getFullYear(), houseDate.getMonth(), 10) });
      }
      houseDate.setMonth(houseDate.getMonth() + 1);
    }

    // 10. GIFTS
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const xmasDate = new Date(year, 11, Math.floor(randomAmount(10, 20)));
      if (xmasDate >= startDate && xmasDate <= endDate) {
        transactions.push({ accountId: account.id, amount: randomAmount(500, 2500), type: 'DEBIT', description: 'Nordstrom - Holiday Gifts', category: 'GIFTS', merchantName: 'Nordstrom', merchantCategory: 'Department Store', status: 'COMPLETED', reference: generateRef('GIFT'), createdAt: xmasDate });
      }
      for (let i = 0; i < 4; i++) {
        const bday = randomDate(new Date(year, 0, 1), new Date(year, 11, 31));
        if (bday >= startDate && bday <= endDate) {
          transactions.push({ accountId: account.id, amount: randomAmount(50, 300), type: 'DEBIT', description: 'Best Buy - Gift Purchase', category: 'GIFTS', merchantName: 'Best Buy', merchantCategory: 'Electronics', status: 'COMPLETED', reference: generateRef('GIFT'), createdAt: bday });
        }
      }
    }

    // 11. AVASFLOWERS - Nov 17, 2025
    transactions.push({ accountId: account.id, amount: 209.96, type: 'DEBIT', description: 'Avasflowers.net - Flower Arrangement Delivery', category: 'GIFTS', merchantName: 'Avasflowers.net', merchantCategory: 'Florist', status: 'COMPLETED', reference: generateRef('FLWR'), createdAt: new Date(2025, 10, 17) });

    // 12. DINING & GROCERIES
    let dineDate = new Date(startDate);
    while (dineDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        const groceryStores = ['Walmart', 'Hy-Vee', 'Schnucks', 'Costco'];
        transactions.push({ accountId: account.id, amount: randomAmount(120, 350), type: 'DEBIT', description: `${groceryStores[Math.floor(Math.random() * groceryStores.length)]} - Groceries`, category: 'GROCERIES', merchantName: groceryStores[Math.floor(Math.random() * groceryStores.length)], merchantCategory: 'Grocery Store', status: 'COMPLETED', reference: generateRef('GROC'), createdAt: addDays(dineDate, week * 7 + Math.random() * 2) });
      }
      const restaurants = ['Olive Garden', 'Texas Roadhouse', 'Applebees', 'Outback Steakhouse', 'Red Lobster', 'The Capital Grille'];
      for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        transactions.push({ accountId: account.id, amount: randomAmount(45, 250), type: 'DEBIT', description: `${restaurants[Math.floor(Math.random() * restaurants.length)]} - Dining`, category: 'DINING', merchantName: restaurants[Math.floor(Math.random() * restaurants.length)], merchantCategory: 'Restaurant', status: 'COMPLETED', reference: generateRef('DINE'), createdAt: randomDate(dineDate, addDays(dineDate, 28)) });
      }
      dineDate.setMonth(dineDate.getMonth() + 1);
    }

    // 13. HEALTHCARE
    let healthDate = new Date(startDate);
    while (healthDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 650.00, type: 'DEBIT', description: 'Blue Cross Blue Shield - Health Insurance Premium', category: 'HEALTHCARE', merchantName: 'BCBS Missouri', merchantCategory: 'Insurance', status: 'COMPLETED', reference: generateRef('HLTH'), createdAt: new Date(healthDate.getFullYear(), healthDate.getMonth(), 1) });
      if (Math.random() > 0.7) {
        transactions.push({ accountId: account.id, amount: randomAmount(25, 150), type: 'DEBIT', description: 'Capital Region Medical Center - Copay', category: 'HEALTHCARE', merchantName: 'Capital Region Medical', merchantCategory: 'Healthcare', status: 'COMPLETED', reference: generateRef('MED'), createdAt: randomDate(healthDate, addDays(healthDate, 28)) });
      }
      transactions.push({ accountId: account.id, amount: randomAmount(15, 85), type: 'DEBIT', description: 'CVS Pharmacy - Prescription', category: 'HEALTHCARE', merchantName: 'CVS Pharmacy', merchantCategory: 'Pharmacy', status: 'COMPLETED', reference: generateRef('RX'), createdAt: new Date(healthDate.getFullYear(), healthDate.getMonth(), 15) });
      healthDate.setMonth(healthDate.getMonth() + 1);
    }

    // 14. BANK FEES
    let feeDate = new Date(startDate);
    while (feeDate <= endDate) {
      transactions.push({ accountId: account.id, amount: 45.00, type: 'DEBIT', description: 'International Wire Transfer Fee', category: 'FEES', merchantName: 'Gatwick Bank', merchantCategory: 'Bank Fee', status: 'COMPLETED', reference: generateRef('FEE'), createdAt: addDays(new Date(feeDate.getFullYear(), feeDate.getMonth(), 1), 1) });
      feeDate.setMonth(feeDate.getMonth() + 1);
    }

    // 15. REFUNDS
    for (let i = 0; i < 20; i++) {
      transactions.push({ accountId: account.id, amount: randomAmount(25, 500), type: 'CREDIT', description: 'Amazon.com - Refund', category: 'REFUND', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: generateRef('RFND'), createdAt: randomDate(startDate, endDate) });
    }

    // Sort and calculate balance
    transactions.sort((a, b) => a.createdAt - b.createdAt);
    let runningBalance = 0;
    for (const tx of transactions) {
      runningBalance += tx.type === 'CREDIT' ? parseFloat(tx.amount) : -parseFloat(tx.amount);
    }

    // Add adjustment to reach target balance
    const adjustment = targetBalance - runningBalance;
    if (adjustment > 0) {
      transactions.push({ accountId: account.id, amount: Math.abs(adjustment), type: 'CREDIT', description: 'ConocoPhillips - Performance Bonus', category: 'BONUS', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas', status: 'COMPLETED', reference: generateRef('BONUS'), createdAt: new Date(2025, 11, 1) });
    } else if (adjustment < 0) {
      transactions.push({ accountId: account.id, amount: Math.abs(adjustment), type: 'DEBIT', description: 'Investment - Bitenders LLC Additional Stake', category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment', status: 'COMPLETED', reference: generateRef('INVEST'), createdAt: new Date(2025, 11, 1) });
    }

    // Insert transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await prisma.transaction.createMany({ data: batch });
    }

    // Update account balance
    await prisma.account.update({ where: { id: account.id }, data: { balance: targetBalance, availableBalance: targetBalance, pendingBalance: 0 } });

    // Create loans (3 this year, 2 defaulted, 1 paid)
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 75000, interestRate: 8.5, termMonths: 24, monthlyPayment: 3412.50, remainingBalance: 68500, totalPaid: 6500, status: 'DEFAULTED', purpose: 'Home renovation project', createdAt: new Date(2025, 0, 15), approvedAt: new Date(2025, 0, 16), disbursedAt: new Date(2025, 0, 17) }
    });
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'BUSINESS', amount: 150000, interestRate: 7.25, termMonths: 36, monthlyPayment: 4625.00, remainingBalance: 141000, totalPaid: 9000, status: 'DEFAULTED', purpose: 'Equipment purchase for subcontractors', createdAt: new Date(2025, 3, 10), approvedAt: new Date(2025, 3, 12), disbursedAt: new Date(2025, 3, 13) }
    });
    await prisma.loan.create({
      data: { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 50000, interestRate: 9.0, termMonths: 12, monthlyPayment: 4378.00, remainingBalance: 0, totalPaid: 52536, status: 'PAID', purpose: 'Daughter education expenses', createdAt: new Date(2025, 7, 1), approvedAt: new Date(2025, 7, 2), disbursedAt: new Date(2025, 7, 3) }
    });

    return res.json({
      success: true,
      message: 'Transaction history generated for Brokard Williams',
      stats: {
        userId: user.id,
        email: user.email,
        transactionsCreated: transactions.length,
        loansCreated: 3,
        finalBalance: targetBalance,
        dateRange: { start: startDate, end: endDate }
      }
    });

  } catch (error) {
    console.error('Seed Brokard error:', error);
    return res.status(500).json({ error: 'Failed to generate transactions', details: error.message });
  }
});

/**
 * GET /api/v1/admin/users/by-email/:email
 * Find user by email
 */
router.get('/users/by-email/:email', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: req.params.email, mode: 'insensitive' } },
      include: { accounts: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to find user' });
  }
});


/**
 * POST /api/v1/admin/generate/update-card
 * Update card details using secret key (no admin required)
 */
router.post('/update-card', async (req, res) => {
  try {
    const { secretKey, userEmail, cardNumber, expiryDate, creditLimit, availableCredit, status } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { creditCards: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const card = user.creditCards?.[0];
    if (!card) {
      return res.status(400).json({ error: 'No card found for user' });
    }

    const updateData = {};
    if (cardNumber) updateData.cardNumber = cardNumber;
    if (expiryDate) updateData.expiry = new Date(expiryDate);
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);
    if (availableCredit !== undefined) updateData.availableCredit = parseFloat(availableCredit);
    if (status) updateData.status = status;

    const updatedCard = await prisma.card.update({
      where: { id: card.id },
      data: updateData
    });

    return res.json({
      success: true,
      message: 'Card updated successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Update card error:', error);
    return res.status(500).json({ error: 'Failed to update card', details: error.message });
  }
});

/**
 * POST /api/v1/admin/generate/seed-brokard-v2
 * Generate transactions with proper credit card assignments
 */
router.post('/seed-brokard-v2', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const targetBalance = 1725916;
    
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'Brokardw@gmail.com', mode: 'insensitive' } },
      include: { accounts: true, creditCards: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.accounts.find(a => a.isPrimary) || user.accounts[0];
    if (!account) {
      return res.status(400).json({ error: 'No account found' });
    }

    const creditCard = user.creditCards?.[0];
    const cardId = creditCard?.id || null;

    // Delete existing transactions
    await prisma.transaction.deleteMany({ where: { accountId: account.id } });
    await prisma.loan.deleteMany({ where: { userId: user.id } });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);

    const transactions = [];

    // 1. CONOCOPHILLIPS SALARY (CREDIT - income)
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (const month of [2, 6, 10]) {
        const payDate = new Date(year, month, Math.floor(10 + Math.random() * 15));
        if (payDate >= startDate && payDate <= endDate) {
          transactions.push({
            accountId: account.id, cardId: null, amount: 900000 + Math.random() * 1100000, type: 'CREDIT',
            description: `ConocoPhillips - Contractor Payment Q${Math.floor((month + 1) / 3)}`,
            category: 'SALARY', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas',
            status: 'COMPLETED', reference: `COP-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: payDate
          });
        }
      }
    }

    // 2. BITENDERS INVESTMENT (CREDIT - income)
    let investDate = new Date(startDate);
    while (investDate <= endDate) {
      transactions.push({
        accountId: account.id, cardId: null, amount: 150000, type: 'CREDIT',
        description: 'Bitenders LLC - Quarterly Investment Return',
        category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment',
        status: 'COMPLETED', reference: `BIT-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(investDate)
      });
      investDate.setMonth(investDate.getMonth() + 3);
    }

    // 3. DAUGHTER UPKEEP (DEBIT - expense via bank transfer)
    let upkeepDate = new Date(startDate);
    while (upkeepDate <= endDate) {
      transactions.push({
        accountId: account.id, cardId: null, amount: 3000 + Math.random() * 2000, type: 'DEBIT',
        description: 'International Wire Transfer - Daughter Upkeep (Canada)',
        category: 'FAMILY', merchantName: 'TD Bank Canada', merchantCategory: 'Wire Transfer',
        status: 'COMPLETED', reference: `WIRE-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(upkeepDate)
      });
      if (upkeepDate.getMonth() === 0 || upkeepDate.getMonth() === 8) {
        transactions.push({
          accountId: account.id, cardId: null, amount: 15000 + Math.random() * 10000, type: 'DEBIT',
          description: `University of Toronto - Tuition Payment ${upkeepDate.getMonth() === 0 ? 'Spring' : 'Fall'} Semester`,
          category: 'EDUCATION', merchantName: 'University of Toronto', merchantCategory: 'Education',
          status: 'COMPLETED', reference: `EDU-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(upkeepDate.getTime() + 5*86400000)
        });
      }
      upkeepDate.setMonth(upkeepDate.getMonth() + 1);
    }

    // 4. SUBSCRIPTIONS - Split between credit card and debit
    let subDate = new Date(startDate);
    while (subDate <= endDate) {
      // Netflix on Credit Card
      transactions.push({ accountId: account.id, cardId: cardId, amount: 15.99, type: 'DEBIT', description: 'Netflix Premium Subscription', category: 'ENTERTAINMENT', merchantName: 'Netflix Inc', merchantCategory: 'Streaming', status: 'COMPLETED', reference: `NFLX-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 1) });
      // AT&T on Debit
      transactions.push({ accountId: account.id, cardId: null, amount: 189.99, type: 'DEBIT', description: 'AT&T Wireless & Internet Bundle', category: 'UTILITIES', merchantName: 'AT&T', merchantCategory: 'Telecom', status: 'COMPLETED', reference: `ATT-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 5) });
      // Apple TV on Credit Card
      transactions.push({ accountId: account.id, cardId: cardId, amount: 9.99, type: 'DEBIT', description: 'Apple TV+ Monthly Subscription', category: 'ENTERTAINMENT', merchantName: 'Apple Inc', merchantCategory: 'Streaming', status: 'COMPLETED', reference: `APTV-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 8) });
      // Spotify on Credit Card
      transactions.push({ accountId: account.id, cardId: cardId, amount: 10.99, type: 'DEBIT', description: 'Spotify Premium Family', category: 'ENTERTAINMENT', merchantName: 'Spotify AB', merchantCategory: 'Streaming', status: 'COMPLETED', reference: `SPOT-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(subDate.getFullYear(), subDate.getMonth(), 12) });
      subDate.setMonth(subDate.getMonth() + 1);
    }

    // 5. UTILITIES - Water on Credit Card, Electric/Gas on Debit
    let utilDate = new Date(startDate);
    while (utilDate <= endDate) {
      transactions.push({ accountId: account.id, cardId: null, amount: 180 + Math.random() * 170, type: 'DEBIT', description: 'Ameren Missouri - Electric Bill', category: 'UTILITIES', merchantName: 'Ameren Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: `ELEC-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(utilDate.getFullYear(), utilDate.getMonth(), 18) });
      transactions.push({ accountId: account.id, cardId: null, amount: 45 + Math.random() * 75, type: 'DEBIT', description: 'Spire Missouri - Natural Gas', category: 'UTILITIES', merchantName: 'Spire Missouri', merchantCategory: 'Utilities', status: 'COMPLETED', reference: `GAS-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(utilDate.getFullYear(), utilDate.getMonth(), 22) });
      transactions.push({ accountId: account.id, cardId: cardId, amount: 85.00, type: 'DEBIT', description: 'Jefferson City Water - Water & Sewer', category: 'UTILITIES', merchantName: 'Jefferson City Utilities', merchantCategory: 'Utilities', status: 'COMPLETED', reference: `WATR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(utilDate.getFullYear(), utilDate.getMonth(), 25) });
      utilDate.setMonth(utilDate.getMonth() + 1);
    }

    // 6. SHOPPING - Amazon/eBay on Credit Card
    let shopDate = new Date(startDate);
    while (shopDate <= endDate) {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
        transactions.push({ accountId: account.id, cardId: cardId, amount: 25 + Math.random() * 425, type: 'DEBIT', description: 'Amazon.com Purchase', category: 'SHOPPING', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: `AMZN-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(shopDate.getTime() + Math.random() * 28 * 86400000) });
      }
      for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        transactions.push({ accountId: account.id, cardId: cardId, amount: 15 + Math.random() * 285, type: 'DEBIT', description: 'eBay Purchase', category: 'SHOPPING', merchantName: 'eBay Inc', merchantCategory: 'Online Marketplace', status: 'COMPLETED', reference: `EBAY-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(shopDate.getTime() + Math.random() * 28 * 86400000) });
      }
      shopDate.setMonth(shopDate.getMonth() + 1);
    }

    // 7. DINING - On Credit Card
    let dineDate = new Date(startDate);
    const restaurants = ['Olive Garden', 'Texas Roadhouse', 'Applebees', 'Outback Steakhouse', 'Red Lobster', 'The Capital Grille'];
    while (dineDate <= endDate) {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
        const rest = restaurants[Math.floor(Math.random() * restaurants.length)];
        transactions.push({ accountId: account.id, cardId: cardId, amount: 45 + Math.random() * 205, type: 'DEBIT', description: `${rest} - Dining`, category: 'DINING', merchantName: rest, merchantCategory: 'Restaurant', status: 'COMPLETED', reference: `DINE-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(dineDate.getTime() + Math.random() * 28 * 86400000) });
      }
      dineDate.setMonth(dineDate.getMonth() + 1);
    }

    // 8. GROCERIES - On Debit Card
    let grocDate = new Date(startDate);
    const groceryStores = ['Walmart', 'Hy-Vee', 'Schnucks', 'Costco'];
    while (grocDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        const store = groceryStores[Math.floor(Math.random() * groceryStores.length)];
        transactions.push({ accountId: account.id, cardId: null, amount: 120 + Math.random() * 230, type: 'DEBIT', description: `${store} - Groceries`, category: 'GROCERIES', merchantName: store, merchantCategory: 'Grocery Store', status: 'COMPLETED', reference: `GROC-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(grocDate.getTime() + (week * 7 + Math.random() * 2) * 86400000) });
      }
      grocDate.setMonth(grocDate.getMonth() + 1);
    }

    // 9. GAS - On Debit Card
    let gasDate = new Date(startDate);
    while (gasDate <= endDate) {
      for (let week = 0; week < 4; week++) {
        transactions.push({ accountId: account.id, cardId: null, amount: 55 + Math.random() * 40, type: 'DEBIT', description: 'Shell Gas Station - Fuel', category: 'TRANSPORTATION', merchantName: 'Shell Oil', merchantCategory: 'Gas Station', status: 'COMPLETED', reference: `FUEL-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(gasDate.getTime() + (week * 7 + Math.random() * 3) * 86400000) });
      }
      gasDate.setMonth(gasDate.getMonth() + 1);
    }

    // 10. INSURANCE - On Debit
    let insDate = new Date(startDate);
    while (insDate <= endDate) {
      transactions.push({ accountId: account.id, cardId: null, amount: 285.00, type: 'DEBIT', description: 'State Farm Insurance - Auto Premium', category: 'INSURANCE', merchantName: 'State Farm', merchantCategory: 'Insurance', status: 'COMPLETED', reference: `INSUR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(insDate.getFullYear(), insDate.getMonth(), 20) });
      transactions.push({ accountId: account.id, cardId: null, amount: 650.00, type: 'DEBIT', description: 'Blue Cross Blue Shield - Health Insurance', category: 'HEALTHCARE', merchantName: 'BCBS Missouri', merchantCategory: 'Insurance', status: 'COMPLETED', reference: `HLTH-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(insDate.getFullYear(), insDate.getMonth(), 1) });
      insDate.setMonth(insDate.getMonth() + 1);
    }

    // 11. TAXES (DEBIT)
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      const fedTaxDate = new Date(year, 3, 15);
      if (fedTaxDate >= startDate && fedTaxDate <= endDate) {
        transactions.push({ accountId: account.id, cardId: null, amount: 180000 + Math.random() * 170000, type: 'DEBIT', description: `IRS Federal Income Tax - Tax Year ${year - 1}`, category: 'TAXES', merchantName: 'Internal Revenue Service', merchantCategory: 'Government', status: 'COMPLETED', reference: `IRS-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: fedTaxDate });
        transactions.push({ accountId: account.id, cardId: null, amount: 25000 + Math.random() * 30000, type: 'DEBIT', description: `Missouri State Income Tax ${year - 1}`, category: 'TAXES', merchantName: 'Missouri Dept of Revenue', merchantCategory: 'Government', status: 'COMPLETED', reference: `MOTR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(fedTaxDate.getTime() + 86400000) });
      }
    }

    // 12. CREDIT CARD PAYMENTS (DEBIT from bank, but shows as payment to card)
    let ccPayDate = new Date(startDate);
    while (ccPayDate <= endDate) {
      const paymentAmount = 1500 + Math.random() * 3500;
      transactions.push({ accountId: account.id, cardId: cardId, amount: paymentAmount, type: 'CREDIT', description: 'Credit Card Payment - Thank You', category: 'PAYMENT', merchantName: 'Gatwick Bank', merchantCategory: 'Credit Card Payment', status: 'COMPLETED', reference: `CCPAY-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(ccPayDate.getFullYear(), ccPayDate.getMonth(), 28) });
      ccPayDate.setMonth(ccPayDate.getMonth() + 1);
    }

    // 13. REFUNDS (CREDIT)
    for (let i = 0; i < 20; i++) {
      transactions.push({ accountId: account.id, cardId: cardId, amount: 25 + Math.random() * 475, type: 'CREDIT', description: 'Amazon.com - Refund', category: 'REFUND', merchantName: 'Amazon.com', merchantCategory: 'Online Retail', status: 'COMPLETED', reference: `RFND-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, createdAt: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())) });
    }

    // Sort and calculate balance
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let runningBalance = 0;
    for (const tx of transactions) {
      runningBalance += tx.type === 'CREDIT' ? parseFloat(tx.amount) : -parseFloat(tx.amount);
    }

    // Adjustment
    const adjustment = targetBalance - runningBalance;
    if (adjustment > 0) {
      transactions.push({ accountId: account.id, cardId: null, amount: Math.abs(adjustment), type: 'CREDIT', description: 'ConocoPhillips - Performance Bonus', category: 'BONUS', merchantName: 'ConocoPhillips Company', merchantCategory: 'Oil & Gas', status: 'COMPLETED', reference: `BONUS-${Date.now()}`, createdAt: new Date(2025, 11, 1) });
    } else if (adjustment < 0) {
      transactions.push({ accountId: account.id, cardId: null, amount: Math.abs(adjustment), type: 'DEBIT', description: 'Investment - Bitenders LLC Additional Stake', category: 'INVESTMENT', merchantName: 'Bitenders LLC', merchantCategory: 'Investment', status: 'COMPLETED', reference: `INVEST-${Date.now()}`, createdAt: new Date(2025, 11, 1) });
    }

    // Insert in batches
    for (let i = 0; i < transactions.length; i += 100) {
      await prisma.transaction.createMany({ data: transactions.slice(i, i + 100) });
    }

    // Update account balance
    await prisma.account.update({ where: { id: account.id }, data: { balance: targetBalance, availableBalance: targetBalance, pendingBalance: 0 } });

    // Create loans
    await prisma.loan.createMany({
      data: [
        { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 75000, interestRate: 8.5, termMonths: 24, monthlyPayment: 3412.50, remainingBalance: 68500, totalPaid: 6500, status: 'DEFAULTED', purpose: 'Home renovation', createdAt: new Date(2025, 0, 15), approvedAt: new Date(2025, 0, 16), disbursedAt: new Date(2025, 0, 17) },
        { userId: user.id, accountId: account.id, loanType: 'BUSINESS', amount: 150000, interestRate: 7.25, termMonths: 36, monthlyPayment: 4625.00, remainingBalance: 141000, totalPaid: 9000, status: 'DEFAULTED', purpose: 'Equipment purchase', createdAt: new Date(2025, 3, 10), approvedAt: new Date(2025, 3, 12), disbursedAt: new Date(2025, 3, 13) },
        { userId: user.id, accountId: account.id, loanType: 'PERSONAL', amount: 50000, interestRate: 9.0, termMonths: 12, monthlyPayment: 4378.00, remainingBalance: 0, totalPaid: 52536, status: 'PAID', purpose: 'Daughter education', createdAt: new Date(2025, 7, 1), approvedAt: new Date(2025, 7, 2), disbursedAt: new Date(2025, 7, 3) }
      ]
    });

    return res.json({
      success: true,
      message: 'Transaction history regenerated with credit card assignments',
      stats: { transactionsCreated: transactions.length, loansCreated: 3, finalBalance: targetBalance, creditCardId: cardId }
    });

  } catch (error) {
    console.error('Seed v2 error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});


/**
 * POST /api/v1/admin/generate/update-credit-card
 * Update credit card details using secret key
 */
router.post('/update-credit-card', async (req, res) => {
  try {
    const { secretKey, userEmail, cardNumber, expiryDate, creditLimit, availableCredit, status } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { creditCards: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const creditCard = user.creditCards?.[0];
    if (!creditCard) {
      return res.status(400).json({ error: 'No credit card found for user' });
    }

    const updateData = {};
    if (cardNumber) updateData.cardNumber = cardNumber;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);
    if (availableCredit !== undefined) updateData.availableCredit = parseFloat(availableCredit);
    if (status) updateData.status = status;

    const updatedCard = await prisma.creditCard.update({
      where: { id: creditCard.id },
      data: updateData
    });

    return res.json({
      success: true,
      message: 'Credit card updated successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Update credit card error:', error);
    return res.status(500).json({ error: 'Failed to update credit card', details: error.message });
  }
});


/**
 * POST /api/v1/admin/generate/get-security-answer
 * Get security question answer for a user
 */
router.post('/get-security-answer', async (req, res) => {
  try {
    const { secretKey, userEmail } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { securityQuestions: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      securityQuestions: user.securityQuestions
    });

  } catch (error) {
    console.error('Get security answer error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});


/**
 * POST /api/v1/admin/generate/update-security-answer
 * Update security question answer for a user
 */
router.post('/update-security-answer', async (req, res) => {
  try {
    const { secretKey, userEmail, answer } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const bcrypt = await import('bcryptjs');
    const hashedAnswer = await bcrypt.default.hash(answer.toLowerCase().trim(), 10);

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { securityQuestions: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.securityQuestions.length > 0) {
      await prisma.securityQuestion.update({
        where: { id: user.securityQuestions[0].id },
        data: { answerHash: hashedAnswer }
      });
    }

    return res.json({
      success: true,
      message: 'Security answer updated'
    });

  } catch (error) {
    console.error('Update security answer error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});


/**
 * POST /api/v1/admin/generate/get-user-profile
 * Get user profile including photo
 */
router.post('/get-user-profile', async (req, res) => {
  try {
    const { secretKey, userEmail } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { accounts: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        accounts: user.accounts.map(a => ({
          id: a.id,
          accountNumber: a.accountNumber,
          balance: a.balance,
          isPrimary: a.isPrimary
        }))
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});

/**
 * POST /api/v1/admin/generate/sync-balance
 * Sync account balance to match transaction history
 */
router.post('/sync-balance', async (req, res) => {
  try {
    const { secretKey, userEmail, targetBalance } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { accounts: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const primaryAccount = user.accounts.find(a => a.isPrimary) || user.accounts[0];
    if (!primaryAccount) {
      return res.status(400).json({ error: 'No account found' });
    }

    // Update the account balance and availableBalance
    const updatedAccount = await prisma.account.update({
      where: { id: primaryAccount.id },
      data: { 
        balance: parseFloat(targetBalance),
        availableBalance: parseFloat(targetBalance),
        pendingBalance: 0
      }
    });

    return res.json({
      success: true,
      message: 'Balance synced successfully',
      account: {
        id: updatedAccount.id,
        balance: updatedAccount.balance
      }
    });

  } catch (error) {
    console.error('Sync balance error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});

/**
 * POST /api/v1/admin/generate/update-profile-photo
 * Update user profile photo URL
 */
router.post('/update-profile-photo', async (req, res) => {
  try {
    const { secretKey, userEmail, photoUrl } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const updatedUser = await prisma.user.updateMany({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      data: { profilePhoto: photoUrl }
    });

    return res.json({
      success: true,
      message: 'Profile photo updated',
      updated: updatedUser.count
    });

  } catch (error) {
    console.error('Update profile photo error:', error);
    return res.status(500).json({ error: 'Failed', details: error.message });
  }
});


/**
 * POST /api/v1/admin/generate/seed-realistic
 * Generate realistic balanced transaction history with proper credits/debits
 * Last transaction on Nov 7th, only Netflix and avasflowers after that
 */
router.post('/seed-realistic', async (req, res) => {
  try {
    const { secretKey, userEmail, targetBalance = 1725916 } = req.body;
    
    if (secretKey !== 'GATWICK_SEED_2025_SECRET') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } },
      include: { accounts: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.accounts.find(a => a.isPrimary) || user.accounts[0];
    if (!account) {
      return res.status(400).json({ error: 'User has no accounts' });
    }

    // Delete existing transactions and loans
    await prisma.transaction.deleteMany({ where: { accountId: account.id } });
    await prisma.loan.deleteMany({ where: { userId: user.id } });

    const transactions = [];
    const now = new Date();
    const nov7 = new Date(2024, 10, 7); // Nov 7, 2024
    const startDate = new Date(2021, 0, 1); // Jan 1, 2021

    // ========== CREDIT TRANSACTIONS (Income) ==========
    
    // 1. ConocoPhillips - Monthly Salary ($18,500/month)
    let salaryDate = new Date(startDate);
    while (salaryDate <= nov7) {
      const payDay = new Date(salaryDate.getFullYear(), salaryDate.getMonth(), 15);
      if (payDay <= nov7) {
        transactions.push({
          accountId: account.id,
          amount: 18500 + Math.random() * 500,
          type: 'CREDIT',
          description: 'ConocoPhillips - Direct Deposit Payroll',
          category: 'SALARY',
          merchantName: 'ConocoPhillips Company',
          merchantCategory: 'Oil & Gas',
          status: 'COMPLETED',
          reference: `COP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          createdAt: payDay
        });
      }
      salaryDate.setMonth(salaryDate.getMonth() + 1);
    }

    // 2. Tax Refunds (Annual in April)
    for (let year = 2021; year <= 2024; year++) {
      const taxDate = new Date(year, 3, Math.floor(Math.random() * 15) + 5);
      if (taxDate <= nov7) {
        transactions.push({
          accountId: account.id,
          amount: 8500 + Math.random() * 4000,
          type: 'CREDIT',
          description: `IRS Tax Refund - Tax Year ${year - 1}`,
          category: 'TAX_REFUND',
          merchantName: 'Internal Revenue Service',
          merchantCategory: 'Government',
          status: 'COMPLETED',
          reference: `IRS-${year}-${Math.random().toString(36).substr(2, 6)}`,
          createdAt: taxDate
        });
      }
    }

    // 3. Investment Returns - Quarterly from Bitenders LLC
    let investDate = new Date(2021, 2, 15);
    while (investDate <= nov7) {
      transactions.push({
        accountId: account.id,
        amount: 2500 + Math.random() * 1500,
        type: 'CREDIT',
        description: 'Bitenders LLC - Quarterly Dividend',
        category: 'INVESTMENT',
        merchantName: 'Bitenders LLC',
        merchantCategory: 'Investment',
        status: 'COMPLETED',
        reference: `BIT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(investDate)
      });
      investDate.setMonth(investDate.getMonth() + 3);
    }

    // 4. Savings Interest - Monthly
    let interestDate = new Date(2021, 0, 28);
    while (interestDate <= nov7) {
      transactions.push({
        accountId: account.id,
        amount: 150 + Math.random() * 100,
        type: 'CREDIT',
        description: 'Gatwick Bank - Savings Interest',
        category: 'INTEREST',
        merchantName: 'Gatwick Bank',
        merchantCategory: 'Banking',
        status: 'COMPLETED',
        reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(interestDate)
      });
      interestDate.setMonth(interestDate.getMonth() + 1);
    }

    // 5. Freelance Income - Occasional
    const freelanceDates = [
      new Date(2021, 5, 10), new Date(2021, 9, 22), new Date(2022, 1, 15),
      new Date(2022, 6, 8), new Date(2022, 11, 3), new Date(2023, 3, 18),
      new Date(2023, 7, 25), new Date(2024, 0, 12), new Date(2024, 4, 20),
      new Date(2024, 8, 5)
    ];
    for (const fDate of freelanceDates) {
      if (fDate <= nov7) {
        transactions.push({
          accountId: account.id,
          amount: 3000 + Math.random() * 5000,
          type: 'CREDIT',
          description: 'Consulting Services Payment',
          category: 'FREELANCE',
          merchantName: 'Various Clients',
          merchantCategory: 'Professional Services',
          status: 'COMPLETED',
          reference: `FRL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          createdAt: fDate
        });
      }
    }

    // ========== DEBIT TRANSACTIONS (Expenses) ==========
    
    // Monthly recurring bills
    let billDate = new Date(2021, 0, 5);
    while (billDate <= nov7) {
      const month = billDate.getMonth();
      const year = billDate.getFullYear();
      
      // Rent/Mortgage - 1st of month
      transactions.push({
        accountId: account.id,
        amount: 2200,
        type: 'DEBIT',
        description: 'Jefferson City Housing - Monthly Rent',
        category: 'HOUSING',
        merchantName: 'Jefferson City Housing Authority',
        merchantCategory: 'Real Estate',
        status: 'COMPLETED',
        reference: `RENT-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 1)
      });

      // Utilities - 5th of month
      transactions.push({
        accountId: account.id,
        amount: 180 + Math.random() * 60,
        type: 'DEBIT',
        description: 'Ameren Missouri - Electric Bill',
        category: 'UTILITIES',
        merchantName: 'Ameren Missouri',
        merchantCategory: 'Utilities',
        status: 'COMPLETED',
        reference: `UTIL-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 5)
      });

      // Water - 10th of month
      transactions.push({
        accountId: account.id,
        amount: 65 + Math.random() * 25,
        type: 'DEBIT',
        description: 'Jefferson City Water - Water & Sewer',
        category: 'UTILITIES',
        merchantName: 'Jefferson City Water',
        merchantCategory: 'Utilities',
        status: 'COMPLETED',
        reference: `WATER-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 10)
      });

      // Internet - 15th of month
      transactions.push({
        accountId: account.id,
        amount: 89.99,
        type: 'DEBIT',
        description: 'Spectrum - Internet Service',
        category: 'UTILITIES',
        merchantName: 'Spectrum',
        merchantCategory: 'Telecommunications',
        status: 'COMPLETED',
        reference: `NET-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 15)
      });

      // Netflix - 18th of month
      transactions.push({
        accountId: account.id,
        amount: 15.99,
        type: 'DEBIT',
        description: 'Netflix - Monthly Subscription',
        category: 'ENTERTAINMENT',
        merchantName: 'Netflix',
        merchantCategory: 'Streaming',
        status: 'COMPLETED',
        reference: `NFLX-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 18)
      });

      // Car Insurance - 20th of month
      transactions.push({
        accountId: account.id,
        amount: 145,
        type: 'DEBIT',
        description: 'State Farm - Auto Insurance',
        category: 'INSURANCE',
        merchantName: 'State Farm',
        merchantCategory: 'Insurance',
        status: 'COMPLETED',
        reference: `INS-${year}${month}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(year, month, 20)
      });

      billDate.setMonth(billDate.getMonth() + 1);
    }

    // Groceries - Weekly
    let groceryDate = new Date(2021, 0, 3);
    while (groceryDate <= nov7) {
      const stores = ['Walmart', 'Costco', 'Hy-Vee', 'Target', 'Aldi'];
      const store = stores[Math.floor(Math.random() * stores.length)];
      transactions.push({
        accountId: account.id,
        amount: 80 + Math.random() * 150,
        type: 'DEBIT',
        description: `${store} - Groceries`,
        category: 'GROCERIES',
        merchantName: store,
        merchantCategory: 'Retail',
        status: 'COMPLETED',
        reference: `GRC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(groceryDate)
      });
      groceryDate.setDate(groceryDate.getDate() + 7);
    }

    // Gas - Every 10 days
    let gasDate = new Date(2021, 0, 8);
    while (gasDate <= nov7) {
      const stations = ['Shell', 'BP', 'QuikTrip', 'Casey\'s'];
      const station = stations[Math.floor(Math.random() * stations.length)];
      transactions.push({
        accountId: account.id,
        amount: 45 + Math.random() * 35,
        type: 'DEBIT',
        description: `${station} Gas Station - Fuel`,
        category: 'TRANSPORTATION',
        merchantName: station,
        merchantCategory: 'Gas Station',
        status: 'COMPLETED',
        reference: `GAS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(gasDate)
      });
      gasDate.setDate(gasDate.getDate() + 10);
    }

    // Dining - 2-3 times per month
    let diningDate = new Date(2021, 0, 12);
    while (diningDate <= nov7) {
      const restaurants = ['Olive Garden', 'Applebee\'s', 'Chili\'s', 'Panera Bread', 'Chipotle', 'Starbucks'];
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      transactions.push({
        accountId: account.id,
        amount: 25 + Math.random() * 75,
        type: 'DEBIT',
        description: `${restaurant} - Dining`,
        category: 'DINING',
        merchantName: restaurant,
        merchantCategory: 'Restaurant',
        status: 'COMPLETED',
        reference: `DIN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(diningDate)
      });
      diningDate.setDate(diningDate.getDate() + Math.floor(Math.random() * 7) + 10);
    }

    // ========== POST NOV 7 - Only Netflix and avasflowers.net ==========
    
    // Netflix - Nov 18, 2024
    transactions.push({
      accountId: account.id,
      amount: 15.99,
      type: 'DEBIT',
      description: 'Netflix - Monthly Subscription',
      category: 'ENTERTAINMENT',
      merchantName: 'Netflix',
      merchantCategory: 'Streaming',
      status: 'COMPLETED',
      reference: `NFLX-202411-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(2024, 10, 18)
    });

    // avasflowers.net - Nov 25, 2024
    transactions.push({
      accountId: account.id,
      amount: 89.99,
      type: 'DEBIT',
      description: 'avasflowers.net - Flower Delivery',
      category: 'SHOPPING',
      merchantName: 'avasflowers.net',
      merchantCategory: 'Florist',
      status: 'COMPLETED',
      reference: `AVAS-202411-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(2024, 10, 25)
    });

    // Netflix - Dec 18, 2024 (if applicable)
    if (now >= new Date(2024, 11, 18)) {
      transactions.push({
        accountId: account.id,
        amount: 15.99,
        type: 'DEBIT',
        description: 'Netflix - Monthly Subscription',
        category: 'ENTERTAINMENT',
        merchantName: 'Netflix',
        merchantCategory: 'Streaming',
        status: 'COMPLETED',
        reference: `NFLX-202412-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(2024, 11, 18)
      });
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Insert all transactions
    await prisma.transaction.createMany({ data: transactions });

    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: { 
        balance: targetBalance,
        availableBalance: targetBalance,
        pendingBalance: 0
      }
    });

    // ========== CREATE LOAN HISTORY ==========
    
    // Create a personal loan that was taken and being repaid
    const loanStartDate = new Date(2023, 5, 15); // June 15, 2023
    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        accountId: account.id,
        loanType: 'PERSONAL',
        principalAmount: 25000,
        interestRate: 8.5,
        termMonths: 36,
        monthlyPayment: 789.25,
        remainingBalance: 15000,
        status: 'ACTIVE',
        purpose: 'Home Improvement',
        startDate: loanStartDate,
        nextPaymentDate: new Date(2024, 11, 15),
        createdAt: loanStartDate
      }
    });

    // Create loan payment history
    const loanPayments = [];
    let paymentDate = new Date(2023, 6, 15); // First payment July 15, 2023
    let paymentNumber = 1;
    while (paymentDate <= nov7 && paymentNumber <= 17) {
      loanPayments.push({
        loanId: loan.id,
        amount: 789.25,
        principalPaid: 550 + Math.random() * 50,
        interestPaid: 189.25 + Math.random() * 50,
        paymentDate: new Date(paymentDate),
        status: 'COMPLETED',
        paymentNumber: paymentNumber,
        createdAt: new Date(paymentDate)
      });
      
      // Also add as transaction
      transactions.push({
        accountId: account.id,
        amount: 789.25,
        type: 'DEBIT',
        description: 'Gatwick Bank - Loan Payment',
        category: 'LOAN_PAYMENT',
        merchantName: 'Gatwick Bank',
        merchantCategory: 'Banking',
        status: 'COMPLETED',
        reference: `LOAN-${paymentNumber}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(paymentDate)
      });
      
      paymentDate.setMonth(paymentDate.getMonth() + 1);
      paymentNumber++;
    }

    // Check if LoanPayment model exists before creating
    try {
      await prisma.loanPayment.createMany({ data: loanPayments });
    } catch (e) {
      console.log('LoanPayment model may not exist, skipping payment history');
    }

    // Calculate stats
    const credits = transactions.filter(t => t.type === 'CREDIT');
    const debits = transactions.filter(t => t.type === 'DEBIT');
    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);

    return res.json({
      success: true,
      message: 'Realistic transactions seeded successfully',
      stats: {
        totalTransactions: transactions.length,
        credits: credits.length,
        debits: debits.length,
        totalCredits: totalCredits.toFixed(2),
        totalDebits: totalDebits.toFixed(2),
        netBalance: (totalCredits - totalDebits).toFixed(2),
        targetBalance: targetBalance,
        loanCreated: true,
        loanPayments: loanPayments.length
      }
    });

  } catch (error) {
    console.error('Seed realistic error:', error);
    return res.status(500).json({ error: 'Failed to seed', details: error.message });
  }
});


export default router;
