import { Hono } from 'hono'
import { getDb } from '../db/index.js'
import { orders, orderItems, products } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
import type { Bindings } from '../types.js'

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const body = await c.req.json<{
      customer: { name: string; email: string; phone: string; city?: string; state?: string }
      items: Array<{ productId: number; quantity: number }>
      notes?: string
    }>().catch(() => null)

    if (!body) {
      return c.json({ error: 'Corpo da requisicao invalido ou ausente' }, 400)
    }

    const { customer, items, notes } = body

    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return c.json({ error: 'Nome, email e telefone sao obrigatorios' }, 400)
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return c.json({ error: 'Email invalido' }, 400)
    }

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Pedido deve ter ao menos um item' }, 400)
    }

    // Validate each item before hitting the DB
    for (const item of items) {
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        return c.json({ error: 'productId invalido em um dos itens' }, 400)
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return c.json({ error: `Quantidade invalida para produto ${item.productId}` }, 400)
      }
    }

    let totalAmount = 0
    const resolvedItems: Array<{ productId: number; quantity: number; unitPrice: number }> = []

    const productIds = items.map((i) => i.productId)
    const productRows = await db.select().from(products).where(inArray(products.id, productIds)).all()
    const productMap = new Map(productRows.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) return c.json({ error: `Produto ${item.productId} nao encontrado` }, 400)
      if (!product.inStock) return c.json({ error: `Produto "${product.name}" nao disponivel` }, 400)
      resolvedItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price })
      totalAmount += product.price * item.quantity
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          customerPhone: customer.phone.trim(),
          customerCity: customer.city?.trim(),
          customerState: customer.state?.trim(),
          totalAmount,
          notes: notes?.trim(),
        })
        .returning()

      for (const item of resolvedItems) {
        await tx.insert(orderItems).values({
          orderId: order!.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
      }

      return order!
    })

    return c.json(result, 201)
  } catch (err) {
    console.error('[orders POST /]', err)
    return c.json({ error: 'Erro ao criar pedido' }, 500)
  }
})

// GET /:id — apenas para o dono do pedido (token Bearer) ou admin (x-admin-key)
app.get('/:id', async (c) => {
  const adminKey = c.req.header('x-admin-key')
  const authHeader = c.req.header('authorization')
  const isAdmin = adminKey && adminKey === c.env.ADMIN_KEY

  if (!isAdmin && !authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Autenticacao necessaria' }, 401)
  }

  try {
    const db = getDb(c.env.DB)
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'ID de pedido invalido' }, 400)
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)

    if (!order) {
      return c.json({ error: 'Pedido nao encontrado' }, 404)
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: products.name,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id))

    return c.json({ ...order, items })
  } catch (err) {
    console.error('[orders GET /:id]', err)
    return c.json({ error: 'Erro ao buscar pedido' }, 500)
  }
})

export default app
