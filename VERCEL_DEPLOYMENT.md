# Vercel Deployment Guide - CMS Catalogo White Label

## Overview

This guide covers deploying your Nx monorepo with Next.js 15 applications to Vercel with Neon Postgres database integration.

## Prerequisites

1. Neon database configured (see NEON_SETUP.md)
2. Vercel account
3. GitHub repository connected to Vercel
4. Build fixes applied (Prisma Client generation)

## Build Configuration Fixed

### Issue Identified
The Vercel build was failing with exit code 130 because Prisma Client was not being generated before building libraries that depend on `@prisma/client`.

### Solution Applied
Updated build commands to generate Prisma Client before building applications.

## Configuration Files

### 1. Root package.json
```json
{
  "scripts": {
    "build": "npm run prisma:generate && nx run-many --target=build --projects=admin,catalog --prod",
    "prisma:generate": "prisma generate --schema=./libs/database/prisma/schema.prisma"
  }
}
```

### 2. Root vercel.json
```json
{
  "installCommand": "npm ci --legacy-peer-deps",
  "buildCommand": "npx prisma generate --schema=./libs/database/prisma/schema.prisma && npm run build"
}
```

### 3. apps/admin/vercel.json
```json
{
  "buildCommand": "cd ../.. && npx prisma generate --schema=libs/database/prisma/schema.prisma && npx nx build admin --prod",
  "outputDirectory": "../../dist/apps/admin/.next",
  "framework": "nextjs",
  "installCommand": "cd ../.. && npm install --legacy-peer-deps",
  "devCommand": "cd ../.. && npx nx serve admin",
  "regions": ["iad1"]
}
```

### 4. apps/catalog/vercel.json
```json
{
  "buildCommand": "cd ../.. && npx prisma generate --schema=libs/database/prisma/schema.prisma && npx nx build catalog --prod",
  "outputDirectory": "../../dist/apps/catalog/.next",
  "framework": "nextjs",
  "devCommand": "cd ../.. && npx nx serve catalog",
  "regions": ["iad1"]
}
```

## Environment Variables Setup

### Required Environment Variables

#### For Both Admin and Catalog Apps

1. **DATABASE_URL** (Neon Postgres)
   ```
   postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-super-wave-ai3e7cwp-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

2. **NEXTAUTH_URL**
   - Admin: `https://your-admin-domain.vercel.app`
   - Catalog: `https://your-catalog-domain.vercel.app`

3. **NEXTAUTH_SECRET**
   ```
   x/IQr2oVeP8Tznkj1zreo+GJy1cC2JWCXIyGQe+B5gs=
   ```
   (Generate a new one for production: `openssl rand -base64 32`)

### Setting Environment Variables via Vercel Dashboard

1. Go to your Vercel project
2. Click on "Settings" → "Environment Variables"
3. Add each variable for the appropriate environment (Production, Preview, Development)

### Setting Environment Variables via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
cd /Users/davioliveeira/py/cms-v-antigravity
vercel link

# Set environment variables for admin app
cd apps/admin
vercel env add DATABASE_URL production
# Paste: postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-super-wave-ai3e7cwp-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

vercel env add NEXTAUTH_SECRET production
# Paste your secret

vercel env add NEXTAUTH_URL production
# Paste your admin URL

# Repeat for catalog app
cd ../catalog
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

## Deployment Steps

### Option 1: Deploy via Git Push (Recommended)

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "fix: add Prisma Client generation to build process"
   git push origin main
   ```

2. **Vercel will automatically deploy** when you push to your connected branch

3. **Monitor deployment:**
   - Go to Vercel dashboard
   - Click on your project
   - View deployment logs

### Option 2: Deploy via Vercel CLI

```bash
# From project root
vercel --prod

# Or deploy specific app
cd apps/admin
vercel --prod

cd ../catalog
vercel --prod
```

## Post-Deployment Setup

### 1. Run Database Migrations

After first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy --schema=./libs/database/prisma/schema.prisma
```

Or set up automatic migrations in Vercel build:

Update `vercel.json` buildCommand:
```json
{
  "buildCommand": "npx prisma generate --schema=./libs/database/prisma/schema.prisma && npx prisma migrate deploy --schema=./libs/database/prisma/schema.prisma && npm run build"
}
```

### 2. Create First Admin User

Use Prisma Studio or a migration script:

```bash
# Option 1: Via Prisma Studio (local)
npm run prisma:studio

# Option 2: Via SQL in Neon Console
# Go to https://console.neon.tech
# Run SQL Editor with:
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Admin',
  'admin@example.com',
  '$2a$12$hashedpassword', -- Use bcrypt to hash password
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

### 3. Verify Deployment

1. **Check health endpoints:**
   - Admin: `https://your-admin.vercel.app/api/health`
   - Catalog: `https://your-catalog.vercel.app/api/health`

2. **Test database connection:**
   - Access any page that queries the database
   - Check Vercel logs for errors

3. **Monitor Neon Console:**
   - Go to https://console.neon.tech
   - Check "Monitoring" tab for connection activity

## Troubleshooting

### Build Fails with "Prisma Client not generated"

