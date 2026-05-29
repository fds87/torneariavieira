// Email via Resend HTTP API (works on Cloudflare Workers — no Node.js required)

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(
  payload: EmailPayload,
  apiKey: string,
  from: string,
): Promise<void> {
  if (!apiKey || apiKey === 'dev') return // skip in dev without key

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[email] Resend error: ${res.status} ${body}`)
  }
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tornearia Vieira</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0c0a09; color: #e7e5e4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    a { color: #d97706; text-decoration: none; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #1c1917; border: 1px solid #292524; border-radius: 12px; overflow: hidden; }
    .header { background: #0c0a09; border-bottom: 1px solid #292524; padding: 24px 32px; }
    .header-logo { font-size: 22px; font-weight: 700; color: #f5f5f4; letter-spacing: -0.3px; }
    .header-logo span { color: #d97706; }
    .body { padding: 32px; }
    .title { font-size: 20px; font-weight: 600; color: #f5f5f4; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #a8a29e; margin-bottom: 24px; line-height: 1.5; }
    .section-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #78716c; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #292524; gap: 12px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #a8a29e; flex-shrink: 0; }
    .info-value { font-size: 13px; color: #e7e5e4; font-weight: 500; text-align: right; }
    .divider { height: 1px; background: #292524; margin: 24px 0; }
    .total-row { display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 15px; font-weight: 600; color: #f5f5f4; }
    .total-value { font-size: 20px; font-weight: 700; color: #d97706; }
    .btn { display: inline-block; background: #d97706; color: #fff !important; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 24px; }
    .badge { display: inline-block; background: #22c55e22; color: #22c55e; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; border: 1px solid #22c55e44; margin-bottom: 16px; }
    .badge-warn { background: #f59e0b22; color: #f59e0b; border-color: #f59e0b44; }
    .footer { padding: 20px 32px; border-top: 1px solid #292524; text-align: center; }
    .footer p { font-size: 12px; color: #57534e; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">Tornearia <span>Vieira</span></div>
      </div>
      ${content}
      <div class="footer">
        <p>Tornearia Vieira — Usinagem de Precisão, São José dos Pinhais — PR<br/>
        Dúvidas? Responda este e-mail ou fale via WhatsApp: (41) 99980-2662</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─── Template: Confirmação de pedido ─────────────────────────────────────────

export interface OrderConfirmationData {
  orderId: number
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  totalAmount: number
  paymentMethod?: string
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const itemRows = data.items
    .map(
      (i) => `
      <div class="info-row">
        <span class="info-label">${i.name} × ${i.quantity}</span>
        <span class="info-value">R$ ${(i.unitPrice * i.quantity).toFixed(2).replace('.', ',')}</span>
      </div>`,
    )
    .join('')

  return layout(`
    <div class="body">
      <div class="badge">Pedido confirmado</div>
      <div class="title">Recebemos seu pedido!</div>
      <div class="subtitle">
        Olá, ${data.customerName}. Seu pedido #${data.orderId} foi recebido e está sendo processado.
        Em breve você receberá a confirmação do pagamento.
      </div>

      <div class="section-label">Itens do pedido</div>
      ${itemRows}

      <div class="divider"></div>
      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="total-value">R$ ${data.totalAmount.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  `)
}

// ─── Template: Pagamento confirmado ──────────────────────────────────────────

export interface PaymentConfirmedData {
  orderId: number
  customerName: string
  totalAmount: number
}

export function paymentConfirmedEmail(data: PaymentConfirmedData): string {
  return layout(`
    <div class="body">
      <div class="badge">Pagamento aprovado</div>
      <div class="title">Pagamento confirmado!</div>
      <div class="subtitle">
        Olá, ${data.customerName}. O pagamento do pedido #${data.orderId} foi aprovado.
        Sua peça está entrando em produção — em breve você receberá o código de rastreio.
      </div>

      <div class="info-row">
        <span class="info-label">Pedido</span>
        <span class="info-value">#${data.orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Valor</span>
        <span class="info-value">R$ ${data.totalAmount.toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value" style="color:#22c55e">Aprovado</span>
      </div>
    </div>
  `)
}

// ─── Template: Pedido enviado ─────────────────────────────────────────────────

export interface OrderShippedData {
  orderId: number
  customerName: string
  trackingCode?: string
  shippingService?: string
}

export function orderShippedEmail(data: OrderShippedData): string {
  const trackingSection = data.trackingCode
    ? `
      <div class="info-row">
        <span class="info-label">Código de rastreio</span>
        <span class="info-value" style="font-family:monospace; font-size:15px; letter-spacing:1px">${data.trackingCode}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Serviço</span>
        <span class="info-value">${data.shippingService ?? 'Correios'}</span>
      </div>`
    : '<p style="color:#a8a29e; font-size:13px">Código de rastreio será enviado em breve.</p>'

  return layout(`
    <div class="body">
      <div class="badge" style="background:#3b82f622; color:#60a5fa; border-color:#3b82f644">Em trânsito</div>
      <div class="title">Seu pedido foi enviado!</div>
      <div class="subtitle">
        Olá, ${data.customerName}. O pedido #${data.orderId} saiu para entrega. Use o código abaixo para rastrear.
      </div>
      ${trackingSection}
    </div>
  `)
}

// ─── Template: Recuperação de senha ──────────────────────────────────────────

export interface PasswordResetData {
  customerName: string
  resetUrl: string
}

export function passwordResetEmail(data: PasswordResetData): string {
  return layout(`
    <div class="body">
      <div class="badge badge-warn">Recuperação de senha</div>
      <div class="title">Redefinir sua senha</div>
      <div class="subtitle">
        Olá, ${data.customerName}. Recebemos uma solicitação para redefinir a senha da sua conta.
        Clique no botão abaixo — o link é válido por 1 hora.
      </div>

      <a href="${data.resetUrl}" class="btn">Redefinir senha</a>

      <div class="divider"></div>
      <p style="font-size:12px; color:#78716c; line-height:1.5">
        Se você não solicitou isso, ignore este e-mail. Sua senha não será alterada.
      </p>
    </div>
  `)
}
