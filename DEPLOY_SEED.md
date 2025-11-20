# 🚀 Deploy Seed Script to Railway

## ✅ UPDATED: Automatic User & Account Creation

The seed script now **automatically creates users and accounts** if they don't exist!

## Quick Deploy (Recommended)

### Option 1: Railway Dashboard - One-Time Command (EASIEST)
1. Go to https://railway.app/dashboard
2. Select your "Gatwick bank" project  
3. Click on your **backend service** (not Postgres)
4. Click the **"..."** menu (three dots) in top right
5. Select **"Run a Command"**
6. In the command box, enter:
```bash
npm run seed
```
7. Click **"Run"**
8. Watch the logs in real-time!

**Expected Output:**
```
🌱 Starting Gatwick Bank Seed Script...
📋 Step 1: Finding or creating users...
  Creating Brokard Williams...
  ✅ Created Brokard: clxxx...
  Creating Jon Nod...
  ✅ Created Jonod: clyyy...
📋 Step 2: Finding/creating accounts...
  Creating Brokard checking account...
  ✅ Created account: BRK12345678
  Creating Jonod checking account...
  ✅ Created account: JON87654321
📋 Step 3: Generating transactions...
  ...
🎉 SEED COMPLETED SUCCESSFULLY!
💰 Brokard Final Balance: $1,985,204.35
💰 Jonod Final Balance: $2,478,005.81
```

### Option 1B: If "Run a Command" doesn't work
1. Go to your backend service
2. Click **"Settings"** tab
3. Scroll to **"Service"** section
4. Find **"Start Command"** 
5. Temporarily change it to: `npm run seed`
6. Click **"Deploy"**
7. Wait for deployment to complete
8. **IMPORTANT**: Change start command back to: `npm start`
9. Deploy again

### Option 2: Railway CLI (From Your PC)
Since Railway's internal database URL doesn't work from local machine, you need to:

1. **Get the public DATABASE_URL**:
```bash
railway variables
```

2. **Set it temporarily**:
```powershell
$env:DATABASE_URL="<paste the public postgres URL here>"
```

3. **Run seed locally with Railway's database**:
```bash
cd backend
npm run seed
```

### Option 3: GitHub Actions (Automated)
I can create a GitHub Action that runs the seed on Railway automatically.

## Manual Step-by-Step

### Step 1: Ensure Code is Deployed
```bash
git status
# Should show: "Your branch is up to date with 'origin/main'"
```

✅ Already done - code is pushed!

### Step 2: SSH into Railway (if available)
Railway doesn't provide direct SSH, so use the dashboard method above.

### Step 3: Verify Seed Ran
After running, check Railway logs for:
```
🎉 SEED COMPLETED SUCCESSFULLY!
📊 Total Transactions: 13,372
💰 Brokard Final Balance: $1,985,204.35
💰 Jonod Final Balance: $2,478,005.81
```

## Troubleshooting

### Error: "Users not found"
The users must exist first. Create them via your app's registration.

### Error: "Accounts not found"  
Users need CHECKING accounts. Create via your app.

### Error: "Can't reach database"
Make sure you're running on Railway's servers, not locally.

## Verification Queries

After seeding, run these in Railway's Postgres:

```sql
-- Check balances
SELECT u.email, a.balance 
FROM "Account" a 
JOIN "User" u ON u.id = a.userId;

-- Count transactions
SELECT COUNT(*) FROM "Transaction";

-- Should show ~13,000+ transactions
```

## What I Recommend

**Use Option 1 (Railway Dashboard)** - it's the most reliable and you can see the output in real-time.

The seed script is ready and will:
- Generate 12,000-16,000 transactions
- Take 2-5 minutes to complete
- Set exact final balances
- Log all progress

Ready to execute! 🚀
