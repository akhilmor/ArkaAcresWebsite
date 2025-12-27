import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const BCRYPT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a secure reset token
 * Returns both the plain token (to send to user) and the hash (to store in DB)
 */
export function generateResetToken(): { token: string; tokenHash: string } {
  // Generate 32 random bytes (256 bits)
  const token = crypto.randomBytes(32).toString('hex')
  
  // Hash with SHA256 for storage
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
  return { token, tokenHash }
}

/**
 * Hash a token for comparison (used when verifying reset token)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

