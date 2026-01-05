#!/usr/bin/env node
/**
 * Pre-build migration script for Vercel
 * This script runs before the build to ensure migrations are resolved
 * 
 * Usage: node scripts/pre-build-migration.js
 * This is automatically called in the build script
 */

const { execSync } = require('child_process');

const MIGRATION_NAME = '20251226134246_add_notification_log';

function log(message) {
  console.log(`[Migration] ${message}`);
}

function runCommand(command, description) {
  try {
    log(description);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`⚠️  ${description} failed: ${error.message}`);
    return false;
  }
}

function main() {
  log('Starting pre-build migration check...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL is not set. Skipping migration resolution.');
    log('   Set DATABASE_URL in Vercel Dashboard → Settings → Environment Variables');
    process.exit(0); // Don't fail the build, just skip
  }

  // Validate DATABASE_URL is PostgreSQL
  if (!process.env.DATABASE_URL.startsWith('postgres')) {
    log('⚠️  DATABASE_URL does not appear to be PostgreSQL. Skipping migration resolution.');
    process.exit(0);
  }

  log('✅ DATABASE_URL is set');

  // Check migration status
  log('Checking migration status...');
  try {
    const status = execSync('npx prisma migrate status', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // If migrations are up to date, we're done
    if (status.includes('Database schema is up to date')) {
      log('✅ Database schema is up to date. No action needed.');
      return;
    }

    // If there's a failed migration, try to resolve it
    if (status.includes('failed') || status.includes(MIGRATION_NAME)) {
      log(`⚠️  Found failed migration: ${MIGRATION_NAME}`);
      log(`Attempting to resolve failed migration: ${MIGRATION_NAME}`);
      
      // Try to mark as applied (if table exists)
      try {
        execSync(`npx prisma migrate resolve --applied ${MIGRATION_NAME}`, {
          stdio: 'inherit',
          encoding: 'utf-8'
        });
        log(`✅ Migration ${MIGRATION_NAME} resolved successfully`);
      } catch (resolveError) {
        log(`⚠️  Could not resolve as applied, trying rolled-back...`);
        try {
          execSync(`npx prisma migrate resolve --rolled-back ${MIGRATION_NAME}`, {
            stdio: 'inherit',
            encoding: 'utf-8'
          });
          log(`✅ Migration ${MIGRATION_NAME} marked as rolled-back`);
        } catch (rollbackError) {
          log(`❌ Could not resolve migration. Error: ${rollbackError.message}`);
          log(`   This may cause the build to fail. Please resolve manually.`);
          // Don't exit - let migrate deploy try to handle it
        }
      }
    }
  } catch (error) {
    log(`⚠️  Migration status check failed: ${error.message}`);
    log('   Continuing with migration deploy...');
  }

  // Note: We don't deploy migrations here - that's handled by the build script
  // This script just resolves failed migrations
  log('Pre-build migration check complete. Migrations will be deployed by build script.');
}

if (require.main === module) {
  main();
}

module.exports = { main };

