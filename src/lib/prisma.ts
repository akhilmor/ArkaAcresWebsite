import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Type fix for pg import
import type pg from 'pg'

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

// Lazy initialization - only create client when first accessed
let prismaClient: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  // Return existing client if available
  if (prismaClient) {
    return prismaClient
  }

  // Check global cache
  if (globalForPrisma.prisma) {
    prismaClient = globalForPrisma.prisma
    return prismaClient
  }

  // Validate DATABASE_URL before creating client
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ [PRISMA] DATABASE_URL is required. Set it in your environment variables.')
  }

  if (process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error('❌ [PRISMA] DATABASE_URL must be a PostgreSQL connection string (postgresql://...), not SQLite (file:...).')
  }

  try {
    // Prisma v7.2.0 requires adapter for "client" engine type
    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maximum number of clients in the pool
    })
    
    // Create Prisma adapter
    const adapter = new PrismaPg(pool)
    
    // Create PrismaClient with adapter
    prismaClient = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    // Store in global to prevent multiple instances in development
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient
    }
    
    return prismaClient
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to initialize Prisma client:', error?.message)
    console.error('❌ [PRISMA] Error details:', error)
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ [PRISMA] Production error - check DATABASE_URL is set correctly in Vercel environment variables')
    } else {
      console.error('❌ [PRISMA] Local error - ensure DATABASE_URL is set to a PostgreSQL connection string')
    }
    throw new Error(`Prisma initialization failed: ${error?.message}`)
  }
}

// Export a proxy that initializes on first access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    // Bind functions to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

