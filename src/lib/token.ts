import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(20).toString('hex')
}

export function tokenExpiryDate(days = 30): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export function isTokenValid(token: {
  expiresAt: Date
  revokedAt: Date | null
}): boolean {
  if (token.revokedAt) return false
  return token.expiresAt > new Date()
}
