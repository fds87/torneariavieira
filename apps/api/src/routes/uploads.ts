import { Hono } from 'hono'
import type { Bindings } from '../types.js'

const app = new Hono<{ Bindings: Bindings }>()

// Servir imagens do R2 publicamente. Montado em /api/uploads.
// Ex: GET /api/uploads/products/abc123.jpg
app.get('/*', async (c) => {
  if (!c.env.BUCKET) return c.json({ error: 'Armazenamento indisponivel' }, 503)

  const key = c.req.path.replace(/^\/api\/uploads\//, '')
  if (!key) return c.json({ error: 'Nao encontrado' }, 404)

  const obj = await c.env.BUCKET.get(key)
  if (!obj) return c.json({ error: 'Nao encontrado' }, 404)

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new Response(obj.body, { headers })
})

export default app
