# Make Gonny Zalowski Admin

## SQL Command (Run in Railway PostgreSQL Console)

```sql
-- Make gonnyzalowski@gmail.com an admin
UPDATE users 
SET "isAdmin" = true 
WHERE email = 'gonnyzalowski@gmail.com';

-- Verify the change
SELECT id, email, "firstName", "lastName", "isAdmin", "accountStatus", "kycStatus"
FROM users 
WHERE email = 'gonnyzalowski@gmail.com';
```

## Steps to Execute:

### Option 1: Railway Dashboard
1. Go to Railway Dashboard
2. Click on your PostgreSQL service
3. Click "Query" tab
4. Paste the SQL command above
5. Click "Run Query"
6. Verify `isAdmin` is now `true`

### Option 2: Railway CLI
```bash
# Connect to database
railway connect postgres

# Run the command
UPDATE users SET "isAdmin" = true WHERE email = 'gonnyzalowski@gmail.com';

# Verify
SELECT email, "isAdmin" FROM users WHERE email = 'gonnyzalowski@gmail.com';
```

### Option 3: Prisma Studio (Local)
```bash
# Open Prisma Studio
npx prisma studio

# Navigate to users table
# Find gonnyzalowski@gmail.com
# Edit isAdmin field to true
# Save
```

## After Making Admin:

1. **Logout** from current session
2. **Login** again with gonnyzalowski@gmail.com
3. You'll be redirected to `/mybanker` (admin dashboard)
4. You'll have access to:
   - User management
   - KYC approvals
   - Transaction monitoring
   - System settings

## Admin Dashboard URL:
```
https://your-frontend-url.railway.app/mybanker
```

## Verify Admin Access:
- After login, check if you're redirected to `/mybanker`
- You should see admin navigation menu
- You should have access to all admin features

---

**Note:** The email must match exactly (case-sensitive). If the user doesn't exist yet, register first, then run the SQL command.
