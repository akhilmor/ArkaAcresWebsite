import { prisma } from '@/lib/prisma'
import { hashPassword } from './adminAuth'
import { ADMIN_EMAIL } from './adminConstants'

/**
 * Ensure admin user exists in database
 * If not, create it from ADMIN_PASSWORD env var
 * 
 * IMPORTANT: This only creates if missing. It NEVER updates an existing password hash.
 * This prevents overwriting passwords set via reset flow.
 */
export async function ensureAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required')
  }

  // Check if admin user exists (only for ADMIN_EMAIL)
  let adminUser = await prisma.adminUser.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (!adminUser) {
    // Create admin user with hashed password (only on first boot)
    const passwordHash = await hashPassword(adminPassword.trim())
    
    adminUser = await prisma.adminUser.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
      },
    })
    
    console.log(`[ADMIN] Created admin user: ${ADMIN_EMAIL}`)
  }
  // DO NOT update password hash if user exists - this would overwrite reset passwords!

  return adminUser
}

