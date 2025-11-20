# Mock Data Setup Guide

## Overview
This project uses local mock data for development and testing. Each developer can create their own mock data without conflicts.

---

## Quick Start

### 1. Create Your Mock Data File

```bash
cd frontend/src/lib
cp mockData.example.js mockData.js
```

### 2. Customize Your Data

Edit `mockData.js` with your own test data:

```javascript
export const mockAccounts = [
  {
    id: 'acc-1',
    accountNumber: 'YOUR_ACCOUNT_NUMBER',
    accountType: 'Checking',
    balance: '10,000.00',
    // ... customize as needed
  },
];
```

### 3. Use in Components

The mock data is automatically used when:
- Backend API is unavailable
- User is logged in as `dev-user`
- In development mode

---

## Mock Data Structure

### Accounts
```javascript
{
  id: string,
  accountNumber: string,
  accountType: 'Checking' | 'Savings' | 'Business',
  balance: string,
  currency: 'USD',
  status: 'active' | 'inactive',
  createdAt: ISO date string
}
```

### Cards
```javascript
{
  id: string,
  cardNumber: string (masked),
  cardType: string,
  status: 'active' | 'inactive',
  expiryDate: string (MM/YY),
  accountId: string,
  accountNumber: string,
  balance: string,
  cvv: string (masked),
  cardholderName: string
}
```

### Transactions
```javascript
{
  id: string,
  description: string,
  amount: string (with +/- prefix),
  date: ISO date string,
  type: 'debit' | 'credit',
  category: string,
  status: 'completed' | 'pending' | 'failed',
  accountId: string
}
```

---

## Example Data Sets

### Minimal (For Testing)
```javascript
export const mockAccounts = [
  {
    id: 'acc-1',
    accountNumber: '1234567890',
    accountType: 'Checking',
    balance: '1,000.00',
    currency: 'USD',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const mockTransactions = [
  {
    id: 'txn-1',
    description: 'Test Transaction',
    amount: '-50.00',
    date: new Date().toISOString(),
    type: 'debit',
    category: 'Shopping',
    status: 'completed',
    accountId: 'acc-1',
  },
];
```

### Comprehensive (For Demo)
See the generated `mockData.js` for a full example with:
- 3 accounts (Checking, Savings, Business)
- 3 cards (Visa, Mastercard, Amex)
- 20+ transactions across different categories
- Payment history
- KYC status

---

## Tips for Creating Mock Data

### 1. Realistic Amounts
```javascript
// Good
balance: '8,450.75'
amount: '-89.99'

// Avoid
balance: '999999.99'
amount: '-1.00'
```

### 2. Varied Transaction Types
Include a mix of:
- Income (salary, freelance, dividends)
- Shopping (Amazon, retail stores)
- Bills (utilities, subscriptions)
- Food & Dining
- Transportation
- Entertainment

### 3. Realistic Dates
```javascript
// Recent transactions
date: new Date().toISOString()
date: new Date(Date.now() - 86400000).toISOString() // 1 day ago

// Older transactions
date: new Date(Date.now() - 604800000).toISOString() // 1 week ago
```

### 4. Consistent IDs
```javascript
// Link transactions to accounts
{
  id: 'txn-1',
  accountId: 'acc-1', // Must match an account ID
  // ...
}
```

---

## Git Workflow

### What's Tracked
✅ `mockData.example.js` - Template file (committed to git)

### What's NOT Tracked
❌ `mockData.js` - Your personal mock data (gitignored)

### Why?
- Each developer has their own test data
- No merge conflicts
- Privacy (your test data stays local)
- Easy to reset (just copy from example)

---

## Troubleshooting

### "Mock data not loading"
1. Check file exists: `frontend/src/lib/mockData.js`
2. Check file exports all required objects
3. Check console for import errors

### "Data structure mismatch"
1. Compare your structure with `mockData.example.js`
2. Ensure all required fields are present
3. Check data types (strings, numbers, dates)

### "Want to reset data"
```bash
cd frontend/src/lib
rm mockData.js
cp mockData.example.js mockData.js
```

---

## Advanced Usage

### Custom Data Generators

Create a helper to generate bulk data:

```javascript
// mockData.js
function generateTransactions(count) {
  const categories = ['Shopping', 'Food', 'Transport', 'Bills'];
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    transactions.push({
      id: `txn-${i + 1}`,
      description: `Transaction ${i + 1}`,
      amount: `-${(Math.random() * 100).toFixed(2)}`,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      type: 'debit',
      category: categories[i % categories.length],
      status: 'completed',
      accountId: 'acc-1',
    });
  }
  
  return transactions;
}

export const mockTransactions = generateTransactions(50);
```

### Conditional Data

Different data for different scenarios:

```javascript
const isDemoMode = process.env.VITE_DEMO_MODE === 'true';

export const mockDashboard = {
  summary: {
    totalBalance: isDemoMode ? '100,000.00' : '5,000.00',
    // ...
  },
};
```

---

## Best Practices

1. **Keep it realistic** - Use amounts and descriptions that make sense
2. **Vary the data** - Mix positive and negative transactions
3. **Use proper formatting** - Commas in amounts, proper date formats
4. **Link data correctly** - Ensure IDs match between related objects
5. **Don't commit** - Never commit your personal mockData.js file

---

## Need Help?

1. Check `mockData.example.js` for structure reference
2. Look at existing components to see how data is used
3. Check console for data-related errors
4. Reset to example if things break

---

## Summary

- Copy `mockData.example.js` to `mockData.js`
- Customize with your test data
- File is gitignored (won't be committed)
- Reset anytime by copying from example
- Use realistic, varied data for best testing

Happy testing! 🚀
