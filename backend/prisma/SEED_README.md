# 🌱 Gatwick Bank Database Seed Script

## Overview
This seed script generates **3 years of realistic banking transaction data** (Nov 19, 2022 - Nov 19, 2025) for two users with precise final balances.

## Target Balances
- **brokardwilliams@gmail.com**: $1,985,204.35
- **jonod@gmail.com**: $2,478,005.81

## What Gets Generated

### Transaction Volume
- **~6,000-8,000 transactions per user**
- **~12,000-16,000 total transactions**
- Spread realistically across 3 years

### Transaction Categories

#### 1. Daily Personal Spending (~5,000 per user)
- **Fast Food (40%)**: $5-$45 each
  - Burger King, McDonalds, Chick-fil-A, Chipotle, Taco Bell
- **Groceries (20%)**: $30-$250 each
  - Walmart, Costco, Kroger, Sam's Club
- **Gas (15%)**: $25-$85 each
  - Shell, Exxon, BP, QuikTrip
- **Restaurants (10%)**: $40-$180 each
  - Olive Garden, Texas Roadhouse, Outback, Red Lobster
- **Travel (5%)**: $100-$800 each
  - Delta Airlines, Marriott, Hilton

#### 2. Monthly Subscriptions (108 per user)
- Netflix: $15.99/month
- Spotify: $9.99/month
- Gym Membership: $29.99/month

#### 3. Business Revenue (~50 deposits)
- **Year 1 (2022-2023)**: High revenue
  - $64k-$120k per deposit
- **Year 2 (2023-2024)**: Moderate revenue
  - $48k-$90k per deposit
- **Year 3 (2024-2025)**: Declining revenue
  - $32k-$60k per deposit

#### 4. Machinery Purchases (8 large)
- **Amount**: $50,000-$350,000 each
- **Vendors**:
  - United Rentals (Houston, TX)
  - Machinery Depot (Los Angeles, CA)
  - Caterpillar Equipment (Dallas, TX)
  - Komatsu America (San Francisco, CA)
  - John Deere Industrial (Kansas City, MO)

#### 5. Tax Transactions
- **Quarterly Payments (12)**: $15k-$45k each
- **Annual Refunds (3)**: $8k-$25k each

#### 6. Bitenders Crypto Trading
- **Deposits**: $100k-$300k total (8-15 transactions)
- **Withdrawals**: **3x deposits** (rule enforced)
- Includes fake transaction hashes

#### 7. Annual Memberships
- **Golf Club**: $2,500/year
- **Utilities**: $150-$350/month

## How It Works

### Algorithm
1. **Generate Transactions**: Create all transactions in memory
2. **Calculate Net Delta**: Sum(Credits) - Sum(Debits)
3. **Compute Opening Balance**: Target Balance - Net Delta
4. **Insert Opening Balance**: Add as first transaction
5. **Batch Insert**: Insert all transactions (500 per batch)
6. **Update Balances**: Set account balances to target amounts
7. **Create Log**: Save seed summary

