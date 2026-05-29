import { describe, it, expect } from 'vitest'
import { safeCompare, verifyMpWebhookSignature, signMpManifest } from '../lib/security.js'

describe('safeCompare (timing-safe)', () => {
  it('retorna true para strings iguais', async () => {
    expect(await safeCompare('abc123', 'abc123')).toBe(true)
  })

  it('retorna false para strings diferentes', async () => {
    expect(await safeCompare('abc123', 'abc124')).toBe(false)
  })

  it('retorna false para strings de tamanhos diferentes', async () => {
    expect(await safeCompare('abc', 'abcdef')).toBe(false)
  })

  it('retorna true para strings vazias', async () => {
    expect(await safeCompare('', '')).toBe(true)
  })

  it('retorna false comparando vazia com não-vazia', async () => {
    expect(await safeCompare('', 'x')).toBe(false)
    expect(await safeCompare('x', '')).toBe(false)
  })

  it('aceita unicode', async () => {
    expect(await safeCompare('🔥abc', '🔥abc')).toBe(true)
    expect(await safeCompare('🔥abc', '🔥abd')).toBe(false)
  })

  it('detecta diferença no primeiro caractere', async () => {
    expect(await safeCompare('xbc', 'abc')).toBe(false)
  })

  it('detecta diferença no último caractere', async () => {
    expect(await safeCompare('abc', 'abx')).toBe(false)
  })
})

describe('verifyMpWebhookSignature', () => {
  const secret = 'mp-webhook-test-secret'
  const dataId = '12345'
  const requestId = 'req-abc-xyz'
  const ts = '1700000000'

  it('aceita assinatura válida', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, secret)
    const xSig = `ts=${ts},v1=${v1}`
    expect(await verifyMpWebhookSignature(xSig, requestId, dataId, secret)).toBe(true)
  })

  it('rejeita assinatura com secret errado', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, 'secret-errado')
    const xSig = `ts=${ts},v1=${v1}`
    expect(await verifyMpWebhookSignature(xSig, requestId, dataId, secret)).toBe(false)
  })

  it('rejeita assinatura com dataId tamperado', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, secret)
    const xSig = `ts=${ts},v1=${v1}`
    expect(await verifyMpWebhookSignature(xSig, requestId, 'OUTRO_ID', secret)).toBe(false)
  })

  it('rejeita assinatura com requestId tamperado', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, secret)
    const xSig = `ts=${ts},v1=${v1}`
    expect(await verifyMpWebhookSignature(xSig, 'outro-request', dataId, secret)).toBe(false)
  })

  it('rejeita assinatura com ts tamperado', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, secret)
    const xSig = `ts=999999,v1=${v1}` // ts diferente do que foi assinado
    expect(await verifyMpWebhookSignature(xSig, requestId, dataId, secret)).toBe(false)
  })

  it('rejeita header sem ts', async () => {
    expect(await verifyMpWebhookSignature('v1=abc', requestId, dataId, secret)).toBe(false)
  })

  it('rejeita header sem v1', async () => {
    expect(await verifyMpWebhookSignature('ts=123', requestId, dataId, secret)).toBe(false)
  })

  it('rejeita header vazio', async () => {
    expect(await verifyMpWebhookSignature('', requestId, dataId, secret)).toBe(false)
  })

  it('rejeita assinatura malformada', async () => {
    const xSig = `ts=${ts},v1=DEADBEEF`
    expect(await verifyMpWebhookSignature(xSig, requestId, dataId, secret)).toBe(false)
  })

  it('aceita parts em ordem invertida', async () => {
    const v1 = await signMpManifest(dataId, requestId, ts, secret)
    const xSig = `v1=${v1},ts=${ts}` // v1 primeiro
    expect(await verifyMpWebhookSignature(xSig, requestId, dataId, secret)).toBe(true)
  })
})
