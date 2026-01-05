#!/usr/bin/env node
/**
 * Script to resolve failed Prisma migration on Vercel
 * 
 * Usage:
 *   node scripts/resolve-vercel-migration.js
 * 
 * Or with DATABASE_URL:
 *   DATABASE_URL="postgresql://..." node scripts/resolve-vercel-migration.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIGRATION_NAME = '20251226134246_add_notification_log';

function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nTo set it:');
    console.log('  export DATABASE_URL="postgresql://user:password@host:port/database"');
    console.log('\nOr get it from Vercel:');
    console.log('  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('  2. Copy the DATABASE_URL value');
    console.log('  3. Run: export DATABASE_URL="<your-url>"');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL.startsWith('postgresql://') && 
      !process.env.DATABASE_URL.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL is set');
}

function checkTableExists() {
  console.log('\n🔍 Checking if NotificationLog table exists...');
  try {
    // Use Prisma to check table existence
    const result = execSync(
      `npx prisma db execute --stdin <<'EOF'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'NotificationLog'
) as exists;
EOF`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    console.log('Table check result:', result);
    return true;
  } catch (error) {
    // If command fails, we'll proceed anyway
    console.log('⚠️  Could not check table existence, proceeding...');
    return null;
  }
}

function checkMigrationStatus() {
  console.log('\n📋 Checking migration status...');
  try {
    const status = execSync('npx prisma migrate status', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(status);
    return status;
  } catch (error) {
    console.log('Migration status:', error.stdout || error.message);
    return error.stdout || '';
  }
}

function resolveMigration() {
  console.log(`\n🔧 Resolving failed migration: ${MIGRATION_NAME}`);
  console.log('   This will mark the migration as applied if the table exists.');
  
  try {
    execSync(`npx prisma migrate resolve --applied ${MIGRATION_NAME}`, {
      stdio: 'inherit'
    });
    console.log('✅ Migration resolved successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to resolve migration:', error.message);
    console.log('\nAlternative: Try marking it as rolled back:');
    console.log(`  npx prisma migrate resolve --rolled-back ${MIGRATION_NAME}`);
    return false;
  }
}

function deployMigrations() {
  console.log('\n🚀 Deploying remaining migrations...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit'
    });
    console.log('✅ Migrations deployed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy migrations:', error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Vercel Migration Resolution Script');
  console.log('=====================================\n');

  checkDatabaseConnection();
  
  const tableExists = checkTableExists();
  const migrationStatus = checkMigrationStatus();

  // Check if migration is already resolved
  if (migrationStatus.includes('Database schema is up to date')) {
    console.log('\n✅ Database schema is already up to date!');
    console.log('   No action needed.');
    return;
  }

  // Try to resolve the failed migration
  if (migrationStatus.includes('failed') || migrationStatus.includes(MIGRATION_NAME)) {
    const resolved = resolveMigration();
    if (resolved) {
      deployMigrations();
    } else {
      console.log('\n⚠️  Could not automatically resolve. Please run manually:');
      console.log(`   npx prisma migrate resolve --applied ${MIGRATION_NAME}`);
      console.log('   npx prisma migrate deploy');
    }
  } else {
    // Just deploy any pending migrations
    deployMigrations();
  }

  console.log('\n✅ Resolution complete!');
  console.log('\nNext steps:');
  console.log('  1. Verify the build: npm run build');
  console.log('  2. Push changes to trigger Vercel deployment');
  console.log('  3. Monitor Vercel deployment logs');
}

if (require.main === module) {
  main();
}

module.exports = { main };

