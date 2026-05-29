import { Hono } from 'hono'
import { getDb } from '../db/index.js'
import { orders, orderItems, products } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
import type { Bindings } from '../types.js'
import { sendEmail, orderConfirmationEmail, paymentConfirmedEmail } from '../lib/email.js'

const app = new Hono<{ Bindings: Bindings }>()

// ---------------------------------------------------------------------------
// Helper — valida itens e cria order + orderItems em transacao
// ---------------------------------------------------------------------------
async function createOrderInDb(
  db: ReturnType<typeof getDb>,
  params: {
    customer: { name: string; email: string; phone: string; city?: string; state?: string }
    items: Array<{ productId: number; quantity: number }>
    shippingCep?: string
    shippingStreet?: string
    shippingNumber?: string
    shippingComplement?: string
    shippingNeighborhood?: string
    userId?: number
    addressId?: number
    notes?: string
  },
) {
  const { customer, items, shippingCep, shippingStreet, shippingNumber, shippingComplement, shippingNeighborhood, userId, addressId, notes } = params

  let totalAmount = 0
  const resolvedItems: Array<{ productId: number; quantity: number; unitPrice: number; name: string }> = []

  const productIds = items.map((i) => i.productId)
  const productRows = await db.select().from(products).where(inArray(products.id, productIds)).all()
  const productMap = new Map(productRows.map((p) => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) throw { status: 400, error: `Produto ${item.productId} nao encontrado` }
    if (!product.inStock) throw { status: 400, error: `Produto "${product.name}" nao disponivel` }
    resolvedItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price, name: product.name })
    totalAmount += product.price * item.quantity
  }

  const order = await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(orders)
      .values({
        userId: userId ?? null,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        customerPhone: customer.phone.trim(),
        customerCity: customer.city?.trim(),
        customerState: customer.state?.trim(),
        shippingCep: shippingCep?.trim() ?? null,
        shippingStreet: shippingStreet?.trim() ?? null,
        shippingNumber: shippingNumber?.trim() ?? null,
        shippingComplement: shippingComplement?.trim() ?? null,
        shippingNeighborhood: shippingNeighborhood?.trim() ?? null,
        shippingAddressId: addressId ?? null,
        totalAmount,
        notes: notes?.trim(),
        status: 'pending_payment',
      })
      .returning()

    for (const item of resolvedItems) {
      await tx.insert(orderItems).values({
        orderId: o!.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })
    }

    return o!
  })

  return { order, resolvedItems, totalAmount }
}

// ---------------------------------------------------------------------------
// GET /config — retorna chave publica MP e flag de mock mode
// ---------------------------------------------------------------------------
app.get('/config', (c) => {
  const publicKey = c.env.MP_PUBLIC_KEY ?? ''
  const accessToken = c.env.MP_ACCESS_TOKEN ?? ''
  const IS_DEV = c.env.NODE_ENV !== 'production'
  const isMock = IS_DEV && (!accessToken || accessToken.includes('0000000'))
  return c.json({ publicKey, mock: isMock })
})

