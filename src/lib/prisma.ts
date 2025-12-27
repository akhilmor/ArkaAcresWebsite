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

// For SQLite, we need to use the better-sqlite3 adapter
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'

let prisma: PrismaClient

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma
} else {
  try {
    const sqlite = new Database(dbPath)
    const adapterFactory = new PrismaBetterSqlite3({ url: dbPath })
    
    prisma = new PrismaClient({
      adapter: adapterFactory,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  } catch (error: any) {
    console.error('❌ [PRISMA] Failed to initialize Prisma client:', error?.message)
    throw new Error(`Prisma initialization failed: ${error?.message}`)
  }
}

export { prisma }

