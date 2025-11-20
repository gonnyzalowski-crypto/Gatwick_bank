# Railway Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Created root `package.json` for monorepo detection
- [x] Configured `railway.toml` with build and deploy commands
- [x] Created `nixpacks.toml` for explicit build configuration
- [x] Created `Procfile` as backup configuration
- [x] Updated backend to serve frontend static files in production
- [x] Configured helmet CSP for frontend assets
- [x] Created `.railwayignore` to exclude unnecessary files
- [x] Updated README with deployment instructions
- [x] Created comprehensive deployment guide

## 📋 Next Steps (Your Action Required)

### 1. Commit and Push to GitHub
```powershell
cd "c:\Users\sayv\Documents\Gatwick Bank\bank_deploy"
git add -A
git commit -m "fix: configure Railway deployment for monorepo"
git push origin main
```

### 2. Railway Project Setup

- [ ] Go to [Railway.app](https://railway.app)
- [ ] Create new project or select existing
- [ ] Connect your GitHub repository
- [ ] Select the `bank_deploy` folder/repo

### 3. Add Database Services

- [ ] Add PostgreSQL database
  - Click "New" → "Database" → "PostgreSQL"
  - Railway auto-sets `DATABASE_URL`
  
- [ ] Add Redis (recommended)
  - Click "New" → "Database" → "Redis"
  - Or use external service like Upstash

### 4. Configure Environment Variables

In Railway project settings, add:

- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = `[generate secure random string]`
- [ ] `REDIS_URL` = `[from Railway Redis or external]`
- [ ] `PORT` = `[Railway sets automatically]`

**Generate JWT Secret:**
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 5. Deploy

- [ ] Push changes to GitHub (triggers auto-deploy)
- [ ] Or manually trigger deploy in Railway dashboard
- [ ] Wait for build to complete (check logs)

### 6. Post-Deployment

- [ ] Run database migrations (if needed)
  ```bash
  # In Railway shell or add to build command
  npx prisma migrate deploy
  ```

- [ ] Verify deployment
  - [ ] Visit Railway URL
  - [ ] Check `/api/v1/healthz` endpoint
  - [ ] Test frontend loads correctly
  - [ ] Test API functionality

- [ ] (Optional) Configure custom domain
- [ ] (Optional) Set up monitoring/alerts

## 🔍 Verification Commands

Test your deployment:

```bash
# Health check
curl https://your-app.railway.app/api/v1/healthz

# Should return:
# {"status":"ok","service":"gatwick-bank-backend","timestamp":"..."}
```

## 🐛 Troubleshooting

If deployment fails, check:

1. **Railway Logs** - Look for specific error messages
2. **Environment Variables** - Ensure all required vars are set
3. **Database Connection** - Verify `DATABASE_URL` is correct
4. **Build Logs** - Check if frontend build succeeded
5. **Node Version** - Requires Node.js >=18.0.0

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `README.md` - Project overview and setup
- `.env.example` - Environment variables template

## ✨ What Changed

The deployment was failing because Railway couldn't detect how to build the monorepo. We fixed this by:

1. Adding root `package.json` to identify as Node.js project
2. Configuring build process in `railway.toml` and `nixpacks.toml`
3. Setting up backend to serve frontend build in production
4. Providing multiple configuration formats for Railway compatibility

Your app is now ready to deploy! 🚀
