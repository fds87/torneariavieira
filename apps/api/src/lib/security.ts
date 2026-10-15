// ─── Timing-safe comparison ───────────────────────────────────────────────
// Compara duas strings em tempo constante via HMAC-SHA256 com chave aleatória.
// Previne timing attacks que poderiam vazar caracteres da string esperada.

export async function safeCompare(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    crypto.getRandomValues(new Uint8Array(32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(a)),
    crypto.subtle.sign('HMAC', key, enc.encode(b)),
  ])
  const ua = new Uint8Array(sigA)
  const ub = new Uint8Array(sigB)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

// ─── Mercado Pago webhook signature ──────────────────────────────────────
// Verifica HMAC-SHA256 do header x-signature contra manifest computado.
// Manifest: id:{dataId};request-id:{xRequestId};ts:{ts};

export async function verifyMpWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.trim().split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(manifest))
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')

  if (expected.length !== v1.length) return false
  const eA = enc.encode(expected), eB = enc.encode(v1)
  let diff = 0
  for (let i = 0; i < eA.length; i++) diff |= eA[i] ^ eB[i]
  return diff === 0
}

// ─── Helper para gerar assinatura MP (uso em testes / mocks) ─────────────

export async function signMpManifest(
  dataId: string,
  xRequestId: string,
  ts: string,
  secret: string,
): Promise<string> {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(manifest))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
