import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'
const adapterFactory = new PrismaBetterSqlite3({ url: dbPath })

// @ts-ignore - PrismaClient with adapter works at runtime
const prisma = new PrismaClient({ adapter: adapterFactory })

async function main() {
  console.log('🌱 Seeding database...')

  // Upsert units (idempotent - safe to run multiple times)
  // White House and Aurora Grand share resource group "main-campus"
  const whiteHouse = await prisma.unit.upsert({
    where: { slug: 'the-white-house' },
    update: {
      name: 'The White House',
      type: 'stay',
      sleepsUpTo: 15,
      resourceGroup: 'main-campus',
    },
    create: {
      slug: 'the-white-house',
      name: 'The White House',
      type: 'stay',
      sleepsUpTo: 15,
      resourceGroup: 'main-campus',
    },
  })

  const redRoost = await prisma.unit.upsert({
    where: { slug: 'red-roost' },
    update: {
      name: 'Red Roost',
      type: 'stay',
      sleepsUpTo: 2,
      resourceGroup: null, // Independent
    },
    create: {
      slug: 'red-roost',
      name: 'Red Roost',
      type: 'stay',
      sleepsUpTo: 2,
      resourceGroup: null,
    },
  })

  const auroraGrand = await prisma.unit.upsert({
    where: { slug: 'aurora-grand' },
    update: {
      name: 'Aurora Grand',
      type: 'event',
      sleepsUpTo: null,
      resourceGroup: 'main-campus',
    },
    create: {
      slug: 'aurora-grand',
      name: 'Aurora Grand',
      type: 'event',
      sleepsUpTo: null,
      resourceGroup: 'main-campus',
    },
  })

  console.log('✅ Created/updated units:')
  console.log('  -', whiteHouse.slug, `(${whiteHouse.id})`)
  console.log('  -', redRoost.slug, `(${redRoost.id})`)
  console.log('  -', auroraGrand.slug, `(${auroraGrand.id})`)
  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

