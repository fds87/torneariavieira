import { Hono } from 'hono'
import { getDb } from '../db/index.js'
import { orders, orderItems, products, ORDER_STATUSES } from '../db/schema.js'
import type { OrderStatus, ProductImage } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import type { Bindings } from '../types.js'

const app = new Hono<{ Bindings: Bindings }>()

// Timing-safe HMAC comparison — prevents timing attacks on admin key
async function safeCompareKey(input: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', crypto.getRandomValues(new Uint8Array(32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(input)),
    crypto.subtle.sign('HMAC', key, enc.encode(expected)),
  ])
  const ua = new Uint8Array(sigA), ub = new Uint8Array(sigB)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

// Admin authentication middleware
app.use('*', async (c, next) => {
  const auth = c.req.header('x-admin-key')
  if (!auth || !(await safeCompareKey(auth, c.env.ADMIN_KEY ?? ''))) {
    return c.json({ error: 'Nao autorizado' }, 401)
  }
  await next()
})

app.post('/login', (c) => c.json({ ok: true }))

// Normaliza/valida o array de imagens vindo do cliente.
function sanitizeImages(input: unknown): ProductImage[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    .map((i) => ({
      url: typeof i.url === 'string' ? i.url : '',
      ...(typeof i.key === 'string' ? { key: i.key } : {}),
    }))
    .filter((i) => i.url.length > 0)
    .slice(0, 12)
}

// ── Upload de imagens (R2) ─────────────────────────────────────────────────────

app.post('/uploads', async (c) => {
  try {
    if (!c.env.BUCKET) return c.json({ error: 'Armazenamento indisponivel' }, 503)

    const form = await c.req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return c.json({ error: 'Arquivo ausente' }, 400)
    if (!file.type.startsWith('image/')) return c.json({ error: 'Tipo de arquivo invalido' }, 400)
    if (file.size > 10_485_760) return c.json({ error: 'Imagem muito grande (max 10MB)' }, 413)

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const key = `products/${crypto.randomUUID()}.${ext}`

    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    })

    const base = (c.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    return c.json({ url: `${base}/api/uploads/${key}`, key }, 201)
  } catch (err) {
    console.error('[admin POST /uploads]', err)
    return c.json({ error: 'Erro ao enviar imagem' }, 500)
  }
})

app.delete('/uploads/:key{.+}', async (c) => {
  try {
    if (!c.env.BUCKET) return c.json({ error: 'Armazenamento indisponivel' }, 503)
    const key = c.req.param('key')
    if (key) await c.env.BUCKET.delete(key)
    return c.json({ ok: true })
  } catch (err) {
    console.error('[admin DELETE /uploads/:key]', err)
    return c.json({ error: 'Erro ao remover imagem' }, 500)
  }
})

// ── Orders ────────────────────────────────────────────────────────────────────

app.get('/orders', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt))
    return c.json(rows)
  } catch (err) {
    console.error('[admin GET /orders]', err)
    return c.json({ error: 'Erro ao buscar pedidos' }, 500)
  }
})

app.get('/orders/:id', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'ID de pedido invalido' }, 400)
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
    if (!order) return c.json({ error: 'Pedido nao encontrado' }, 404)

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
    console.error('[admin GET /orders/:id]', err)
    return c.json({ error: 'Erro ao buscar pedido' }, 500)
  }
})

app.patch('/orders/:id', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'ID de pedido invalido' }, 400)
    }

    const body = await c.req.json<{ status: string }>().catch(() => null)
    if (!body) return c.json({ error: 'Corpo da requisicao invalido' }, 400)

    const { status } = body

    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return c.json({ error: `Status invalido. Valores aceitos: ${ORDER_STATUSES.join(', ')}` }, 400)
    }

    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning()

    if (!updated) return c.json({ error: 'Pedido nao encontrado' }, 404)

    return c.json(updated)
  } catch (err) {
    console.error('[admin PATCH /orders/:id]', err)
    return c.json({ error: 'Erro ao atualizar pedido' }, 500)
  }
})

// ── Products ──────────────────────────────────────────────────────────────────

app.get('/products', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const rows = await db.select().from(products)
    return c.json(rows)
  } catch (err) {
    console.error('[admin GET /products]', err)
    return c.json({ error: 'Erro ao buscar produtos' }, 500)
  }
})

