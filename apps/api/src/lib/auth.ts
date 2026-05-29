import { SignJWT, jwtVerify } from 'jose'

// ─── PBKDF2 Password Hashing ─────────────────────────────────────────────────
// Uses Web Crypto API — native in Cloudflare Workers

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)))
  return `${saltB64}:${hashB64}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':')
  if (!saltB64 || !hashB64) return false
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  const candidate = new Uint8Array(bits)
  const storedBytes = Uint8Array.from(atob(hashB64), (c) => c.charCodeAt(0))
  if (candidate.length !== storedBytes.length) return false
  // Timing-safe comparison via HMAC — prevents side-channel leakage
  const key = await crypto.subtle.importKey(
    'raw', crypto.getRandomValues(new Uint8Array(32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, candidate),
    crypto.subtle.sign('HMAC', key, storedBytes),
  ])
  const ua = new Uint8Array(sigA), ub = new Uint8Array(sigB)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

// ─── JWT (access tokens — 15 min) ────────────────────────────────────────────

export interface JwtPayload {
  sub: number
  email: string
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(payload: JwtPayload, secret: string): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secretKey(secret))
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret))
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null
    return { sub: parseInt(payload.sub, 10), email: payload.email as string }
  } catch {
    return null
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
// Raw random token returned to client (stored in httpOnly cookie).
// SHA-256 hash stored in the database.

export async function generateSecureToken(): Promise<{ raw: string; hash: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(48))
  const raw = btoa(String.fromCharCode(...bytes))
  const hash = await hashToken(raw)
  return { raw, hash }
}

export async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}
