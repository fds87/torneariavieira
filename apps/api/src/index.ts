import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import paymentsRoutes from './routes/payments.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import accountRoutes from './routes/account.js'
import freightRoutes from './routes/freight.js'
import mlRoutes from './routes/ml.js'
import type { Bindings } from './types.js'

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) return null
      // Allow localhost variants for dev and the production domain
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === 'https://torneariavieiraoficial.com.br' ||
        origin === 'https://www.torneariavieiraoficial.com.br' ||
        origin === 'https://torneariavieira.pages.dev'
      ) {
        return origin
      }
      return null
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'x-admin-key', 'Authorization'],
    credentials: true,
    exposeHeaders: [],
    maxAge: 600,
  }),
)

app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=63072000; includeSubDomains',
  crossOriginResourcePolicy: 'cross-origin',
}))

app.use('/api/*', async (c, next) => {
  const contentLength = Number(c.req.header('content-length') ?? 0)
  if (contentLength > 1_048_576) return c.json({ error: 'Payload muito grande' }, 413)
  await next()
})

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/products', productsRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/payments', paymentsRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/account', accountRoutes)
app.route('/api/freight', freightRoutes)
app.route('/api/ml', mlRoutes)

export default app
