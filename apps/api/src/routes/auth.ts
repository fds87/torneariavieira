import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import type { Bindings } from '../types.js'
import { getDb } from '../db/index.js'
import { users, orders, refreshTokens, passwordResetTokens } from '../db/schema.js'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateSecureToken,
  hashToken,
} from '../lib/auth.js'
import { sendEmail, passwordResetEmail } from '../lib/email.js'

const REFRESH_TOKEN_TTL_DAYS = 30
const COOKIE_NAME = 'rt'

function isSecure(env: Bindings): boolean {
  return env.NODE_ENV === 'production'
}

function refreshCookieHeader(raw: string, expiresAt: Date, env: Bindings): string {
  const expires = expiresAt.toUTCString()
  if (isSecure(env)) {
    return `${COOKIE_NAME}=${raw}; HttpOnly; Secure; SameSite=None; Path=/api/auth/refresh; Expires=${expires}`
  }
  return `${COOKIE_NAME}=${raw}; HttpOnly; SameSite=Lax; Path=/api/auth/refresh; Expires=${expires}`
}

function clearCookieHeader(env: Bindings): string {
  if (isSecure(env)) {
    return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=None; Path=/api/auth/refresh; Max-Age=0`
  }
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/api/auth/refresh; Max-Age=0`
}

const auth = new Hono<{ Bindings: Bindings }>()

async function issueSession(
  db: ReturnType<typeof getDb>,
  user: { id: number; email: string },
  env: Bindings,
  setHeader: (name: string, value: string) => void,
  deleteTokenId?: number,
): Promise<string> {
  if (deleteTokenId !== undefined) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, deleteTokenId))
  }
  const accessToken = await signAccessToken({ sub: user.id, email: user.email }, env.JWT_SECRET)
  const { raw, hash } = await generateSecureToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 86_400_000)
  await db.insert(refreshTokens).values({ userId: user.id, tokenHash: hash, expiresAt: expiresAt.toISOString() })
  setHeader('Set-Cookie', refreshCookieHeader(raw, expiresAt, env))
  return accessToken
}

// POST /api/auth/register
auth.post('/register', async (c) => {
  const db = getDb(c.env.DB)
  let body: { name?: string; email?: string; phone?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const { name, email, phone, password } = body
  if (!name || !email || !password) {
    return c.json({ error: 'name, email e password são obrigatórios' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, 400)
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get()
  if (existing) {
    return c.json({ error: 'E-mail já cadastrado' }, 409)
  }

  const passwordHash = await hashPassword(password)
  const [user] = await db
    .insert(users)
    .values({ name, email, phone: phone ?? null, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone })

  // Link anonymous orders by email
  await db.update(orders).set({ userId: user!.id }).where(eq(orders.customerEmail, email))

  const accessToken = await issueSession(db, user!, c.env, c.header.bind(c))
  return c.json({ accessToken, user })
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  const db = getDb(c.env.DB)
  let body: { email?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const { email, password } = body
  if (!email || !password) {
    return c.json({ error: 'email e password são obrigatórios' }, 400)
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Credenciais inválidas' }, 401)
  }

  const accessToken = await issueSession(db, user, c.env, c.header.bind(c))
  return c.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  })
})

// POST /api/auth/refresh
auth.post('/refresh', async (c) => {
  const db = getDb(c.env.DB)
  const cookieHeader = c.req.header('Cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  const rawToken = match?.[1]
  if (!rawToken) {
    return c.json({ error: 'Refresh token ausente' }, 401)
  }

  const tokenHash = await hashToken(rawToken)
  const stored = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .get()

  if (!stored || new Date(stored.expiresAt) < new Date()) {
    c.header('Set-Cookie', clearCookieHeader(c.env))
    return c.json({ error: 'Refresh token inválido ou expirado' }, 401)
  }

  const user = await db.select().from(users).where(eq(users.id, stored.userId)).get()
  if (!user) {
    return c.json({ error: 'Usuário não encontrado' }, 401)
  }

  // Rotate token
  const accessToken = await issueSession(db, user, c.env, c.header.bind(c), stored.id)
  return c.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  })
})

// POST /api/auth/forgot-password
auth.post('/forgot-password', async (c) => {
  const db = getDb(c.env.DB)
  let body: { email?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const { email } = body
  if (!email) return c.json({ error: 'E-mail obrigatório' }, 400)

  // Always return 200 to avoid email enumeration
  const user = await db.select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .get()

  if (user) {
    // Clean up any previous tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))

    const { raw, hash } = await generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hash,
      expiresAt: expiresAt.toISOString(),
    })

    const APP_BASE_URL = c.env.APP_BASE_URL ?? 'http://localhost:5173'
    const resetUrl = `${APP_BASE_URL}/conta/redefinir-senha?token=${raw}`
    const emailFrom = c.env.EMAIL_FROM ?? 'Brasa Premium <noreply@forjabrasa.com.br>'

    sendEmail(
      {
        to: user.email,
        subject: 'Redefinir senha — Brasa Premium',
        html: passwordResetEmail({ customerName: user.name, resetUrl }),
      },
      c.env.RESEND_API_KEY ?? '',
      emailFrom,
    ).catch((e) => console.error('[email] password reset failed:', e))
  }

  return c.json({ ok: true })
})

// POST /api/auth/reset-password
auth.post('/reset-password', async (c) => {
  const db = getDb(c.env.DB)
  let body: { token?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const { token, password } = body
  if (!token || !password) return c.json({ error: 'Token e senha são obrigatórios' }, 400)
  if (password.length < 8) return c.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, 400)

  const tokenHash = await hashToken(token)
  const stored = await db.select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .get()

  if (!stored || new Date(stored.expiresAt) < new Date()) {
    return c.json({ error: 'Link inválido ou expirado. Solicite um novo.' }, 400)
  }

  const passwordHash = await hashPassword(password)
  await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, stored.userId))
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, stored.id))

  return c.json({ ok: true })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const db = getDb(c.env.DB)
  const cookieHeader = c.req.header('Cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  const rawToken = match?.[1]

  if (rawToken) {
    const tokenHash = await hashToken(rawToken)
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash))
  }

  c.header('Set-Cookie', clearCookieHeader(c.env))
  return c.json({ ok: true })
})

export default auth
