import { Hono } from 'hono'
import { eq, or, desc, count } from 'drizzle-orm'
import type { Bindings } from '../types.js'
import { getDb } from '../db/index.js'
import { users, addresses, orders, orderItems, products } from '../db/schema.js'
import { requireUser } from '../middleware/requireUser.js'
import { hashPassword, verifyPassword } from '../lib/auth.js'

type Variables = { userId: number; userEmail: string }

const account = new Hono<{ Bindings: Bindings; Variables: Variables }>()

type DB = ReturnType<typeof getDb>

async function getOwnedAddress(db: DB, id: number, userId: number) {
  const existing = await db.select().from(addresses).where(eq(addresses.id, id)).get()
  if (!existing) return { error: 'Endereço não encontrado' as const, status: 404 as const }
  if (existing.userId !== userId) return { error: 'Acesso negado' as const, status: 403 as const }
  return { address: existing }
}

account.use('*', requireUser)

// GET /api/account/me
account.get('/me', async (c) => {
  const db = getDb(c.env.DB)
  const user = await db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, c.get('userId')))
    .get()
  if (!user) return c.json({ error: 'Usuário não encontrado' }, 404)
  return c.json(user)
})

// PATCH /api/account/me
account.patch('/me', async (c) => {
  const db = getDb(c.env.DB)
  let body: { name?: string; phone?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }
  const updates: Partial<typeof users.$inferInsert> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.phone !== undefined) updates.phone = body.phone
  if (Object.keys(updates).length === 0) return c.json({ error: 'Nenhum campo para atualizar' }, 400)

  updates.updatedAt = new Date().toISOString()
  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, c.get('userId')))
    .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone })
  return c.json(updated)
})

// POST /api/account/me/change-password
account.post('/me/change-password', async (c) => {
  const db = getDb(c.env.DB)
  let body: { currentPassword?: string; newPassword?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }
  if (!body.currentPassword || !body.newPassword) {
    return c.json({ error: 'currentPassword e newPassword são obrigatórios' }, 400)
  }
  if (body.newPassword.length < 8) {
    return c.json({ error: 'Nova senha deve ter pelo menos 8 caracteres' }, 400)
  }
  const user = await db.select().from(users).where(eq(users.id, c.get('userId'))).get()
  if (!user || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
    return c.json({ error: 'Senha atual incorreta' }, 401)
  }
  const passwordHash = await hashPassword(body.newPassword)
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(users.id, c.get('userId')))
  return c.json({ ok: true })
})

// GET /api/account/orders
account.get('/orders', async (c) => {
  const db = getDb(c.env.DB)
  const userId = c.get('userId')
  const userEmail = c.get('userEmail')

  const userOrders = await db
    .select()
    .from(orders)
    .where(or(eq(orders.userId, userId), eq(orders.customerEmail, userEmail)))
    .orderBy(desc(orders.createdAt))
    .all()

  return c.json(userOrders)
})

// GET /api/account/orders/:id
account.get('/orders/:id', async (c) => {
  const db = getDb(c.env.DB)
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')
  const userEmail = c.get('userEmail')

  const order = await db.select().from(orders).where(eq(orders.id, id)).get()
  if (!order) return c.json({ error: 'Pedido não encontrado' }, 404)
  if (order.userId !== userId && order.customerEmail !== userEmail) {
    return c.json({ error: 'Acesso negado' }, 403)
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id))
    .all()

  return c.json({ ...order, items })
})

// GET /api/account/addresses
account.get('/addresses', async (c) => {
  const db = getDb(c.env.DB)
  const list = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, c.get('userId')))
    .all()
  return c.json(list)
})

// POST /api/account/addresses
account.post('/addresses', async (c) => {
  const db = getDb(c.env.DB)
  const userId = c.get('userId')

  const [countRow] = await db
    .select({ value: count() })
    .from(addresses)
    .where(eq(addresses.userId, userId))
  if ((countRow?.value ?? 0) >= 10) return c.json({ error: 'Limite de 10 endereços atingido' }, 400)

  let body: Partial<typeof addresses.$inferInsert>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }
  const { label, cep, street, number, neighborhood, city, state, complement, isDefault } = body
  if (!cep || !street || !number || !neighborhood || !city || !state) {
    return c.json({ error: 'cep, street, number, neighborhood, city e state são obrigatórios' }, 400)
  }

  const addr = await db.transaction(async (tx) => {
    if (isDefault) {
      await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId))
    }
    const [row] = await tx
      .insert(addresses)
      .values({ userId, label: label ?? 'Casa', cep, street, number, complement: complement ?? null, neighborhood, city, state, isDefault: isDefault ?? false })
      .returning()
    return row
  })
  return c.json(addr, 201)
})

// PATCH /api/account/addresses/:id
account.patch('/addresses/:id', async (c) => {
  const db = getDb(c.env.DB)
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')

  const owned = await getOwnedAddress(db, id, userId)
  if ('error' in owned) return c.json({ error: owned.error }, owned.status)

  let body: Partial<typeof addresses.$inferInsert>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const updates: Partial<typeof addresses.$inferInsert> = {}
  const fields = ['label', 'cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'isDefault'] as const
  for (const f of fields) {
    if (body[f] !== undefined) (updates as Record<string, unknown>)[f] = body[f]
  }

  const updated = await db.transaction(async (tx) => {
    if (body.isDefault) {
      await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId))
    }
    const [row] = await tx.update(addresses).set(updates).where(eq(addresses.id, id)).returning()
    return row
  })
  return c.json(updated)
})

// DELETE /api/account/addresses/:id
account.delete('/addresses/:id', async (c) => {
  const db = getDb(c.env.DB)
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')

  const owned = await getOwnedAddress(db, id, userId)
  if ('error' in owned) return c.json({ error: owned.error }, owned.status)

  await db.delete(addresses).where(eq(addresses.id, id))
  return c.json({ ok: true })
})

// POST /api/account/addresses/:id/default
account.post('/addresses/:id/default', async (c) => {
  const db = getDb(c.env.DB)
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')

  const owned = await getOwnedAddress(db, id, userId)
  if ('error' in owned) return c.json({ error: owned.error }, owned.status)

  const updated = await db.transaction(async (tx) => {
    await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId))
    const [row] = await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, id)).returning()
    return row
  })
  return c.json(updated)
})

export default account
