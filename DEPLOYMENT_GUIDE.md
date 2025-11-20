# Railway Deployment Guide

## Problem Fixed

Railway's Railpack was failing with the error:
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

This happened because:
1. The monorepo structure (backend/ and frontend/ folders) wasn't properly configured
2. Missing root-level configuration files for Railway to detect the project type
3. No build instructions for the monorepo setup

## Solution Implemented

### Files Created/Modified

1. **`package.json`** (root) - NEW
   - Defines the project as a Node.js monorepo
   - Provides workspace configuration
   - Helps Railway identify this as a Node.js project

2. **`railway.toml`** - UPDATED
   - Configured build command to install dependencies and build both backend and frontend
   - Set start command to run the backend server
   - Added restart policy configuration

3. **`nixpacks.toml`** - NEW
   - Explicit Nixpacks configuration for Railway
   - Defines setup, install, build, and start phases
   - Ensures PostgreSQL and Node.js 20 are available

4. **`Procfile`** - NEW
   - Defines the web process for Railway
   - Backup configuration method

5. **`railway.json`** - NEW
   - Alternative Railway configuration format
   - Provides additional deployment settings

6. **`backend/src/index.js`** - UPDATED
   - Added static file serving for production
   - Serves frontend build from `frontend/dist`
   - SPA routing support (serves index.html for all non-API routes)
   - Configured helmet CSP to allow frontend assets

7. **`README.md`** - UPDATED
   - Added comprehensive Railway deployment instructions
   - Listed required environment variables

## Deployment Steps

### 1. Commit and Push Changes

```powershell
cd "c:\Users\sayv\Documents\Gatwick Bank\bank_deploy"
git add -A
git commit -m "fix: configure Railway deployment for monorepo"
git push origin main
```

### 2. Railway Configuration

In your Railway project:

1. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

2. **Add Redis** (Optional but recommended)
   - Click "New" → "Database" → "Redis"
   - Or use external Redis (Upstash)

3. **Set Environment Variables**
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a secure random string)
   - `REDIS_URL` = (if using external Redis)
   - `PORT` = (Railway sets this automatically, but you can override)

4. **Redeploy**
   - Railway will automatically redeploy after you push
   - Or manually trigger a redeploy in the Railway dashboard

### 3. Verify Deployment

After deployment:
- Check the Railway logs for any errors
- Visit your Railway URL to see the frontend
- Test API endpoints at `https://your-app.railway.app/api/v1/healthz`

## Build Process

Railway will now:
1. ✅ Detect Node.js project from root `package.json`
2. ✅ Install backend dependencies (`cd backend && npm ci`)
3. ✅ Generate Prisma client (`npx prisma generate`)
4. ✅ Install frontend dependencies (`cd frontend && npm ci`)
5. ✅ Build frontend (`npm run build`)
6. ✅ Start backend server (`cd backend && npm start`)
7. ✅ Backend serves frontend static files in production

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-here` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | Auto-set by Railway |

## Troubleshooting

### Build Fails
- Check Railway logs for specific error messages
- Ensure all dependencies are in `package.json` files
- Verify Node.js version compatibility (requires >=18.0.0)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Run Prisma migrations: Add a deploy script or run manually
- Check PostgreSQL service is running in Railway

### Frontend Not Loading
- Verify frontend build completed successfully
- Check that `NODE_ENV=production` is set
- Ensure backend is serving static files from `frontend/dist`

### API Endpoints Not Working
- Check CORS configuration in backend
- Verify API routes are properly defined
- Test with `/api/v1/healthz` endpoint first

## Next Steps

1. **Database Migrations**: You may need to run Prisma migrations on first deploy
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Data**: If you need initial data
   ```bash
   npm run db:seed
   ```

3. **Custom Domain**: Configure a custom domain in Railway settings

4. **Monitoring**: Set up Railway's monitoring and alerts

## Notes

- The frontend is built once during deployment and served as static files
- The backend serves both API endpoints and the frontend SPA
- All routes except `/api/*` will serve the frontend `index.html` for SPA routing
- Railway automatically handles HTTPS and provides a `.railway.app` domain
