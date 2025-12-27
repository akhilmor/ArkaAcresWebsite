# Database Seeding

## Quick Start

After setting up the database or resetting it, always run the seed script to populate the Unit table:

```bash
npm run db:seed
```

Or using Prisma directly:

```bash
npx prisma db seed
```

## What Gets Seeded

The seed script creates/updates 3 units in the database:

1. **the-white-house** - Stay unit, sleeps up to 15
2. **red-roost** - Stay unit, sleeps up to 2  
3. **aurora-grand** - Event unit

## When to Run Seed

- After `prisma db push` or `prisma migrate reset`
- After cloning the repo and setting up the database
- If you see `UNIT_NOT_FOUND` errors in booking

## Automated Seeding

The `package.json` includes helper scripts:

- `npm run db:push` - Runs `prisma db push` then automatically seeds
- `npm run db:reset` - Runs `prisma migrate reset` then automatically seeds

## Verify Seeding

Check that units exist:

```bash
npx prisma studio
```

Or query via API:

```bash
curl http://localhost:3000/api/health
```

The seed script is idempotent - safe to run multiple times. It uses `upsert` to create or update units.

