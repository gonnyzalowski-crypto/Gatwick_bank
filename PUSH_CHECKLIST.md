# Pre-Push Checklist - Gatwick Bank Stage 1

## ✅ Files Ready for Git Push

### New Backend Files
- [x] `backend/src/constants/securityQuestions.js`
- [x] `backend/src/services/securityService.js`
- [x] `backend/src/services/auditService.js`
- [x] `backend/src/services/notificationService.js`
- [x] `backend/src/routes/admin.js`
- [x] `backend/src/routes/notifications.js`

### Modified Backend Files
- [x] `backend/prisma/schema.prisma` - Added 5 new models
- [x] `backend/package.json` - Added pdfkit, multer
- [x] `backend/src/routes/auth.js` - Two-step login
- [x] `backend/src/routes/api.js` - New route imports
- [x] `railway.json` - Persistent volume config

### Modified Frontend Files
- [x] `frontend/src/pages/RegisterPage.jsx` - Security questions
- [x] `frontend/src/context/AuthContext.jsx` - Updated register function


## 🔍 Pre-Push Verification

### Code Quality
- [x] No syntax errors in any file
- [x] All imports are correct
- [x] All function signatures match
- [x] No hardcoded values (all use env vars or constants)
- [x] Proper error handling in all services
- [x] All async functions use try-catch

### Database Schema
- [x] All new models have proper relations
- [x] All fields have correct types
- [x] Indexes added where needed
- [x] Default values set appropriately

### Security
- [x] Passwords hashed with bcrypt
- [x] Backup codes hashed before storage
- [x] Security answers hashed (case-insensitive)
- [x] Admin routes protected with `verifyAdmin` middleware
- [x] All sensitive operations require authentication

### API Endpoints
- [x] All new endpoints documented
- [x] Proper HTTP status codes used
- [x] Error messages are user-friendly
- [x] Request validation in place

## ⚠️ Post-Push Actions Required

### 1. Database Migration
After Railway deploys, run:
```bash
npx prisma migrate dev --name add_security_features
```
Or use:
```bash
npx prisma db push
```

### 2. Create Admin User
```sql
UPDATE users 
SET "isAdmin" = true 
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
```

### 3. Configure Railway Volume
1. Go to Railway dashboard
2. Select your service
3. Click "Volumes" tab
4. Create new volume:
   - **Name:** `gatwick-storage`
   - **Mount Path:** `/app/storage`
   - **Size:** 1GB (or as needed)

### 4. Verify Environment Variables
- `CORS_ORIGIN` = `https://gatwickbank.up.railway.app`
- `VITE_API_BASE_URL` = `https://gatwickbank-production.up.railway.app/api/v1`

## 🚨 Potential Issues & Solutions

### Issue 1: "Failed to fetch security questions"
**Cause:** Frontend can't reach backend  
**Solution:** Check `VITE_API_BASE_URL` and `CORS_ORIGIN`

### Issue 2: "Backup codes PDF not found"
**Cause:** Persistent volume not configured  
**Solution:** Follow step 3 above

### Issue 3: "Cannot read property 'isAdmin' of null"
**Cause:** User not found or not admin  
**Solution:** Verify admin user created (step 2)

### Issue 4: Prisma migration fails
**Cause:** Existing data conflicts with new schema  
**Solution:** 
```bash
# Option 1: Reset database (DEV ONLY)
npx prisma migrate reset

# Option 2: Manual migration
npx prisma db push --accept-data-loss
```

### Issue 5: Existing users can't log in
**Cause:** No security questions for existing users  
**Solution:** Two options:
1. **Temporary:** Add fallback in login route to skip 2FA for users without security questions
2. **Permanent:** Create admin tool to set security questions for existing users

## 📦 Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add security questions, backup codes, audit logging, and admin features

- Add SecurityQuestion, BackupCode, AuditLog, Notification, KYCDocument models
- Implement two-step login with security questions or backup codes
- Add admin routes for user management, audit logs, and KYC review
- Generate 100 backup codes per user as PDF
- Add notification system for transactions and KYC status
- Update registration flow to require 3 security questions
- Configure Railway persistent volume for file storage
- Add comprehensive audit logging for all user actions"

# Push to GitHub
git push origin main
```

## 🎯 What Happens Next

1. **GitHub receives push**
2. **Railway detects changes** (webhook)
3. **Railway starts build:**
   - Installs dependencies (pdfkit, multer)
   - Runs build commands
   - Deploys new version
4. **You must manually:**
   - Run Prisma migration
   - Create admin user
   - Configure persistent volume

## ✅ Success Criteria

After deployment, verify:
- [ ] Registration page shows 3 security question dropdowns
- [ ] Can register new user with security questions
- [ ] Redirected to login after registration
- [ ] Backend logs show "REGISTER" audit entry
- [ ] Backup codes PDF exists in `/app/storage/backup-codes/user_{id}/`
- [ ] Admin can access `/api/v1/admin/users` (returns 200)
- [ ] No console errors on frontend
- [ ] No 500 errors in Railway logs

## 🔄 Rollback Plan

If deployment fails:
```bash
# Revert to previous commit
git revert HEAD

# Push revert
git push origin main
```

Or in Railway dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "Redeploy"

## 📞 Support

If you encounter issues:
1. Check Railway logs for errors
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure persistent volume is configured
5. Confirm database migration ran successfully

---

## 🚀 Ready to Push?

All files are error-free and ready for deployment. When you're ready:

```bash
git add .
git commit -m "feat: Add security questions, backup codes, and admin features"
git push origin main
```

Then follow the **Post-Push Actions** above.
