Gatwick Bank — Deploy Copy

This folder (`bank_deploy/`) is a self-contained, Railway-ready copy of the app (backend + frontend + Prisma schema). It is intended to be used as a clean repository for deployment so you avoid large legacy assets from the main workspace.

Quick Start (local)

1. Backend
- Copy environment variables from `.env.example` into `backend/.env` and update values (Postgres, Redis, JWT secret).
- Install and seed:

  ```powershell
  cd bank_deploy\backend
  npm install
  # create a local database, or set DATABASE_URL to a managed DB
  npx prisma migrate deploy
  node prisma/seed.js
  npm run start
  ```

2. Frontend
- Configure `VITE_API_BASE_URL` in `bank_deploy/.env` or in your environment.

  ```powershell
  cd bank_deploy\frontend
  npm install
  npm run build
  npm run preview
  ```

Railway Deployment

This project is configured for Railway deployment with the following files:
- `railway.toml` - Main Railway configuration
- `nixpacks.toml` - Build configuration for Nixpacks
- `Procfile` - Process definition
- `package.json` - Root package.json for monorepo detection

Steps to deploy:
1. Push this folder to a GitHub repository
2. Import the repository in Railway
3. Add a PostgreSQL database service in Railway
4. Set the following environment variables in Railway:
   - `DATABASE_URL` - Automatically provided by Railway PostgreSQL service
   - `REDIS_URL` - Add a Redis service or use Upstash
   - `JWT_SECRET` - Generate a secure random string
   - `NODE_ENV` - Set to `production`
   - `PORT` - Railway will set this automatically
   
5. Railway will automatically:
   - Install dependencies for both backend and frontend
   - Generate Prisma client
   - Build the frontend
   - Start the backend server

Note: The frontend will be served as static files from the backend. Make sure your backend is configured to serve the frontend build.

Notes & Recommendations
- This copy intentionally excludes large legacy assets. I recommend initializing a fresh git repo inside `bank_deploy/` and pushing that instead of pushing the workspace root (which currently tracks large legacy files).

Commands to create and push a fresh repo from `bank_deploy/`:

```powershell

git init
git branch -M main
git add -A
git commit -m "chore: initial deploy copy for Railway"
# then add your remote and push
# git remote add origin https://github.com/<username>/<repo>.git
# git push -u origin main
```
