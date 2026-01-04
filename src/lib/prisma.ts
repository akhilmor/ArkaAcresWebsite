import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

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

// Validate DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  const error = '❌ [PRISMA] DATABASE_URL is required in production. Set it in Vercel environment variables.'
  console.error(error)
  throw new Error(error)
}

// For SQLite, we need to use the better-sqlite3 adapter
// In production, DATABASE_URL should be a Postgres connection string (not file:)
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'

// Check if we're using SQLite (development) or Postgres (production)
const isSQLite = process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL

let prisma: PrismaClient

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma
} else {
  try {
    if (isSQLite) {
      // SQLite setup (development only)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SQLite (file:./dev.db) cannot be used in production. Use a Postgres database and set DATABASE_URL in Vercel environment variables.')
      }
      const sqlite = new Database(dbPath)
      const adapterFactory = new PrismaBetterSqlite3({ url: dbPath })
      
      prisma = new PrismaClient({
        adapter: adapterFactory,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    } else {
      // Postgres setup (production)
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to initialize Prisma client:', error?.message)
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ [PRISMA] Production error - check DATABASE_URL is set correctly in Vercel environment variables')
    }
    throw new Error(`Prisma initialization failed: ${error?.message}`)
  }
}

export { prisma }