**Solution:** Ensure `prisma generate` runs before build

```json
{
  "buildCommand": "npx prisma generate --schema=libs/database/prisma/schema.prisma && npm run build"
}
```

### Build Times Out (Exit Code 130)

**Causes:**
1. Build taking too long (Vercel limit: 45 min for Hobby, varies by plan)
2. Memory limit exceeded
3. Dependencies installation issues

**Solutions:**
1. Enable Nx caching in Vercel:
   ```json
   {
     "buildCommand": "nx run-many --target=build --projects=admin,catalog --prod --skip-nx-cache=false"
   }
   ```

2. Use Vercel's remote caching:
   ```bash
   # Install Nx Cloud (optional)
   npx nx connect-to-nx-cloud
   ```

3. Split deployments (deploy admin and catalog separately)

### Database Connection Fails

**Symptoms:**
- `Connection timeout` errors
- `SSL certificate verification failed`
- `remaining connection slots reserved`

**Solutions:**

1. **Use pooled connection:**
   ```
   postgresql://...@...-pooler.c-4.us-east-1.aws.neon.tech/...
   ```
   (Note the `-pooler` suffix)

2. **Verify SSL mode:**
   ```
   DATABASE_URL="postgresql://...?sslmode=require"
   ```

3. **Check Vercel region matches Neon:**
   - Neon: US East 1 (`c-4.us-east-1`)
   - Vercel: `iad1` (already configured in vercel.json)

### Environment Variables Not Loading

**Symptoms:**
- `DATABASE_URL is undefined` errors
- `process.env.DATABASE_URL` returns undefined

**Solutions:**

1. **Verify variables are set for correct environment:**
   - Production
   - Preview
   - Development

2. **Redeploy after adding variables:**
   ```bash
   vercel --prod --force
   ```

3. **Check variable names match exactly:**
   - Case-sensitive
   - No extra spaces
   - Correct spelling

### "Module not found" Errors

**Symptoms:**
- `Cannot find module '@prisma/client'`
- `Cannot find module 'shared'`

**Solutions:**

1. **Ensure all dependencies are in root package.json:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Check Nx build order:**
   - Libraries must build before apps
   - Check `nx.json` targetDefaults

3. **Verify dist/ folder is not in .gitignore:**
   - Nx builds to dist/
   - Vercel needs these files

## Optimization Tips

### 1. Enable Vercel Edge Caching

Add to `next.config.js`:

```javascript
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Cache static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 2. Use Vercel Analytics

Enable in Vercel dashboard:
- Settings → Analytics
- Install `@vercel/analytics` package

### 3. Monitor Build Performance

Use Nx build analyzer:

```bash
# Generate build report
npx nx graph

# View build statistics
npx nx run-many --target=build --graph
```

### 4. Optimize Prisma Client Size

Add to `libs/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/client"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

## Monitoring & Maintenance

### 1. Set Up Alerts

Vercel Dashboard → Integrations → Slack/Email notifications for:
- Deployment failures
- Build errors
- Performance issues

### 2. Monitor Neon Database

Neon Console (https://console.neon.tech):
- Query performance
- Connection pool usage
- Storage size
- Error logs

### 3. Regular Maintenance Tasks

Weekly:
- Review Vercel deployment logs
- Check Neon query performance
- Monitor error rates

Monthly:
- Review and optimize slow queries
- Check database size and growth
- Update dependencies

## Cost Optimization

### Vercel Costs
- **Hobby Plan:** Free (limited bandwidth/build minutes)
- **Pro Plan:** $20/month per user
- **Enterprise:** Custom pricing

### Neon Costs
- **Free Tier:** 512 MB storage, 1 GB data transfer
- **Pro Plan:** $19/month (10 GB storage, unlimited transfer)
- **Custom:** Based on usage

### Tips to Reduce Costs:
1. Use Nx caching to reduce build times
2. Optimize images with Next.js Image component
3. Use Neon branching for development (avoid production costs)
4. Monitor and delete unused database branches

## Security Checklist

- [ ] DATABASE_URL uses pooled connection
- [ ] SSL mode is set to `require`
- [ ] NEXTAUTH_SECRET is unique and secure (not the example value)
- [ ] Environment variables are set to Production only (not exposed in Preview)
- [ ] Admin dashboard is protected with authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled on API routes
- [ ] Database backups are enabled in Neon

## Next Steps After Deployment

1. **Set up custom domain:**
   - Vercel Settings → Domains
   - Add your custom domain
   - Update NEXTAUTH_URL

2. **Enable HTTPS:**
   - Automatic with Vercel
   - Verify SSL certificate

3. **Set up monitoring:**
   - Vercel Analytics
   - Sentry for error tracking
   - Custom logging

4. **Create admin user:**
   - Use migration or SQL script
   - Test login functionality

5. **Test core functionality:**
   - User authentication
   - Product catalog
   - Order management
   - Analytics tracking

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Nx Docs:** https://nx.dev/getting-started/intro
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**Deployment Ready!** 🚀

Your configuration is now optimized for Vercel deployment with Neon Postgres. Follow the deployment steps above to go live.
