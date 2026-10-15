import { Hono } from 'hono'
import { getDb } from '../db/index.js'
import { products, mlConfig, mlListings, orders, orderItems } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { Bindings } from '../types.js'

const app = new Hono<{ Bindings: Bindings }>()

const ML_API = 'https://api.mercadolibre.com'
const ML_AUTH = 'https://auth.mercadolivre.com.br'

// Timing-safe HMAC comparison
async function safeCompare(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', crypto.getRandomValues(new Uint8Array(32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(a)),
    crypto.subtle.sign('HMAC', key, enc.encode(b)),
  ])
  const ua = new Uint8Array(sigA), ub = new Uint8Array(sigB)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

// ---------------------------------------------------------------------------
// Admin auth middleware (exceto auth/callback e webhook)
// ---------------------------------------------------------------------------
app.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (path.endsWith('/auth/callback') || path.endsWith('/webhook')) {
    return next()
  }
  const key = c.req.header('x-admin-key')
  if (!key || !(await safeCompare(key, c.env.ADMIN_KEY ?? ''))) {
    return c.json({ error: 'Nao autorizado' }, 401)
  }
  return next()
})

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
async function getValidToken(db: ReturnType<typeof getDb>, env: Bindings): Promise<string> {
  const [config] = await db.select().from(mlConfig).limit(1)
  if (!config) throw new Error('ML nao conectado')

  if (Date.now() / 1000 > config.expiresAt - 300) {
    const res = await fetch(`${ML_API}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: env.ML_CLIENT_ID ?? '',
        client_secret: env.ML_CLIENT_SECRET ?? '',
        refresh_token: config.refreshToken,
      }),
    })
    if (!res.ok) throw new Error('Falha ao renovar token ML')
    const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
    await db.update(mlConfig).set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    }).where(eq(mlConfig.id, 1))
    return data.access_token
  }
  return config.accessToken
}

// ---------------------------------------------------------------------------
// GET /api/ml/status — verifica se ML está conectado
// ---------------------------------------------------------------------------
app.get('/status', async (c) => {
  const db = getDb(c.env.DB)
  const [config] = await db.select({ mlUserId: mlConfig.mlUserId }).from(mlConfig).limit(1)
  return c.json({ connected: !!config, mlUserId: config?.mlUserId ?? null })
})

// ---------------------------------------------------------------------------
// GET /api/ml/auth/start — inicia fluxo OAuth
// ---------------------------------------------------------------------------
app.get('/auth/start', (c) => {
  const clientId = c.env.ML_CLIENT_ID ?? ''
  const redirectUri = c.env.ML_REDIRECT_URI ?? `${c.env.APP_BASE_URL}/api/ml/auth/callback`
  const url = `${ML_AUTH}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`
  return c.json({ url })
})

// ---------------------------------------------------------------------------
// GET /api/ml/auth/callback — troca code por tokens e salva no DB
// ---------------------------------------------------------------------------
app.get('/auth/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.json({ error: 'Codigo ausente' }, 400)

  const redirectUri = c.env.ML_REDIRECT_URI ?? `${c.env.APP_BASE_URL}/api/ml/auth/callback`
  const res = await fetch(`${ML_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: c.env.ML_CLIENT_ID ?? '',
      client_secret: c.env.ML_CLIENT_SECRET ?? '',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[ml callback] erro token:', err)
    return c.json({ error: 'Falha ao obter token' }, 502)
  }

  const data = await res.json() as {
    access_token: string; refresh_token: string; expires_in: number; user_id: number
  }

  const db = getDb(c.env.DB)
  await db.delete(mlConfig)
  await db.insert(mlConfig).values({
    id: 1,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    mlUserId: String(data.user_id),
  })

  // Redireciona para o painel admin ML
  return c.redirect(`${c.env.APP_BASE_URL}/admin/ml?connected=1`)
})

// ---------------------------------------------------------------------------
// GET /api/ml/products — lista produtos com status ML
// ---------------------------------------------------------------------------
app.get('/products', async (c) => {
  const db = getDb(c.env.DB)
  const allProducts = await db.select().from(products)
  const listings = await db.select().from(mlListings)
  const listingMap = Object.fromEntries(listings.map((l) => [l.productId, l]))

  return c.json(allProducts.map((p) => ({
    ...p,
    mlListing: listingMap[p.id] ?? null,
  })))
})

// ---------------------------------------------------------------------------
// POST /api/ml/products/:id/publish — publica produto no ML
// ---------------------------------------------------------------------------
app.post('/products/:id/publish', async (c) => {
  const db = getDb(c.env.DB)
  const productId = Number(c.req.param('id'))
  if (!Number.isInteger(productId) || productId < 1) {
    return c.json({ error: 'ID invalido' }, 400)
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1)
  if (!product) return c.json({ error: 'Produto nao encontrado' }, 404)
  if (!product.price || product.price <= 0) return c.json({ error: 'Produto sem preco definido' }, 400)

  // Verificar se já está publicado
  const [existing] = await db.select().from(mlListings).where(eq(mlListings.productId, productId)).limit(1)
  if (existing) return c.json({ error: 'Produto ja publicado no ML', mlItemId: existing.mlItemId }, 409)

  let token: string
  try { token = await getValidToken(db, c.env) } catch {
    return c.json({ error: 'ML nao conectado. Conecte sua conta primeiro.' }, 403)
  }

  const categoryMap: Record<string, string> = {
    espeto:        'MLB271837',  // Espetos para Assar
    grelha:        'MLB271837',  // Espetos para Assar (mais próximo)
    churrasqueira: 'MLB189849',  // Churrasqueiras a Carvão
    acessorio:     'MLB31036',   // Kit para Churrasco
    kit:           'MLB31036',   // Kit para Churrasco
  }
  const categoryId = c.env.ML_CATEGORY_ID || categoryMap[product.category] || 'MLB271837'

  // Converte dimensões com fallback seguro contra null/NaN do D1
  const safeDim = (v: unknown, def: number) => {
    const n = Number(v)
    return isNaN(n) || n <= 0 ? def : Math.round(n)
  }

  const payload: Record<string, unknown> = {
    title: product.name,
    category_id: categoryId,
    price: product.price,
    currency_id: 'BRL',
    available_quantity: product.inStock ? 1 : 0,
    listing_type_id: 'bronze',
    condition: 'new',
    attributes: [
      { id: 'BRAND',        value_name: 'Brasa Premium' },
      { id: 'MODEL',        value_name: product.name },
      { id: 'TOTAL_LENGTH', value_name: `${safeDim(product.lengthCm, 30)} cm` },
    ],
  }
  if (product.imageUrl) {
    const imgUrl = product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${c.env.APP_BASE_URL}${product.imageUrl}`
    payload.pictures = [{ source: imgUrl }]
  }

  const mlRes = await fetch(`${ML_API}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!mlRes.ok) {
    const err = await mlRes.json()
    console.error('[ml publish]', err)
    return c.json({ error: 'Erro ao publicar no ML', detail: err }, 502)
  }

  const item = await mlRes.json() as { id: string; permalink: string; status: string }

  // Salvar description separadamente (API do ML exige endpoint separado)
  if (product.description) {
    await fetch(`${ML_API}/items/${item.id}/description`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ plain_text: product.description }),
    }).catch(() => {})
  }

  await db.insert(mlListings).values({
    productId,
    mlItemId: item.id,
    mlStatus: item.status,
    mlUrl: item.permalink,
  })

  return c.json({ mlItemId: item.id, mlUrl: item.permalink, mlStatus: item.status })
})