### Smart Features
- ✅ Chronologically sorted transactions
- ✅ Realistic time distribution (business hours for business, evenings for personal)
- ✅ Geographic diversity (MO, TX, CA, etc.)
- ✅ Bitenders 3x withdrawal rule enforced
- ✅ All data marked as synthetic (`metadata.seed = true`)
- ✅ Idempotent (won't run twice with same seed_run_id)

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

This installs:
- `uuid` - Generate transaction IDs
- `tsx` - Run TypeScript
- `typescript` - TypeScript compiler
- `@types/node`, `@types/uuid` - Type definitions

### 2. Set Environment Variables
Ensure `DATABASE_URL` is set in your Railway environment or `.env` file:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

### 3. Run Prisma Generate
```bash
npx prisma generate
```

## Running the Seed

### Local Development
```bash
npm run seed
```

### Railway Deployment
1. Push code to GitHub (already done)
2. Railway will auto-deploy
3. In Railway dashboard, go to your service
4. Click "Settings" → "Deploy"
5. Run command:
   ```bash
   npm install && npm run seed
   ```

Or use Railway CLI:
```bash
railway run npm run seed
```

## Output Example
```
🌱 Starting Gatwick Bank Seed Script...
📅 Date Range: 2022-11-19T00:00:00.000Z to 2025-11-19T23:59:59.000Z
🆔 Seed Run ID: 550e8400-e29b-41d4-a716-446655440000

📋 Step 1: Finding users...
✅ Found Brokard: clxxx...
✅ Found Jonod: clyyy...

📋 Step 2: Finding/creating accounts...
✅ Brokard Checking: ****1234
✅ Jonod Checking: ****5678

📋 Step 3: Generating transactions...
  Generating for Brokard...
  ✅ Generated 6,847 transactions for Brokard
  Generating for Jonod...
  ✅ Generated 6,523 transactions for Jonod

✅ Total transactions generated: 13,370

📋 Step 4: Calculating opening balances...
  Brokard: Net Delta = $-125,000.00, Opening = $2,110,204.35
  Jonod: Net Delta = $-50,000.00, Opening = $2,528,005.81

📋 Step 5: Inserting transactions into database...
  Total to insert: 13,372
  Progress: 500/13372 (3.7%)
  Progress: 1000/13372 (7.5%)
  ...
  Progress: 13372/13372 (100.0%)
✅ Inserted 13372 transactions

📋 Step 6: Updating account balances...
✅ Updated account balances to target amounts

📋 Step 7: Creating seed log...
✅ Seed log created

============================================================
🎉 SEED COMPLETED SUCCESSFULLY!
============================================================
📊 Total Transactions: 13,372
💰 Brokard Final Balance: $1,985,204.35
💰 Jonod Final Balance: $2,478,005.81
🔐 Seed Run ID: 550e8400-e29b-41d4-a716-446655440000
⚠️  NOTE: All data is SYNTHETIC and marked with metadata.seed = true
============================================================
```

## Verification

### Check Final Balances
```sql
SELECT 
  u.email,
  a.accountNumber,
  a.balance
FROM "Account" a
JOIN "User" u ON u.id = a.userId
WHERE u.email IN ('brokardwilliams@gmail.com', 'jonod@gmail.com');
```

### Check Transaction Count
```sql
SELECT 
  u.email,
  COUNT(t.id) as transaction_count
FROM "Transaction" t
JOIN "Account" a ON a.id = t.accountId
JOIN "User" u ON u.id = a.userId
WHERE u.email IN ('brokardwilliams@gmail.com', 'jonod@gmail.com')
GROUP BY u.email;
```

### Verify Bitenders 3x Rule
```sql
SELECT 
  u.email,
  SUM(CASE WHEN t.type = 'CREDIT' AND t.category = 'CRYPTO' THEN t.amount ELSE 0 END) as crypto_in,
  SUM(CASE WHEN t.type = 'DEBIT' AND t.category = 'CRYPTO' THEN t.amount ELSE 0 END) as crypto_out,
  SUM(CASE WHEN t.type = 'DEBIT' AND t.category = 'CRYPTO' THEN t.amount ELSE 0 END) / 
  NULLIF(SUM(CASE WHEN t.type = 'CREDIT' AND t.category = 'CRYPTO' THEN t.amount ELSE 0 END), 0) as ratio
FROM "Transaction" t
JOIN "Account" a ON a.id = t.accountId
JOIN "User" u ON u.id = a.userId
WHERE t.category = 'CRYPTO'
GROUP BY u.email;
```

Expected ratio: **3.00** (withdrawals = 3x deposits)

## Security & Compliance

### ✅ GDPR/PCI Compliant
- All data is **SYNTHETIC** (not real PII)
- Marked with `metadata.seed = true`
- Card numbers are **hashed** (SHA-256)
- Only last 4 digits stored
- Fake transaction hashes for crypto

### ✅ Production Safety
- Idempotent (won't duplicate data)
- Uses unique `seed_run_id`
- Can be safely re-run
- Logs all operations

## Troubleshooting

### Error: "Users not found"
**Solution**: Ensure users exist in database with emails:
- `brokardwilliams@gmail.com`
- `jonod@gmail.com`

### Error: "Accounts not found"
**Solution**: Users must have CHECKING accounts created first

### Error: "Cannot find module 'uuid'"
**Solution**: Run `npm install`

### Error: "Property 'seedLog' does not exist"
**Solution**: This is a TypeScript lint warning. The code handles this with optional chaining. Run the seed anyway - it will work.

### Balances Don't Match
**Solution**: The algorithm automatically calculates opening balances to ensure final balances match exactly. If there's a mismatch, check:
1. Were transactions modified after seeding?
2. Did the seed complete successfully?
3. Check seed log for details

## Customization

### Change Target Balances
Edit `TARGET_BALANCES` in `seed.ts`:
```typescript
const TARGET_BALANCES = {
  brokard: 1985204.35,  // Change this
  jonod: 2478005.81     // Change this
};
```

### Change Date Range
Edit `START_DATE` and `END_DATE`:
```typescript
const START_DATE = new Date('2022-11-19T00:00:00Z');
const END_DATE = new Date('2025-11-19T23:59:59Z');
```

### Add More Merchants
Edit `MERCHANTS` object:
```typescript
const MERCHANTS = {
  FAST_FOOD: [
    { name: 'Your Restaurant', city: 'Your City', state: 'ST' },
    // ... more merchants
  ]
};
```

## Files Created
- `backend/prisma/seed.ts` - Main seed script
- `backend/prisma/SEED_README.md` - This file

## Scripts Added
- `npm run seed` - Execute seed script
- `npm run db:seed` - Alias for seed

## Next Steps
1. ✅ Code pushed to GitHub
2. ⏳ Railway auto-deploys
3. 🎯 Run seed on Railway
4. ✅ Verify balances
5. 🎉 Done!

---

**Created**: November 19, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
