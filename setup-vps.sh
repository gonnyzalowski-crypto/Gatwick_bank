#!/bin/bash
# Rosch Capital Bank - VPS Setup Script
# Run this after extracting the tarball

set -e

echo "=== Rosch Capital Bank VPS Setup ==="

# 1. Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --omit=dev
cd ..

# 2. Generate Prisma client for Linux
echo "Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# 3. Verify frontend dist exists
if [ -d "frontend/dist" ]; then
    echo "Frontend dist found ✓"
else
    echo "ERROR: frontend/dist not found!"
    exit 1
fi

# 4. Create uploads directory if missing
mkdir -p backend/uploads
touch backend/uploads/.gitkeep

# 5. Stop existing pm2 process if running
pm2 stop rosch-backend 2>/dev/null || true
pm2 delete rosch-backend 2>/dev/null || true

# 6. Start backend with pm2
echo "Starting backend with pm2..."
pm2 start backend/src/index.js --name rosch-backend
pm2 save

echo ""
echo "=== Setup Complete ==="
echo "Test with: curl http://localhost:3000/healthz"
echo ""
