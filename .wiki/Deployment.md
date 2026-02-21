# Deployment Guide

This guide covers deploying **ɳApp** to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [Self-Hosted](#self-hosted)
- [Platform-Specific Notes](#platform-specific-notes)

## Prerequisites

Before deploying, ensure you have:

1. ✅ A backend instance running (ɳSelf, Supabase, or Nhost)
2. ✅ Environment variables configured
3. ✅ Application builds successfully (`npm run build`)
4. ✅ Tests passing (`npm run test:run`)

## Environment Variables

### Required Variables

```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_PROVIDER=nself  # or supabase, nhost, bolt
NEXT_PUBLIC_ENVIRONMENT=production  # or staging, local

# ɳSelf Configuration (if using nself)
NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=wss://api.yourdomain.com/v1/graphql
NEXT_PUBLIC_NSELF_AUTH_URL=https://auth.yourdomain.com
NEXT_PUBLIC_NSELF_STORAGE_URL=https://storage.yourdomain.com
NEXT_PUBLIC_NSELF_REALTIME_URL=wss://realtime.yourdomain.com
NEXT_PUBLIC_NSELF_FUNCTIONS_URL=https://functions.yourdomain.com

# Supabase Configuration (if using supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Nhost Configuration (if using nhost)
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=us-west-2
```

### Optional Variables

```bash
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=https://yourapp.com
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false
```

---

## Deployment Platforms

### Vercel

Vercel is the recommended platform for Next.js applications.

#### Quick Deploy

1. **Connect Repository**

   ```bash
   vercel
   ```

2. **Configure Environment Variables**
   - Go to your project settings on Vercel
   - Add all required environment variables
   - Separate variables for Production, Preview, and Development

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### vercel.json Configuration

Create a `vercel.json` file:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_BACKEND_PROVIDER": "nself",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  }
}
```

#### Custom Domains

1. Add domain in Vercel dashboard
2. Update DNS records
3. SSL certificates are automatic

---

### Netlify

Deploy to Netlify with automatic builds.

#### Quick Deploy

1. **Connect Repository**
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository

2. **Build Settings**

   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required variables

#### netlify.toml Configuration

Already included in the project:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

---

### Docker

Run ɳApp in a Docker container.

#### Dockerfile

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_BACKEND_PROVIDER
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_NSELF_GRAPHQL_URL
ARG NEXT_PUBLIC_NSELF_AUTH_URL
ARG NEXT_PUBLIC_NSELF_STORAGE_URL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_BACKEND_PROVIDER: nself
        NEXT_PUBLIC_ENVIRONMENT: production
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_BACKEND_PROVIDER=nself
      - NEXT_PUBLIC_ENVIRONMENT=production
      - NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
      - NEXT_PUBLIC_NSELF_AUTH_URL=https://auth.yourdomain.com
      - NEXT_PUBLIC_NSELF_STORAGE_URL=https://storage.yourdomain.com
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t nself-demo .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_PROVIDER=nself \
  -e NEXT_PUBLIC_ENVIRONMENT=production \
  nself-demo

# Or use docker-compose
docker-compose up -d
```

---

### Self-Hosted

Deploy on your own server with PM2 or systemd.

#### Using PM2

1. **Install PM2**

   ```bash
   npm install -g pm2
   ```

2. **Build Application**

   ```bash
   npm run build
   ```

3. **Start with PM2**

   ```bash
   pm2 start npm --name "nself-demo" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Environment**

   ```bash
   # Create .env.production
   cat > .env.production << EOF
   NEXT_PUBLIC_BACKEND_PROVIDER=nself
   NEXT_PUBLIC_ENVIRONMENT=production
   NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
   EOF

   pm2 restart nself-demo --update-env
   ```

#### Using systemd

1. **Create Service File**

   ```bash
   sudo nano /etc/systemd/system/nself-demo.service
   ```

2. **Service Configuration**

   ```ini
   [Unit]
   Description=ɳApp
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/nself-demo
   Environment="NODE_ENV=production"
   Environment="NEXT_PUBLIC_BACKEND_PROVIDER=nself"
   Environment="NEXT_PUBLIC_ENVIRONMENT=production"
   ExecStart=/usr/bin/npm start
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and Start**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable nself-demo
   sudo systemctl start nself-demo
   sudo systemctl status nself-demo
   ```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Platform-Specific Notes

### Vercel

- ✅ **Best for**: Quick deployments, automatic previews
- ✅ **Pros**: Zero config, automatic SSL, global CDN
- ⚠️ **Limits**: Serverless functions (10s timeout), 4096MB memory

### Netlify

- ✅ **Best for**: JAMstack sites, form handling
- ✅ **Pros**: Easy setup, branch deploys, split testing
- ⚠️ **Limits**: Build minutes (300/month free)

### Docker

- ✅ **Best for**: Consistent environments, complex setups
- ✅ **Pros**: Full control, reproducible, portable
- ⚠️ **Limits**: Requires container knowledge

### Self-Hosted

- ✅ **Best for**: Maximum control, compliance requirements
- ✅ **Pros**: No vendor lock-in, unlimited resources
- ⚠️ **Limits**: Requires server management

---

## Post-Deployment

### Health Check

Visit your deployment URL + `/api/health` to verify:

```bash
curl https://yourapp.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-02-08T17:00:00.000Z",
  "environment": "production",
  "backend": "nself",
  "version": "0.1.0"
}
```

### Monitoring

Set up monitoring for:

- Application uptime
- API response times
- Error rates
- Backend connectivity

### SSL/HTTPS

All recommended platforms provide automatic SSL. For self-hosted:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourapp.com
```

---

## Troubleshooting

### Build Failures

**Error: Cannot find module**

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

**Error: Environment variable not defined**

- Ensure all required env vars are set
- Check variable names (must start with `NEXT_PUBLIC_`)

### Runtime Issues

**Backend connection fails**

- Verify backend URLs are correct
- Check CORS settings on backend
- Ensure network connectivity

**Blank page / hydration errors**

- Check browser console for errors
- Verify SSR/CSR compatibility
- Review server logs

---

## Rollback

### Vercel

```bash
vercel rollback
```

### Netlify

```bash
netlify rollback
```

### Docker

```bash
docker tag nself-demo:latest nself-demo:backup
docker pull nself-demo:previous
docker-compose up -d
```

---

## Next Steps

- 📊 Set up analytics (Google Analytics, Plausible)
- 🔍 Configure error tracking (Sentry)
- 📈 Add performance monitoring (Vercel Analytics)
- 🔐 Review security settings
- 💾 Set up database backups
- 🚀 Configure CDN caching

---

**Need Help?**

- [GitHub Issues](https://github.com/nself-org/demo/issues)
- [Documentation](./README.md)
- [ɳSelf Docs](https://github.com/nself-org/cli)
