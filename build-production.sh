#!/bin/bash

# Production build script for Dashboard Hub
echo "🚀 Building Dashboard Hub for production..."

# Build with environment variables
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://igocndtvggqhjlpqvzfk.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODQ3NjMsImV4cCI6MjA2OTM2MDc2M30.hLzpbQQHA51DBqXrXbNx_LfxB3tMLrvpuEr0mvsukag \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NDc2MywiZXhwIjoyMDY5MzYwNzYzfQ.ZPYIXJ2xBezZ2t6vH39Y66n3o10K1n3WIEDYTfSvAc8 \
  --build-arg NEXT_PUBLIC_APP_URL=https://dashboard.brookastudio.com \
  -t dashboard-hub:production .

echo "✅ Build complete!"
echo "🚀 Deploy with: docker run -d --name dashboard-hub -p 3000:3000 dashboard-hub:production"
