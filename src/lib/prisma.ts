import { PrismaClient } from '@prisma/client'

// Fail fast if Prisma client is missing
try {
  require.resolve('@prisma/client')
} catch (error) {
  console.error('❌ [PRISMA] Prisma client not found. Run: npx prisma generate')
  throw new Error('Prisma client not generated. Run: npm run db:generate')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL at module load (but don't initialize PrismaClient yet)
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [PRISMA] DATABASE_URL not set. Prisma will fail when used.')
}

if (process.env.DATABASE_URL?.startsWith('file:')) {
  console.error('❌ [PRISMA] DATABASE_URL must be PostgreSQL (postgresql://...), not SQLite (file:...)')
}

// Initialize PrismaClient - for PostgreSQL in Node.js, no adapter needed
// Using singleton pattern to prevent multiple instances
let prisma: PrismaClient

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma
} else {
  // Validate DATABASE_URL before creating client
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ [PRISMA] DATABASE_URL is required. Set it in your environment variables.')
  }

  if (process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error('❌ [PRISMA] DATABASE_URL must be a PostgreSQL connection string (postgresql://...), not SQLite (file:...).')
  }

  try {
    // Standard PrismaClient for PostgreSQL - no adapter needed in Node.js
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    // Store in global to prevent multiple instances in development
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to initialize Prisma client:', error?.message)
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ [PRISMA] Production error - check DATABASE_URL is set correctly in Vercel environment variables')
    } else {
      console.error('❌ [PRISMA] Local error - ensure DATABASE_URL is set to a PostgreSQL connection string')
    }
    throw new Error(`Prisma initialization failed: ${error?.message}`)
  }
}

export { prisma }

