import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const brianEmail = 'brianmerker3@gmail.com';
  
  // Find Brian
  const brian = await prisma.user.findUnique({
    where: { email: brianEmail },
    include: { accounts: true }
  });

  if (!brian) {
    console.log('❌ Brian not found');
    return;
  }

  console.log('✅ Found Brian:', brian.firstName, brian.lastName);

  // Find accounts
  const checkingAccount = brian.accounts.find(a => a.accountType === 'CHECKING');
  const savingsAccount = brian.accounts.find(a => a.accountType === 'SAVINGS');
  const cryptoAccount = brian.accounts.find(a => a.accountType === 'CRYPTO_WALLET');

  if (!checkingAccount || !savingsAccount) {
    console.log('❌ Missing checking or savings account');
    return;
  }

  console.log('\n📊 Current Account Balances:');
  console.log(`   Checking: $${checkingAccount.balance}`);
  console.log(`   Savings: $${savingsAccount.balance}`);
  console.log(`   Crypto: $${cryptoAccount?.balance || 0}`);

  // Create 3 backdated internal transfers of $40,000 each
  // This will pay off the -$120,000 in savings
  const payments = [
    { date: new Date('2025-10-11'), amount: 40000, description: 'Monthly savings contribution - October 2025' },
    { date: new Date('2025-11-11'), amount: 40000, description: 'Monthly savings contribution - November 2025' },
    { date: new Date('2025-12-11'), amount: 40000, description: 'Monthly savings contribution - December 2025' },
  ];

  console.log('\n💸 Creating backdated internal transfers...');

  for (const payment of payments) {
    // Create internal transfer transaction (debit from checking)
    await prisma.transaction.create({
      data: {
        accountId: checkingAccount.id,
        amount: -payment.amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: payment.description,
        reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: payment.date,
        updatedAt: payment.date
      }
    });

    // Create internal transfer transaction (credit to savings)
    await prisma.transaction.create({
      data: {
        accountId: savingsAccount.id,
        amount: payment.amount,
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: payment.description,
        reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: payment.date,
        updatedAt: payment.date
      }
    });

    console.log(`   ✓ ${payment.date.toLocaleDateString()}: $${payment.amount} from Checking → Savings`);
  }

  // Update account balances
  // Checking: deduct $120,000 (3 x $40,000)
  // Savings: add $120,000 (to pay off the -$120,000 debt)
  const totalTransferred = 120000;

  await prisma.account.update({
    where: { id: checkingAccount.id },
    data: { balance: { decrement: totalTransferred } }
  });

  await prisma.account.update({
    where: { id: savingsAccount.id },
    data: { balance: { increment: totalTransferred } }
  });

  console.log('\n✅ Account balances updated:');
  console.log(`   Checking: $${parseFloat(checkingAccount.balance) - totalTransferred}`);
  console.log(`   Savings: $${parseFloat(savingsAccount.balance) + totalTransferred}`);

  // Create recurring payment for future ($20,000/month)
  const nextPaymentDate = new Date('2026-01-11');
  
  await prisma.recurringPayment.create({
    data: {
      userId: brian.id,
      fromAccountId: checkingAccount.id,
      toAccountId: savingsAccount.id,
      amount: 20000,
      frequency: 'MONTHLY',
      description: 'Monthly savings contribution',
      nextPaymentDate: nextPaymentDate,
      isActive: true,
      createdAt: new Date()
    }
  });

  console.log('\n📅 Created recurring payment:');
  console.log(`   Amount: $20,000/month`);
  console.log(`   From: Checking → Savings`);
  console.log(`   Next Payment: ${nextPaymentDate.toLocaleDateString()}`);

  // Update Brian's credit card limit to $450,000
  const creditCard = await prisma.creditCard.findFirst({
    where: { userId: brian.id }
  });

  if (creditCard) {
    await prisma.creditCard.update({
      where: { id: creditCard.id },
      data: {
        creditLimit: 450000,
        availableCredit: 450000,
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        isActive: true
      }
    });
    console.log('\n💳 Updated credit card:');
    console.log(`   Credit Limit: $450,000`);
    console.log(`   Available Credit: $450,000`);
    console.log(`   Status: APPROVED & ACTIVE`);
  }

  console.log('\n🎉 All updates completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
