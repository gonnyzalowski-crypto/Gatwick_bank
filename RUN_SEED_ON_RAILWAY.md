# How to Run Seed Script on Railway

## Option 1: Via Railway Dashboard (RECOMMENDED)

1. Go to Railway Dashboard: https://railway.app/
2. Select your project: **Gatwick_bank**
3. Click on the **backend** service
4. Go to **Settings** tab
5. Scroll to **Deploy** section
6. Click **Deploy** button
7. Railway will automatically run the seed script during deployment

## Option 2: Via Railway CLI

```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run seed command
railway run npm run seed
```

## Option 3: Manual Trigger via Environment Variable

1. Go to Railway Dashboard
2. Select backend service
3. Go to **Variables** tab
4. Add a new variable: `FORCE_SEED=true`
5. Redeploy the service
6. Remove the variable after deployment

## What the Seed Script Will Do

✅ Find existing users (jonod, brokard)
✅ Update jonod's password to `Password123!`
✅ Update jonod's status to `ACTIVE`
✅ Ensure security questions exist for both users
✅ Create transactions if needed

## Expected Output

```
🌱 Starting database seed...
👥 Creating/updating users...
  ✅ Found Brokard: xxx
  ✅ Found Jonod: xxx
  ✅ Updated Jonod to ADMIN with correct password

📋 Ensuring security questions...
  ✅ Security questions set for Brokard
  ✅ Security questions set for Jonod

🎉 SEED COMPLETED SUCCESSFULLY!
```

## After Seeding

Test login with:
- **Email**: jonod@gmail.com
- **Password**: Password123!
- **Security Answers**: fluffy, london, smith

OR

- **Email**: brokardwilliams@gmail.com
- **Password**: Password123!
- **Security Answers**: fluffy, london, smith