// ---------------------------------------------------------------------------
// POST /process — pagamento transparente (cartao ou PIX)
// ---------------------------------------------------------------------------
app.post('/process', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const MP_ACCESS_TOKEN = c.env.MP_ACCESS_TOKEN ?? ''
    const APP_BASE_URL = c.env.APP_BASE_URL ?? 'http://localhost:5173'
    const IS_DEV = c.env.NODE_ENV !== 'production'
    const isMock = IS_DEV && (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.includes('0000000'))

    const body = await c.req.json<{
      customer: { name: string; email: string; phone: string; city?: string; state?: string }
      items: Array<{ productId: number; quantity: number }>
      shipping?: { cep?: string; street?: string; number?: string; complement?: string; neighborhood?: string }
      userId?: number
      addressId?: number
      notes?: string
      formData: Record<string, unknown>
    }>().catch(() => null)

    if (!body) return c.json({ error: 'Corpo da requisicao invalido ou ausente' }, 400)

    const { customer, items, shipping, userId, addressId, notes, formData } = body

    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return c.json({ error: 'Nome, email e telefone sao obrigatorios' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return c.json({ error: 'Email invalido' }, 400)
    }
    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Pedido deve ter ao menos um item' }, 400)
    }
    if (items.length > 50) {
      return c.json({ error: 'Maximo de 50 itens por pedido' }, 400)
    }
    for (const item of items) {
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        return c.json({ error: 'productId invalido em um dos itens' }, 400)
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return c.json({ error: `Quantidade invalida para produto ${item.productId}` }, 400)
      }
    }

    let order: Awaited<ReturnType<typeof createOrderInDb>>['order']
    let totalAmount: number
    let resolvedItems: Awaited<ReturnType<typeof createOrderInDb>>['resolvedItems']

    try {
      const result = await createOrderInDb(db, {
        customer,
        items,
        shippingCep: shipping?.cep,
        shippingStreet: shipping?.street,
        shippingNumber: shipping?.number,
        shippingComplement: shipping?.complement,
        shippingNeighborhood: shipping?.neighborhood,
        userId,
        addressId,
        notes,
      })
      order = result.order
      totalAmount = result.totalAmount
      resolvedItems = result.resolvedItems
    } catch (err: unknown) {
      const e = err as { status?: number; error?: string }
      if (e.status && e.error) return c.json({ error: e.error }, e.status as 400)
      throw err
    }

    // ------------------------------------------------------------------
    // Mock mode — sem chamada real ao MP
    // ------------------------------------------------------------------
    if (isMock) {
      const mockPaymentId = `MOCK-PAY-${order.id}-${Date.now()}`
      const paymentMethodId = (formData.payment_method_id as string) ?? 'pix'
      const isPix = paymentMethodId === 'pix'
      const isMockRejected = (formData as Record<string, unknown>).__mock_rejected === true

      const mockStatus = isMockRejected ? 'rejected' : isPix ? 'pending' : 'approved'
      const dbStatus = mockStatus === 'approved' ? 'paid' : mockStatus === 'rejected' ? 'cancelled' : 'pending_payment'

      await db.update(orders).set({
        mpPaymentId: mockPaymentId,
        mpPaymentStatus: mockStatus,
        status: dbStatus,
      }).where(eq(orders.id, order.id))

      const response: Record<string, unknown> = {
        orderId: order.id,
        paymentId: mockPaymentId,
        status: mockStatus,
        statusDetail: mockStatus === 'approved' ? 'accredited' : mockStatus === 'pending' ? 'pending_waiting_transfer' : 'cc_rejected_other_reason',
        mock: true,
      }

      if (isPix && !isMockRejected) {
        // QR code mock: imagem PNG 1x1 pixel branco em base64
        response.pixQrCode = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=='
        response.pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136MOCK-${order.id}@forjabrasa.com.br5204000053039865802BR5913Brasa Premium6009Sao Paulo62070503***6304MOCK`
        response.pixExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      // Enviar e-mail de confirmação de pedido (fire-and-forget)
      const emailFrom = c.env.EMAIL_FROM ?? 'Brasa Premium <noreply@forjabrasa.com.br>'
      sendEmail(
        {
          to: customer.email.trim().toLowerCase(),
          subject: `Pedido #${order.id} recebido — Brasa Premium`,
          html: orderConfirmationEmail({
            orderId: order.id,
            customerName: customer.name.trim(),
            customerEmail: customer.email.trim().toLowerCase(),
            items: resolvedItems.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
            totalAmount,
          }),
        },
        c.env.RESEND_API_KEY ?? '',
        emailFrom,
      ).catch((e) => console.error('[email] order confirmation failed:', e))

      if (mockStatus === 'approved') {
        sendEmail(
          {
            to: customer.email.trim().toLowerCase(),
            subject: `Pagamento aprovado — Pedido #${order.id}`,
            html: paymentConfirmedEmail({ orderId: order.id, customerName: customer.name.trim(), totalAmount }),
          },
          c.env.RESEND_API_KEY ?? '',
          emailFrom,
        ).catch((e) => console.error('[email] payment confirmed failed:', e))
      }

      return c.json(response)
    }

    // ------------------------------------------------------------------
    // Modo real — chamar MP /v1/payments
    // ------------------------------------------------------------------
    const paymentMethodId = (formData.payment_method_id as string) ?? ''
    const isPix = paymentMethodId === 'pix'

    const nameParts = customer.name.trim().split(' ')
    const firstName = nameParts[0] ?? customer.name.trim()
    const lastName = nameParts.slice(1).join(' ') || firstName

    const isLocalhost = APP_BASE_URL.includes('localhost') || APP_BASE_URL.includes('127.0.0.1')
    const mpPayload: Record<string, unknown> = {
      transaction_amount: totalAmount,
      description: `Brasa Premium - Pedido #${order.id}`,
      external_reference: String(order.id),
      ...(isLocalhost ? {} : { notification_url: `${APP_BASE_URL}/api/payments/webhook` }),
      statement_descriptor: 'Brasa Premium',
      payer: {
        email: customer.email.trim().toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        ...(((formData.payer as Record<string, unknown>)?.identification)
          ? { identification: (formData.payer as Record<string, unknown>).identification }
          : {}),
      },
    }

    if (isPix) {
      mpPayload.payment_method_id = 'pix'
    } else {
      // Cartao de credito/debito
      mpPayload.token = formData.token
      mpPayload.payment_method_id = formData.payment_method_id
      mpPayload.installments = formData.installments ?? 1
      if (formData.issuer_id) mpPayload.issuer_id = formData.issuer_id
    }

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `order-${order.id}`,
      },
      body: JSON.stringify(mpPayload),
    })

    if (!mpRes.ok) {
      const mpErr = await mpRes.json().catch(() => ({}))
      console.error('[payments POST /process] Erro MP:', JSON.stringify(mpErr, null, 2))
      return c.json({ error: 'Erro ao processar pagamento. Tente novamente.' }, 502)
    }

    const payment = (await mpRes.json()) as {
      id: number
      status: string
      status_detail: string
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string
          qr_code_base64?: string
          ticket_url?: string
        }
      }
      date_of_expiration?: string
    }

    const mpStatus = payment.status
    const dbStatus =
      mpStatus === 'approved' ? 'paid' :
      mpStatus === 'rejected' || mpStatus === 'cancelled' ? 'cancelled' :
      'pending_payment'

    await db.update(orders).set({
      mpPaymentId: String(payment.id),
      mpPaymentStatus: mpStatus,
      status: dbStatus,
    }).where(eq(orders.id, order.id))

    const emailFrom = c.env.EMAIL_FROM ?? 'Brasa Premium <noreply@forjabrasa.com.br>'

    sendEmail(
      {
        to: customer.email.trim().toLowerCase(),
        subject: `Pedido #${order.id} recebido — Brasa Premium`,
        html: orderConfirmationEmail({
          orderId: order.id,
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          items: resolvedItems.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
          totalAmount,
        }),
      },
      c.env.RESEND_API_KEY ?? '',
      emailFrom,
    ).catch((e) => console.error('[email] order confirmation failed:', e))

    if (mpStatus === 'approved') {
      sendEmail(
        {
          to: customer.email.trim().toLowerCase(),
          subject: `Pagamento aprovado — Pedido #${order.id}`,
          html: paymentConfirmedEmail({ orderId: order.id, customerName: customer.name.trim(), totalAmount }),
        },
        c.env.RESEND_API_KEY ?? '',
        emailFrom,
      ).catch((e) => console.error('[email] payment confirmed failed:', e))
    }

    const response: Record<string, unknown> = {
      orderId: order.id,
      paymentId: String(payment.id),
      status: mpStatus,
      statusDetail: payment.status_detail,
      mock: false,
    }

    if (isPix && payment.point_of_interaction?.transaction_data) {
      const td = payment.point_of_interaction.transaction_data
      response.pixQrCode = td.qr_code_base64
      response.pixCopyPaste = td.qr_code
      response.pixExpiresAt = payment.date_of_expiration
    }

    return c.json(response)
  } catch (err) {
    console.error('[payments POST /process]', err)
    return c.json({ error: 'Erro interno ao processar pagamento' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /status/:orderId — consulta status do pedido (para polling do PIX)
// ---------------------------------------------------------------------------
app.get('/status/:orderId', async (c) => {
  const orderId = Number(c.req.param('orderId'))
  if (!Number.isInteger(orderId) || orderId < 1) {
    return c.json({ error: 'orderId invalido' }, 400)
  }
  try {
    const db = getDb(c.env.DB)
    const [order] = await db
      .select({ id: orders.id, status: orders.status, mpPaymentStatus: orders.mpPaymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) return c.json({ error: 'Pedido nao encontrado' }, 404)
    return c.json(order)
  } catch (err) {
    console.error('[payments GET /status]', err)
    return c.json({ error: 'Erro interno' }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /preference — mantido para compatibilidade
// ---------------------------------------------------------------------------
app.post('/preference', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const MP_ACCESS_TOKEN = c.env.MP_ACCESS_TOKEN ?? ''
    const APP_BASE_URL = c.env.APP_BASE_URL ?? 'http://localhost:5173'
    const IS_DEV = c.env.NODE_ENV !== 'production'

    const body = await c.req.json<{
      customer: { name: string; email: string; phone: string; city?: string; state?: string }
      items: Array<{ productId: number; quantity: number }>
      notes?: string
      shippingCep?: string
      shippingStreet?: string
      shippingNumber?: string
      shippingComplement?: string
      shippingNeighborhood?: string
      userId?: number
      addressId?: number
    }>().catch(() => null)

    if (!body) {
      return c.json({ error: 'Corpo da requisicao invalido ou ausente' }, 400)
    }

    const { customer, items, notes, shippingCep, shippingStreet, shippingNumber, shippingComplement, shippingNeighborhood, userId, addressId } = body

    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return c.json({ error: 'Nome, email e telefone sao obrigatorios' }, 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return c.json({ error: 'Email invalido' }, 400)
    }

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Pedido deve ter ao menos um item' }, 400)
    }

    for (const item of items) {
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        return c.json({ error: 'productId invalido em um dos itens' }, 400)
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return c.json({ error: `Quantidade invalida para produto ${item.productId}` }, 400)
      }
    }

    let order: Awaited<ReturnType<typeof createOrderInDb>>['order']
    let resolvedItems: Awaited<ReturnType<typeof createOrderInDb>>['resolvedItems']

    try {
      const result = await createOrderInDb(db, {
        customer, items, shippingCep, shippingStreet, shippingNumber,
        shippingComplement, shippingNeighborhood, userId, addressId, notes,
      })
      order = result.order
      resolvedItems = result.resolvedItems
    } catch (err: unknown) {
      const e = err as { status?: number; error?: string }
      if (e.status && e.error) return c.json({ error: e.error }, e.status as 400)
      throw err
    }

    const preferencePayload = {
      items: resolvedItems.map((item) => ({
        id: String(item.productId),
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'BRL',
      })),
      payer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: { number: customer.phone.trim() },
      },
      back_urls: {
        success: `${APP_BASE_URL}/pagamento/sucesso`,
        failure: `${APP_BASE_URL}/pagamento/falha`,
        pending: `${APP_BASE_URL}/pagamento/pendente`,
      },
      auto_return: 'approved',
      external_reference: String(order.id),
      statement_descriptor: 'Brasa Premium',
      notification_url: `${APP_BASE_URL}/api/payments/webhook`,
    }

    if (IS_DEV && (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.includes('0000000'))) {
      const mockPreferenceId = `MOCK-${order.id}-${Date.now()}`
      await db.update(orders).set({ mpPreferenceId: mockPreferenceId }).where(eq(orders.id, order.id))

      return c.json({
        orderId: order.id,
        preferenceId: mockPreferenceId,
        init_point: `${APP_BASE_URL}/pagamento/sucesso?payment_id=mock&collection_status=approved&external_reference=${order.id}`,
        sandbox_init_point: `${APP_BASE_URL}/pagamento/sucesso?payment_id=mock&collection_status=approved&external_reference=${order.id}`,
        mock: true,
      })
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferencePayload),
    })

    if (!mpResponse.ok) {
      console.error('[payments POST /preference] Erro MP:', await mpResponse.json().catch(() => ({})))
      return c.json({ error: 'Erro ao iniciar pagamento. Tente novamente.' }, 502)
    }

    const preference = (await mpResponse.json()) as {
      id: string
      init_point: string
      sandbox_init_point: string
    }

    await db.update(orders).set({ mpPreferenceId: preference.id }).where(eq(orders.id, order.id))

    return c.json({
      orderId: order.id,
      preferenceId: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      mock: false,
    })
  } catch (err) {
    console.error('[payments POST /preference]', err)
    return c.json({ error: 'Erro interno ao processar pagamento' }, 500)
  }
})

// ---------------------------------------------------------------------------
// Verifica assinatura HMAC-SHA256 do webhook do Mercado Pago
// Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
// ---------------------------------------------------------------------------
async function verifyMpWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
): Promise<boolean> {
  // Extrair ts e v1 do header x-signature
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.trim().split('=')))
  const ts = parts['ts'], v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(manifest))
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')

  // Timing-safe comparison
  if (expected.length !== v1.length) return false
  const encA = enc.encode(expected), encB = enc.encode(v1)
  let diff = 0
  for (let i = 0; i < encA.length; i++) diff |= encA[i] ^ encB[i]
  return diff === 0
}

