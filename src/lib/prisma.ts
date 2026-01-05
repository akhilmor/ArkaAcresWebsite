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

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  const error = '❌ [PRISMA] DATABASE_URL is required. Set it in your environment variables.'
  console.error(error)
  throw new Error(error)
}

// Validate DATABASE_URL is Postgres (not SQLite file:)
if (process.env.DATABASE_URL.startsWith('file:')) {
  const error = '❌ [PRISMA] DATABASE_URL must be a PostgreSQL connection string (postgresql://...), not SQLite (file:...). The schema now uses PostgreSQL provider.'
  console.error(error)
  throw new Error(error)
}

// Lazy initialization function
function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Validate DATABASE_URL at initialization time (not module load time)
  if (!process.env.DATABASE_URL) {
    const error = '❌ [PRISMA] DATABASE_URL is required. Set it in your environment variables.'
    console.error(error)
    throw new Error(error)
  }

  // Validate DATABASE_URL is Postgres (not SQLite file:)
  if (process.env.DATABASE_URL.startsWith('file:')) {
    const error = '❌ [PRISMA] DATABASE_URL must be a PostgreSQL connection string (postgresql://...), not SQLite (file:...). The schema now uses PostgreSQL provider.'
    console.error(error)
    throw new Error(error)
  }

  try {
    // Standard PrismaClient initialization (works with PostgreSQL)
    // No adapter needed for PostgreSQL in Node.js runtime
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    
    return client
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

// Export a getter that initializes on first access (lazy initialization)
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    return (client as any)[prop]
  }
})

export { prisma }

