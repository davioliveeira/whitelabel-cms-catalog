# Docker Configuration

This directory contains Docker-related configuration files for the CMS Catalogo White Label project.

## Directory Structure

```
docker/
├── README.md           # This file
└── (future Dockerfiles will be added here)
```

## Quick Start

### Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose v2+ installed

### Starting Services

```bash
# From project root
docker-compose up -d
```

### Stopping Services

```bash
# Stop containers (preserves data)
docker-compose down

# Stop and remove all data (CAUTION!)
docker-compose down -v
```

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | `postgres:16-alpine` | 5432 | Primary PostgreSQL database |
| redis | `redis:alpine` | 6379 | Cache and rate limiting |

## Health Checks

Both services include health checks:

```bash
# Check PostgreSQL health
docker inspect --format='{{.State.Health.Status}}' cms-postgres

# Check Redis health
docker inspect --format='{{.State.Health.Status}}' cms-redis
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Check running containers
docker-compose ps

# Execute PostgreSQL CLI
docker exec -it cms-postgres psql -U cms_user -d cms_database

# Execute Redis CLI
docker exec -it cms-redis redis-cli

# Restart a service
docker-compose restart postgres
docker-compose restart redis
```

## Data Persistence

Data is stored in Docker volumes:

- `cms-postgres-data`: PostgreSQL database files
- `cms-redis-data`: Redis persistence files

To backup data:

```bash
# Backup PostgreSQL
docker exec cms-postgres pg_dump -U cms_user cms_database > backup.sql

# Restore PostgreSQL
cat backup.sql | docker exec -i cms-postgres psql -U cms_user -d cms_database
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `cms_user` | Database username |
| `POSTGRES_PASSWORD` | `cms_password` | Database password |
| `POSTGRES_DB` | `cms_database` | Database name |
| `DATABASE_URL` | (computed) | Prisma connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |

## Troubleshooting

### Port Conflicts

If ports 5432 or 6379 are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # PostgreSQL on 5433
     - "6380:6379"  # Redis on 6380
   ```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs postgres
docker-compose logs redis

# Remove and recreate containers
docker-compose down
docker-compose up -d --force-recreate
```

### Permission Issues (Linux)

```bash
# Fix PostgreSQL data directory permissions
sudo chown -R 999:999 /var/lib/docker/volumes/cms-postgres-data
```
