# Neon Database Setup Guide - CMS Catalogo White Label

## Current Status

Your Neon database is now successfully configured and ready for production.

## Database Information

- **Provider**: Neon Serverless PostgreSQL
- **Region**: US East 1 (AWS)
- **Database Name**: neondb
- **Schema**: public
- **Connection Type**: Pooled (recommended for serverless)

## Connection Strings

### Current Configuration (.env.local)

```bash
# Pooled connection (for application queries)
DATABASE_URL="postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### Connection String Breakdown

- **Pooled**: Uses `-pooler` suffix - ideal for serverless apps (high concurrency)
- **Unpooled**: Direct connection - required for migrations and schema changes
- **SSL**: `sslmode=require` ensures encrypted connections
- **Channel Binding**: `channel_binding=require` adds extra security layer

## Migration Status

✅ **Migration Applied Successfully**

- Migration: `20260205035531_add_order_module`
- Status: Applied to production database
- Tables Created: 10 tables
- Enums Created: 3 enums (Role, EventType, OrderStatus)

### Tables Created

1. **Tenant** - Store/tenant configuration
2. **User** - User authentication and roles
3. **Product** - Product catalog
4. **AnalyticsEvent** - Product view tracking
5. **Order** - Order management
6. **OrderItem** - Order line items
7. **Account** - NextAuth OAuth accounts
8. **Session** - NextAuth sessions
9. **VerificationToken** - Email verification

## Prisma Configuration

### Current Schema Location

```
/Users/davioliveeira/py/cms-v-antigravity/libs/database/prisma/schema.prisma
```

### Updated Commands

Add schema path to your package.json scripts:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate --schema=./libs/database/prisma/schema.prisma",
    "prisma:migrate": "prisma migrate deploy --schema=./libs/database/prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=./libs/database/prisma/schema.prisma",
    "prisma:migrate:dev": "prisma migrate dev --schema=./libs/database/prisma/schema.prisma"
  }
}
```

## Vercel Deployment Configuration

### Environment Variables for Vercel

When deploying to Vercel, add these environment variables:

```bash
# For both admin and catalog apps
DATABASE_URL=postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Optional: For migrations (if running in CI/CD)
DIRECT_URL=postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### Setting Environment Variables via Vercel CLI

```bash
# Navigate to your project root
cd /Users/davioliveeira/py/cms-v-antigravity

# Set for admin app
vercel env add DATABASE_URL production
# Paste: postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Set for catalog app
cd apps/catalog
vercel env add DATABASE_URL production
# Paste the same value
```

## Neon-Specific Optimizations

### 1. Connection Pooling

Neon automatically provides connection pooling through the `-pooler` endpoint. This is ideal for serverless environments like Vercel.

**Benefits:**
- Handles thousands of concurrent connections
- Reduces connection overhead
- Prevents connection limit exhaustion

**Usage:**
```typescript
// libs/database/src/lib/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Query Optimization

Neon performs best with:
- **Indexed queries**: Ensure foreign keys are indexed (already done in schema)
- **Selective queries**: Use `select` to fetch only needed fields
- **Batch operations**: Use `createMany`, `updateMany` when possible

Example:
```typescript
// Good: Only fetch needed fields
const products = await prisma.product.findMany({
  where: { storeId: 'store-id' },
  select: {
    id: true,
    name: true,
    salePrice: true,
  },
});

// Better: Use indexes
const products = await prisma.product.findMany({
  where: { 
    storeId: 'store-id',
    isAvailable: true  // Uses compound index
  },
});
```

### 3. Neon Branches (Development Workflow)

Neon supports database branching for isolated development:

```bash
# Install Neon CLI
npm install -g neonctl

# Login to Neon
neonctl auth

# Create a branch for development
neonctl branches create --name dev-branch

# Get connection string for branch
neonctl connection-string dev-branch
```

**Workflow:**
1. Create branch for feature development
2. Run migrations on branch
3. Test changes
4. Merge to main branch
5. Deploy migrations to production

### 4. Connection Best Practices

For serverless functions:

```typescript
// Don't do this (creates new connection each time)
export default async function handler(req, res) {
  const prisma = new PrismaClient();
  const data = await prisma.product.findMany();
  await prisma.$disconnect();
  return res.json(data);
}

// Do this (reuse connection)
import { prisma } from '@/lib/database';

export default async function handler(req, res) {
  const data = await prisma.product.findMany();
  return res.json(data);
}
```

## Monitoring & Performance

### Neon Console Features

Access your Neon console at: https://console.neon.tech

Features:
- **Query Statistics**: Monitor slow queries
- **Connection Pool**: View active connections
- **Storage Usage**: Track database size
- **Branching**: Manage database branches

### Performance Metrics to Monitor

1. **Query Performance**
   - Average query time
   - Slow query log
   - Connection pool utilization

2. **Database Size**
   - Current size vs. plan limit
   - Growth rate
   - Table-wise breakdown

