import { Hono } from 'hono'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import { products } from '../db/schema.js'
import type { Bindings } from '../types.js'

const freight = new Hono<{ Bindings: Bindings }>()

const ORIGIN_CEP = '01310-000'

function getRegion(cepPrefix: number): number {
  if (cepPrefix >= 0 && cepPrefix <= 19) return 1
  if (cepPrefix >= 20 && cepPrefix <= 39) return 2
  if (cepPrefix >= 80 && cepPrefix <= 89) return 2
  if (cepPrefix >= 70 && cepPrefix <= 79) return 3
  if (cepPrefix >= 90 && cepPrefix <= 99) return 3
  if (cepPrefix >= 64 && cepPrefix <= 69) return 5
  if (cepPrefix >= 40 && cepPrefix <= 69) return 4
  return 3
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// POST /api/freight/calculate
freight.post('/calculate', async (c) => {
  let body: { cep?: string; items?: Array<{ productId: number; quantity: number }> }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const { cep, items } = body

  if (!cep || !items || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'cep e items são obrigatórios' }, 400)
  }

  // Validate CEP
  const cepDigits = cep.replace(/\D/g, '')
  if (cepDigits.length < 8) {
    return c.json({ error: 'CEP inválido: deve conter 8 dígitos' }, 400)
  }

  try {
    const db = getDb(c.env.DB)

    let totalWeightG = 0
    let totalCubicWeightKg = 0

    const productIds = items.map((i) => i.productId)
    const productRows = await db.select().from(products).where(inArray(products.id, productIds)).all()
    const productMap = new Map(productRows.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) return c.json({ error: `Produto ${item.productId} não encontrado` }, 400)

      const weightG = product.weightG ?? 500
      const lengthCm = product.lengthCm ?? 30
      const widthCm = product.widthCm ?? 20
      const heightCm = product.heightCm ?? 10

      totalWeightG += weightG * item.quantity
      const cubicKg = ((lengthCm * widthCm * heightCm) / 6000) * item.quantity
      totalCubicWeightKg += cubicKg
    }

    const totalWeightKg = totalWeightG / 1000
    const effectiveWeightKg = Math.max(totalWeightKg, totalCubicWeightKg)
    const baseWeightKg = Math.max(0.3, effectiveWeightKg)

    const cepPrefix = Number(cepDigits.substring(0, 2))
    const region = getRegion(cepPrefix)

    const pacPrice = round2((8.0 + baseWeightKg * 3.5) * (1 + region * 0.18))
    const sedexPrice = round2((14.0 + baseWeightKg * 8.0) * (1 + region * 0.22))
    const pacDays = 4 + region * 2
    const sedexDays = 1 + region

    return c.json({
      options: [
        { service: 'PAC', price: pacPrice, days: pacDays },
        { service: 'SEDEX', price: sedexPrice, days: sedexDays },
      ],
      originCep: ORIGIN_CEP,
      destinyCep: cepDigits,
    })
  } catch (err) {
    console.error('[POST /api/freight/calculate]', err)
    return c.json({ error: 'Erro ao calcular frete' }, 500)
  }
})

export default freight
