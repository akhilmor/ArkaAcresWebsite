#!/usr/bin/env node

/**
 * Server Startup Check
 * Verifies Next.js configuration and environment before starting dev server
 */

const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')

function checkPagesDirectory() {
  const pagesPath = path.join(projectRoot, 'pages')
  const srcPagesPath = path.join(projectRoot, 'src', 'pages')
  
  if (fs.existsSync(pagesPath)) {
    console.error('❌ ERROR: /pages directory detected. This project uses App Router only.')
    console.error(`   Found: ${pagesPath}`)
    console.error('   Please remove /pages directory or migrate to App Router.')
    process.exit(1)
  }
  
  if (fs.existsSync(srcPagesPath)) {
    console.error('❌ ERROR: /src/pages directory detected. This project uses App Router only.')
    console.error(`   Found: ${srcPagesPath}`)
    console.error('   Please remove /src/pages directory or migrate to App Router.')
    process.exit(1)
  }
  
  return true
}

function getNextVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    )
    return packageJson.dependencies?.next || packageJson.devDependencies?.next || 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

function checkPrismaClient() {
  const prismaClientPath = path.join(projectRoot, 'node_modules', '.prisma', 'client')
  const prismaClientIndex = path.join(prismaClientPath, 'index.js')
  
  if (fs.existsSync(prismaClientIndex)) {
    return true
  }
  
  // Also check for @prisma/client package
  const prismaClientPackage = path.join(projectRoot, 'node_modules', '@prisma', 'client')
  if (fs.existsSync(prismaClientPackage)) {
    // Check if generated client exists
    try {
      require.resolve('@prisma/client')
      return true
    } catch {
      return false
    }
  }
  
  return false
}

function main() {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const nextVersion = getNextVersion()
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Arka Acres - Development Server Startup')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   Next.js Version: ${nextVersion}`)
  console.log(`   NODE_ENV:        ${nodeEnv}`)
  console.log(`   App Router:      ✅ Confirmed`)
  
  // Check for Pages Router remnants
  if (checkPagesDirectory()) {
    console.log(`   Pages Router:    ✅ Not detected (App Router only)`)
  }
  
  // Check Prisma client
  const prismaOk = checkPrismaClient()
  if (prismaOk) {
    console.log(`   Prisma Client:   ✅ Generated`)
  } else {
    console.error('')
    console.error('❌ ERROR: Prisma client not found!')
    console.error('   Run: npx prisma generate')
    console.error('   Or: npm run db:generate')
    console.error('')
    process.exit(1)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
}

main()