// ---------------------------------------------------------------------------
// PUT /api/ml/products/:id/sync — sincroniza preço e estoque
// ---------------------------------------------------------------------------
app.put('/products/:id/sync', async (c) => {
  const db = getDb(c.env.DB)
  const productId = Number(c.req.param('id'))

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1)
  if (!product) return c.json({ error: 'Produto nao encontrado' }, 404)

  const [listing] = await db.select().from(mlListings).where(eq(mlListings.productId, productId)).limit(1)
  if (!listing) return c.json({ error: 'Produto nao publicado no ML' }, 404)

  let token: string
  try { token = await getValidToken(db, c.env) } catch {
    return c.json({ error: 'ML nao conectado' }, 403)
  }

  const mlRes = await fetch(`${ML_API}/items/${listing.mlItemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price: product.price,
      available_quantity: product.inStock ? 1 : 0,
    }),
  })

  if (!mlRes.ok) {
    const err = await mlRes.json()
    return c.json({ error: 'Erro ao sincronizar', detail: err }, 502)
  }

  await db.update(mlListings).set({ mlStatus: product.inStock ? 'active' : 'paused' })
    .where(eq(mlListings.productId, productId))

  return c.json({ ok: true, synced: { price: product.price, inStock: product.inStock } })
})

// ---------------------------------------------------------------------------
// DELETE /api/ml/products/:id/listing — pausa listing no ML
// ---------------------------------------------------------------------------
app.delete('/products/:id/listing', async (c) => {
  const db = getDb(c.env.DB)
  const productId = Number(c.req.param('id'))

  const [listing] = await db.select().from(mlListings).where(eq(mlListings.productId, productId)).limit(1)
  if (!listing) return c.json({ error: 'Listing nao encontrado' }, 404)

  let token: string
  try { token = await getValidToken(db, c.env) } catch {
    return c.json({ error: 'ML nao conectado' }, 403)
  }

  await fetch(`${ML_API}/items/${listing.mlItemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'paused' }),
  })

  await db.update(mlListings).set({ mlStatus: 'paused' }).where(eq(mlListings.productId, productId))
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// POST /api/ml/webhook — notificações de pedidos do Mercado Livre
// ---------------------------------------------------------------------------
app.post('/webhook', async (c) => {
  try {
    const db = getDb(c.env.DB)

    // Validar assinatura se secret configurado
    const secret = c.env.ML_WEBHOOK_SECRET ?? ''
    if (secret) {
      const xSignature = c.req.header('x-signature') ?? ''
      const xRequestId = c.req.header('x-request-id') ?? ''
      const dataId = c.req.query('data.id') ?? ''
      const parts = Object.fromEntries(xSignature.split(',').map((p) => p.trim().split('=')))
      const ts = parts['ts'], v1 = parts['v1']
      if (ts && v1) {
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const enc = new TextEncoder()
        const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
        const sig = await crypto.subtle.sign('HMAC', key, enc.encode(manifest))
        const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
        if (!(await safeCompare(expected, v1))) {
          console.error('[ml webhook] assinatura invalida')
          return c.json({ ok: true })
        }
      }
    }

    const body = await c.req.json<{ topic: string; resource: string; user_id: number }>().catch(() => null)
    if (!body || body.topic !== 'orders_v2') return c.json({ ok: true })

    let token: string
    try { token = await getValidToken(db, c.env) } catch {
      return c.json({ ok: true })
    }

    // Buscar detalhes do pedido no ML
    const orderRes = await fetch(`${ML_API}${body.resource}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!orderRes.ok) return c.json({ ok: true })

    const mlOrder = await orderRes.json() as {
      id: number
      status: string
      buyer: { first_name: string; last_name: string; email: string }
      order_items: Array<{ item: { id: string }; quantity: number; unit_price: number }>
      total_amount: number
    }

    if (mlOrder.status !== 'paid') return c.json({ ok: true })

    // Mapear item ML → produto local
    const mlItemIds = mlOrder.order_items.map((i) => i.item.id)
    const listings = await db.select().from(mlListings)
    const listingMap = Object.fromEntries(listings.map((l) => [l.mlItemId, l.productId]))

    const items = mlOrder.order_items
      .filter((i) => listingMap[i.item.id])
      .map((i) => ({ productId: listingMap[i.item.id], quantity: i.quantity, unitPrice: i.unit_price }))

    if (items.length === 0) return c.json({ ok: true })

    const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

    const [newOrder] = await db.insert(orders).values({
      customerName: `${mlOrder.buyer.first_name} ${mlOrder.buyer.last_name}`.trim(),
      customerEmail: mlOrder.buyer.email,
      customerPhone: '',
      status: 'paid',
      totalAmount,
      notes: `Pedido ML #${mlOrder.id}`,
      mpPaymentId: String(mlOrder.id),
      mpPaymentStatus: 'approved',
    }).returning({ id: orders.id })

    await db.insert(orderItems).values(
      items.map((i) => ({ orderId: newOrder.id, productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
    )

    console.log(`[ml webhook] pedido ML #${mlOrder.id} → order local #${newOrder.id}`)
    return c.json({ ok: true })
  } catch (err) {
    console.error('[ml webhook]', err)
    return c.json({ ok: true })
  }
})

export default app