app.post('/products', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const body = await c.req.json<{
      slug: string
      name: string
      category: string
      description: string
      material: string
      price: number
      priceMin: number
      priceMax: number
      imageUrl?: string
      images?: ProductImage[]
      inStock?: boolean
    }>().catch(() => null)

    if (!body) return c.json({ error: 'Corpo da requisicao invalido' }, 400)

    const { slug, name, category, description, material, price, priceMin, priceMax, imageUrl, inStock } = body
    const images = sanitizeImages(body.images)

    if (!slug?.trim() || !name?.trim() || !category?.trim()) {
      return c.json({ error: 'slug, name e category sao obrigatorios' }, 400)
    }
    if (typeof price !== 'number' || price < 0) {
      return c.json({ error: 'price deve ser um numero positivo' }, 400)
    }
    if (typeof priceMin !== 'number' || priceMin < 0) {
      return c.json({ error: 'priceMin deve ser um numero positivo' }, 400)
    }
    if (typeof priceMax !== 'number' || priceMax < priceMin) {
      return c.json({ error: 'priceMax deve ser >= priceMin' }, 400)
    }

    const [result] = await db
      .insert(products)
      .values({
        slug: slug.trim(),
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() ?? '',
        material: material?.trim() ?? '',
        price,
        priceMin,
        priceMax,
        // imageUrl segue a primeira imagem da galeria (compatibilidade: carrinho, ML, OG).
        imageUrl: images[0]?.url ?? imageUrl?.trim() ?? null,
        images: images.length ? images : null,
        inStock: inStock ?? true,
      })
      .returning()

    return c.json(result, 201)
  } catch (err: unknown) {
    // Unique constraint violation on slug
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return c.json({ error: 'Ja existe um produto com esse slug' }, 409)
    }
    console.error('[admin POST /products]', err)
    return c.json({ error: 'Erro ao criar produto' }, 500)
  }
})

app.patch('/products/:id', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'ID de produto invalido' }, 400)
    }

    const body = await c.req.json<Record<string, unknown>>().catch(() => null)
    if (!body) return c.json({ error: 'Corpo da requisicao invalido' }, 400)

    // Whitelist of patchable fields — slug excluded intentionally (breaks URLs/cache)
    const PATCHABLE: Array<keyof typeof products.$inferInsert> = [
      'name', 'category', 'description', 'material',
      'price', 'priceMin', 'priceMax', 'imageUrl', 'images', 'inStock',
      'weightG', 'lengthCm', 'widthCm', 'heightCm',
    ]

    const patch = Object.fromEntries(
      PATCHABLE.filter((key) => key in body).map((key) => [key, body[key]]),
    ) as Partial<typeof products.$inferInsert>

    // Galeria: normaliza e mantém imageUrl apontando para a primeira imagem.
    if ('images' in patch) {
      const images = sanitizeImages(patch.images)
      patch.images = images.length ? images : null
      const cover = images[0]
      if (cover) patch.imageUrl = cover.url
    }

    if (Object.keys(patch).length === 0) {
      return c.json({ error: 'Nenhum campo valido para atualizar' }, 400)
    }

    if ('price' in patch && (typeof patch.price !== 'number' || patch.price < 0)) {
      return c.json({ error: 'price deve ser um numero positivo' }, 400)
    }
    if ('priceMin' in patch && (typeof patch.priceMin !== 'number' || patch.priceMin < 0)) {
      return c.json({ error: 'priceMin deve ser um numero positivo' }, 400)
    }
    if ('inStock' in patch && typeof patch.inStock !== 'boolean') {
      return c.json({ error: 'inStock deve ser boolean' }, 400)
    }

    const [updated] = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning()

    if (!updated) return c.json({ error: 'Produto nao encontrado' }, 404)

    return c.json(updated)
  } catch (err) {
    console.error('[admin PATCH /products/:id]', err)
    return c.json({ error: 'Erro ao atualizar produto' }, 500)
  }
})

app.delete('/products/:id', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: 'ID de produto invalido' }, 400)
    }

    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id })
    if (!deleted) return c.json({ error: 'Produto nao encontrado' }, 404)
    return c.json({ ok: true })
  } catch (err) {
    console.error('[admin DELETE /products/:id]', err)
    return c.json({ error: 'Erro ao remover produto' }, 500)
  }
})

export default app