// ---------------------------------------------------------------------------
// POST /webhook — notificacoes do Mercado Pago
// ---------------------------------------------------------------------------
app.post('/webhook', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const MP_ACCESS_TOKEN = c.env.MP_ACCESS_TOKEN ?? ''
    const MP_WEBHOOK_SECRET = c.env.MP_WEBHOOK_SECRET ?? ''

    // Validar assinatura quando secret estiver configurado
    if (MP_WEBHOOK_SECRET) {
      const xSignature = c.req.header('x-signature') ?? ''
      const xRequestId = c.req.header('x-request-id') ?? ''
      const dataId = c.req.query('data.id') ?? ''
      const valid = await verifyMpWebhookSignature(xSignature, xRequestId, dataId, MP_WEBHOOK_SECRET)
      if (!valid) {
        console.error('[payments webhook] Assinatura invalida')
        return c.json({ ok: true }, 200) // responder 200 para o MP nao retentar
      }
    }

    const body = await c.req.json<{ type: string; data?: { id?: string } }>().catch(() => null)
    if (!body) return c.json({ ok: true })

    if (body.type === 'payment' && body.data?.id) {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      })

      if (!mpRes.ok) {
        console.error('[payments webhook] Erro ao buscar pagamento MP:', body.data.id)
        return c.json({ ok: true })
      }

      const payment = (await mpRes.json()) as { status: string; external_reference: string }
      const orderId = Number(payment.external_reference)

      if (!Number.isInteger(orderId) || orderId < 1) {
        console.error('[payments webhook] external_reference invalido:', payment.external_reference)
        return c.json({ ok: true })
      }

      const dbStatus =
        payment.status === 'approved' ? 'paid' :
        payment.status === 'rejected' || payment.status === 'cancelled' ? 'cancelled' :
        'pending_payment'

      const [existingOrder] = await db
        .select({ customerName: orders.customerName, customerEmail: orders.customerEmail, totalAmount: orders.totalAmount, status: orders.status })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)

      await db.update(orders).set({
        mpPaymentId: body.data.id,
        mpPaymentStatus: payment.status,
        status: dbStatus,
      }).where(eq(orders.id, orderId))

      if (payment.status === 'approved' && existingOrder && existingOrder.status !== 'paid') {
        const emailFrom = c.env.EMAIL_FROM ?? 'Brasa Premium <noreply@forjabrasa.com.br>'
        sendEmail(
          {
            to: existingOrder.customerEmail,
            subject: `Pagamento aprovado — Pedido #${orderId}`,
            html: paymentConfirmedEmail({
              orderId,
              customerName: existingOrder.customerName,
              totalAmount: existingOrder.totalAmount,
            }),
          },
          c.env.RESEND_API_KEY ?? '',
          emailFrom,
        ).catch((e) => console.error('[email webhook] payment confirmed failed:', e))
      }
    }

    return c.json({ ok: true })
  } catch (err) {
    console.error('[payments webhook]', err)
    return c.json({ ok: true })
  }
})

export default app
