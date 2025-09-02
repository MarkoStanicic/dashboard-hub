# Simple Dashboard Hub Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build environment variables (correct production values)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL="https://igocndtvggqhjlpqvzfk.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODQ3NjMsImV4cCI6MjA2OTM2MDc2M30.hLzpbQQHA51DBqXrXbNx_LfxB3tMLrvpuEr0mvsukag"
ENV SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NDc2MywiZXhwIjoyMDY5MzYwNzYzfQ.ZPYIXJ2xBezZ2t6vH39Y66n3o10K1n3WIEDYTfSvAc8"
ENV NEXT_PUBLIC_APP_URL="https://dashboard.brookastudio.com"

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
