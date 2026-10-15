import { Hono } from 'hono'
import { getDb } from '../db/index.js'
import { products } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { Bindings } from '../types.js'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const category = c.req.query('category')

    const result = category
      ? await db.select().from(products).where(eq(products.category, category))
      : await db.select().from(products)

    return c.json(result)
  } catch (err) {
    console.error('[products GET /]', err)
    return c.json({ error: 'Erro ao buscar produtos' }, 500)
  }
})

app.get('/:slug', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const slug = c.req.param('slug')

    if (!slug || slug.trim() === '') {
      return c.json({ error: 'Slug invalido' }, 400)
    }

    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1)

    if (!result) {
      return c.json({ error: 'Produto nao encontrado' }, 404)
    }

    return c.json(result)
  } catch (err) {
    console.error('[products GET /:slug]', err)
    return c.json({ error: 'Erro ao buscar produto' }, 500)
  }
})

export default app
