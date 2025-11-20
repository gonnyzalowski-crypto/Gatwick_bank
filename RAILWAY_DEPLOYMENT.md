# Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Changes
- [x] Added `/api/v1/payments/deposit` endpoint
- [x] Added `/api/v1/payments/withdrawal` endpoint
- [x] Added `/api/v1/payments/international-transfer` endpoint
- [x] Added service functions for deposit, withdrawal, international transfer
- [x] All existing routes maintained (/transfer, /p2p, /bill, /history, /stats)

### Frontend Changes
- [x] Removed mock data file (`mockData.js`)
- [x] Created new pages:
  - DepositPage (`/payments/deposit`)
  - WithdrawalPage (`/payments/withdrawal`)
  - DomesticTransferPage (`/transfers/domestic`)
  - InternationalTransferPage (`/transfers/international`)
  - TransactionHistoryPage (renamed from StatementsPage)
- [x] Updated navigation with collapsible sub-menus
- [x] Added Market Rates card with modal
- [x] Enhanced dashboard with charts (grouped bars, line, donut, area)
- [x] Clean 10/10 professional UI

### Routes Added
```
Frontend Routes:
- /payments/deposit
- /payments/withdrawal
- /transfers/domestic
- /transfers/international
- /transaction-history (renamed from /statements)

Backend API Endpoints:
- POST /api/v1/payments/deposit
- POST /api/v1/payments/withdrawal
- POST /api/v1/payments/international-transfer
- POST /api/v1/payments/transfer (existing)
- POST /api/v1/payments/p2p (existing)
- POST /api/v1/payments/bill (existing)
- GET /api/v1/payments/history (existing)
- GET /api/v1/payments/stats/overview (existing)
```

---

## 🚀 Deployment Steps

### 1. Environment Variables

Ensure these are set in Railway:

**Backend:**
```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3000
```

**Frontend:**
```
VITE_API_URL=https://your-backend.railway.app/api/v1
NODE_ENV=production
```

### 2. Database Migration

Before deploying, run migrations:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Build Commands

**Backend (Railway):**
```
Build Command: npm install && npx prisma generate
Start Command: npm start
```

**Frontend (Railway):**
```
Build Command: npm install && npm run build
Start Command: npm run preview
```

### 4. Deploy Order

1. **Deploy Backend First**
   - Push backend changes
   - Wait for deployment
   - Test API endpoints
   - Get backend URL

2. **Update Frontend ENV**
   - Set `VITE_API_URL` to backend URL
   - Push frontend changes
   - Deploy frontend

### 5. Post-Deployment Testing

Test these endpoints:
```bash
# Health check
curl https://your-backend.railway.app/health

# Login
curl -X POST https://your-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-user","password":"test"}'

# Get dashboard (with token)
curl https://your-backend.railway.app/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing Checklist

### Authentication
- [ ] Login works
- [ ] Register works
- [ ] Token persists
- [ ] Logout works

### Navigation
- [ ] All sidebar links work
- [ ] Collapsible menus expand/collapse
- [ ] Sub-pages load correctly
- [ ] Active states highlight correctly

### Dashboard
- [ ] Metric cards display data
- [ ] Charts render correctly
- [ ] Market rates card works
- [ ] Market rates modal opens
- [ ] Recent activity shows transactions

### Payments
- [ ] Deposit page works
- [ ] Withdrawal page works
- [ ] Domestic transfer works
- [ ] International transfer works
- [ ] Form validation works
- [ ] Success messages display
- [ ] Redirects to transaction history

### Accounts & Cards
- [ ] Accounts page loads
- [ ] Cards page loads
- [ ] Create card works
- [ ] Account details display

### Transaction History
- [ ] Page loads (renamed from Statements)
- [ ] Transactions display
- [ ] Pagination works
- [ ] Filters work

### Settings
- [ ] Settings page loads
- [ ] Password change works
- [ ] Preferences save

---

## 🐛 Common Issues & Fixes

### Issue: CORS Errors
**Fix:** Ensure backend has CORS configured:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### Issue: 404 on Routes
**Fix:** Frontend needs proper routing config:
```javascript
// vite.config.js
export default {
  preview: {
    port: 5173,
    strictPort: true,
  }
}
```

### Issue: Database Connection
**Fix:** Check `DATABASE_URL` format:
```
postgresql://user:password@host:port/database?schema=public
```

### Issue: Build Fails
**Fix:** Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 API Endpoint Summary

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Accounts
- `GET /api/v1/accounts` - Get user accounts
- `POST /api/v1/accounts` - Create account

### Cards
- `GET /api/v1/cards` - Get user cards
- `POST /api/v1/cards` - Create card

### Payments (NEW & EXISTING)
- `POST /api/v1/payments/deposit` ⭐ NEW
- `POST /api/v1/payments/withdrawal` ⭐ NEW
- `POST /api/v1/payments/international-transfer` ⭐ NEW
- `POST /api/v1/payments/transfer` - Domestic transfer
- `POST /api/v1/payments/p2p` - Peer-to-peer payment
- `POST /api/v1/payments/bill` - Bill payment
- `GET /api/v1/payments/history` - Payment history
- `GET /api/v1/payments/stats/overview` - Payment stats

### Transactions
- `GET /api/v1/transactions` - Get transactions

### KYC
- `GET /api/v1/kyc/status` - Get KYC status
- `POST /api/v1/kyc/upload` - Upload KYC documents

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ Authentication flow works
- ✅ All new routes are accessible
- ✅ Payments can be created
- ✅ Charts display correctly
- ✅ Market rates modal works
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Fast load times (<3s)

---

## 📝 Notes

- Mock data has been removed - all data comes from backend
- Market rates data is currently static (can integrate real API later)
- Charts use sample data (can connect to real transaction data)
- International transfers are marked as "pending" status
- All new pages follow the 10/10 design system

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Backend Logs: Check Railway backend service logs
- Frontend Logs: Check Railway frontend service logs
- Database: Check Railway PostgreSQL service

---

## 🚨 Rollback Plan

If deployment fails:
1. Revert to previous Railway deployment
2. Check logs for errors
3. Fix issues locally
4. Test thoroughly
5. Redeploy

---

**Last Updated:** November 18, 2025
**Status:** Ready for deployment ✅
