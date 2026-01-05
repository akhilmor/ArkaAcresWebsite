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
      log(`Attempting to resolve failed migration: ${MIGRATION_NAME}`);
      
      // Try to mark as applied (if table exists)
      if (runCommand(
        `npx prisma migrate resolve --applied ${MIGRATION_NAME}`,
        `Resolving migration ${MIGRATION_NAME}`
      )) {
        log('✅ Migration resolved');
      } else {
        log('⚠️  Could not resolve migration automatically. Continuing with deploy...');
      }
    }
  } catch (error) {
    log(`⚠️  Migration status check failed: ${error.message}`);
    log('   Continuing with migration deploy...');
  }

  // Deploy migrations
  log('Deploying migrations...');
  if (runCommand('npx prisma migrate deploy', 'Deploying migrations')) {
    log('✅ Migrations deployed successfully');
  } else {
    log('❌ Migration deploy failed. Build will continue but may fail.');
    // Don't exit with error - let the build script handle it
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