3. **Connection Usage**
   - Active connections
   - Connection errors
   - Pool exhaustion events

### Adding Query Logging

Enable in development:

```typescript
// libs/database/src/lib/client.ts
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## Security Configuration

### 1. SSL/TLS

Neon requires SSL by default (already configured):
```
sslmode=require
```

### 2. Connection String Security

**Never commit connection strings to Git!**

✅ **Good:**
```bash
# .env (gitignored)
DATABASE_URL=postgresql://...
```

❌ **Bad:**
```typescript
// Don't hardcode connection strings!
const url = "postgresql://neondb_owner:password@...";
```

### 3. Least Privilege Access

For production:
1. Create separate database users for different services
2. Grant only necessary permissions
3. Use read-only users for analytics queries

```sql
-- Create read-only user (run in Neon SQL Editor)
CREATE USER analytics_readonly WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE neondb TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;
```

## Backup & Recovery

### Automatic Backups

Neon provides:
- **Point-in-Time Recovery (PITR)**: Restore to any point within retention period
- **Retention**: 7 days (Free plan) to 30 days (Paid plans)

### Manual Backup

Export database:
```bash
# Install pg_dump (PostgreSQL tools)
brew install postgresql  # macOS

# Backup database
pg_dump "postgresql://neondb_owner:npg_1ZP2vAeUShjs@ep-cold-pond-aipu0bi8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql

# Restore backup
psql "postgresql://..." < backup.sql
```

### Automated Backup Script

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/neondb_${DATE}.sql"

mkdir -p $BACKUP_DIR

pg_dump "$DATABASE_URL" > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Database size approaching plan limit
- Query response times increasing
- Connection pool frequently exhausted
- Consistent high CPU usage

### Neon Plans

1. **Free Tier**
   - 512 MB storage
   - 1 GB data transfer/month
   - Good for: Development, small apps

2. **Pro Plan** ($19/month)
   - 10 GB storage
   - Unlimited data transfer
   - Connection pooling
   - Good for: Production apps

3. **Custom/Enterprise**
   - Custom storage
   - Priority support
   - Good for: Large-scale apps

### Optimization Before Scaling

1. **Add Indexes**
```sql
-- Add index for frequently queried fields
CREATE INDEX idx_product_brand_category ON "Product"(brand, category);
```

2. **Optimize Queries**
- Use `explain analyze` to find slow queries
- Add proper indexes
- Reduce N+1 queries

3. **Implement Caching**
- Add Redis for frequently accessed data
- Cache computed statistics
- Implement CDN for static assets

## Troubleshooting

### Common Issues

#### 1. Connection Timeout

**Error:** `Connection timeout`

**Solution:**
- Check if using pooled connection (`-pooler`)
- Verify SSL mode is set correctly
- Ensure firewall allows outbound connections

#### 2. Too Many Connections

**Error:** `remaining connection slots are reserved`

**Solution:**
- Use pooled connection string
- Implement connection pooling in application
- Close idle connections

#### 3. SSL Certificate Verification Failed

**Error:** `SSL certificate verification failed`

**Solution:**
```bash
# Use sslmode=require instead of sslmode=verify-full
DATABASE_URL="postgresql://...?sslmode=require"
```

#### 4. Migration Fails

**Error:** `migration failed to apply`

**Solution:**
- Use unpooled connection for migrations
- Check if migration already applied
- Verify user has schema modification permissions

### Debug Commands

```bash
# Test connection
npx prisma db execute --schema=./libs/database/prisma/schema.prisma --stdin <<< "SELECT version();"

# Check migration status
npx prisma migrate status --schema=./libs/database/prisma/schema.prisma

# View database schema
npx prisma db pull --schema=./libs/database/prisma/schema.prisma

# Open Prisma Studio
npx prisma studio --schema=./libs/database/prisma/schema.prisma
```

## Next Steps

1. ✅ Database configured and ready
2. ✅ Migrations applied
3. ✅ Prisma Client generated
4. **TODO**: Update package.json scripts (see below)
5. **TODO**: Deploy to Vercel
6. **TODO**: Set up monitoring
7. **TODO**: Create first super admin user

## Update Package.json Scripts

Run this command to update your package.json:

```bash
npm pkg set scripts.prisma:generate="prisma generate --schema=./libs/database/prisma/schema.prisma"
npm pkg set scripts.prisma:migrate="prisma migrate deploy --schema=./libs/database/prisma/schema.prisma"
npm pkg set scripts.prisma:studio="prisma studio --schema=./libs/database/prisma/schema.prisma"
npm pkg set scripts.prisma:migrate:dev="prisma migrate dev --schema=./libs/database/prisma/schema.prisma"
```

## Support Resources

- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Neon Discord**: https://discord.gg/neon
- **Your Neon Console**: https://console.neon.tech

---

**Database Setup Complete!** 🎉

Your Neon database is configured and ready for production deployment. Follow the DEPLOYMENT.md guide for next steps.
