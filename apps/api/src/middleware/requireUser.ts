import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '../types.js'
import { verifyAccessToken } from '../lib/auth.js'

export const requireUser: MiddlewareHandler<{ Bindings: Bindings; Variables: { userId: number; userEmail: string } }> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Não autorizado' }, 401)
  }
  const token = authHeader.slice(7)
  const payload = await verifyAccessToken(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Token inválido ou expirado' }, 401)
  }
  c.set('userId', payload.sub)
  c.set('userEmail', payload.email)
  await next()
}
