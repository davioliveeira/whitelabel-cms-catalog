# Deployment Guide - CMS Catalogo White Label

## Quick Start

This guide will help you deploy your CMS to production using Vercel (recommended).

## Prerequisites

- [ ] Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Vercel account (free tier works)
- [ ] PostgreSQL database (Supabase or Neon recommended)
- [ ] Domain name (optional, Vercel provides free subdomain)

## Step-by-Step Deployment

### 1. Prepare Database

#### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Copy connection string from Settings → Database
4. Save for later use

#### Option B: Neon

1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy connection string
4. Save for later use

### 2. Set Up Environment Variables

1. Copy `.env.production.example` to `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```

2. Update `.env.production` with your values:
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database
   
   # NextAuth
   NEXTAUTH_URL=https://admin.yourdomain.com
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   
   # Public URLs
   NEXT_PUBLIC_CATALOG_URL=https://catalog.yourdomain.com
   ```

### 3. Run Database Migrations

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### 4. Deploy to Vercel

#### Deploy Admin App

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy admin app:
   ```bash
   cd apps/admin
   vercel --prod
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `DATABASE_URL` (secret)
     - `NEXTAUTH_URL` (secret)
     - `NEXTAUTH_SECRET` (secret)
     - `NEXT_PUBLIC_CATALOG_URL` (plain)

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

#### Deploy Catalog App

1. Deploy catalog app:
   ```bash
   cd apps/catalog
   vercel --prod
   ```

2. Add environment variables:
   - `DATABASE_URL` (secret)

3. Redeploy:
   ```bash
   vercel --prod
   ```

### 5. Configure Custom Domains (Optional)

1. In Vercel Dashboard, go to each project
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update environment variables with new URLs

### 6. Create First User

```bash
# Connect to production database
export DATABASE_URL="your-production-database-url"

# Run seed script or create manually via Prisma Studio
npm run prisma:studio
```

Create a super admin user with:
- Email: your-email@domain.com
- Password: (hashed with bcrypt)
- Role: SUPER_ADMIN

### 7. Verify Deployment

Test the following:
- [ ] Admin login works
- [ ] Catalog loads correctly
- [ ] Can create products
- [ ] Can create orders
- [ ] Theme playground works
- [ ] Images upload correctly

## Environment Variables Reference

### Required for Admin App

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_URL` | Full URL of admin app | `https://admin.example.com` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_CATALOG_URL` | Full URL of catalog app | `https://catalog.example.com` |

### Required for Catalog App

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |

### Optional

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection for caching |
| `DIRECT_URL` | Direct database URL for migrations |

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx nx run admin:typecheck
npx nx run catalog:typecheck
```

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### NextAuth Configuration Error

- Verify `NEXTAUTH_URL` matches your deployed URL
- Ensure `NEXTAUTH_SECRET` is set
- Check that URL includes protocol (https://)

### Preview Not Working

- Verify `NEXT_PUBLIC_CATALOG_URL` is set correctly
- Check browser console for CORS errors
- Ensure both apps are deployed

## Performance Optimization

### Enable Caching

Add Redis for better performance:
1. Sign up for [Upstash](https://upstash.com)
2. Create Redis database
3. Add `REDIS_URL` to environment variables

### Image Optimization

Configure Next.js image domains in `next.config.js`:
```javascript
images: {
  domains: ['your-cdn.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### Database Connection Pooling

Use Prisma's connection pooling:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
- Go to project → Analytics
- View traffic, performance, and errors

### Error Tracking

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Uptime Robot**: Uptime monitoring

## Backup Strategy

### Database Backups

- **Supabase**: Automatic daily backups
- **Neon**: Point-in-time recovery
- **Manual**: Set up cron job for `pg_dump`

### Code Backups

- Keep Git repository up to date
- Tag releases: `git tag v1.0.0`
- Push to remote: `git push --tags`

## Rollback Procedure

If deployment fails:

```bash
# Vercel
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

## Cost Estimate

### Free Tier (Hobby)
- Vercel: Free (2 projects)
- Supabase: Free (500MB database)
- Total: **$0/month**

### Production Tier
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Upstash: ~$10/month
- Total: **~$55/month**

## Support

For issues:
1. Check [deployment_plan.md](./deployment_plan.md) for detailed guide
2. Review Vercel logs
3. Check database connection
4. Verify environment variables

## Next Steps

After successful deployment:
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Enable monitoring
- [ ] Set up backups
- [ ] Create documentation for team
- [ ] Plan scaling strategy

---

**Need help?** Check the full [Deployment Plan](./deployment_plan.md) for detailed instructions.
