import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  generateSecureToken,
  hashToken,
} from '../lib/auth.js'

describe('hashPassword + verifyPassword', () => {
  it('aceita senha correta', async () => {
    const hash = await hashPassword('senha123segura')
    expect(await verifyPassword('senha123segura', hash)).toBe(true)
  })

  it('rejeita senha errada', async () => {
    const hash = await hashPassword('senha-original')
    expect(await verifyPassword('senha-errada', hash)).toBe(false)
  })

  it('produz hashes diferentes para a mesma senha (salt)', async () => {
    const a = await hashPassword('mesma-senha')
    const b = await hashPassword('mesma-senha')
    expect(a).not.toBe(b)
    // Mas ambos devem verificar
    expect(await verifyPassword('mesma-senha', a)).toBe(true)
    expect(await verifyPassword('mesma-senha', b)).toBe(true)
  })

  it('hash tem formato salt:hash em base64', async () => {
    const hash = await hashPassword('teste')
    expect(hash).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/)
  })

  it('rejeita hash mal-formado', async () => {
    expect(await verifyPassword('senha', 'sem-dois-pontos')).toBe(false)
    expect(await verifyPassword('senha', '')).toBe(false)
    expect(await verifyPassword('senha', ':')).toBe(false)
  })

  it('é case-sensitive', async () => {
    const hash = await hashPassword('Senha')
    expect(await verifyPassword('senha', hash)).toBe(false)
    expect(await verifyPassword('Senha', hash)).toBe(true)
  })

  it('aceita senhas com unicode', async () => {
    const hash = await hashPassword('señ@çã0🔥')
    expect(await verifyPassword('señ@çã0🔥', hash)).toBe(true)
    expect(await verifyPassword('senh@ca0', hash)).toBe(false)
  })
})

describe('JWT — signAccessToken + verifyAccessToken', () => {
  const secret = 'test-secret-must-be-long-enough-for-hs256-algorithm'

  it('round-trip: assina e verifica token', async () => {
    const token = await signAccessToken({ sub: 42, email: 'test@example.com' }, secret)
    const decoded = await verifyAccessToken(token, secret)
    expect(decoded).toEqual({ sub: 42, email: 'test@example.com' })
  })

  it('rejeita token com secret errado', async () => {
    const token = await signAccessToken({ sub: 1, email: 'a@b.com' }, secret)
    const decoded = await verifyAccessToken(token, 'secret-errado')
    expect(decoded).toBeNull()
  })

  it('rejeita token mal-formado', async () => {
    expect(await verifyAccessToken('not-a-jwt', secret)).toBeNull()
    expect(await verifyAccessToken('', secret)).toBeNull()
    expect(await verifyAccessToken('a.b.c', secret)).toBeNull()
  })

  it('preserva email com caracteres especiais', async () => {
    const email = 'usuario+tag@exemplo.com.br'
    const token = await signAccessToken({ sub: 99, email }, secret)
    const decoded = await verifyAccessToken(token, secret)
    expect(decoded?.email).toBe(email)
  })
})

describe('generateSecureToken + hashToken', () => {
  it('gera tokens únicos', async () => {
    const a = await generateSecureToken()
    const b = await generateSecureToken()
    expect(a.raw).not.toBe(b.raw)
    expect(a.hash).not.toBe(b.hash)
  })

  it('hash é determinístico', async () => {
    const { raw } = await generateSecureToken()
    const h1 = await hashToken(raw)
    const h2 = await hashToken(raw)
    expect(h1).toBe(h2)
  })

  it('hash não revela o token raw', async () => {
    const { raw, hash } = await generateSecureToken()
    expect(hash).not.toContain(raw.slice(0, 8))
  })

  it('raw tem entropia suficiente (≥48 bytes em base64)', async () => {
    const { raw } = await generateSecureToken()
    // 48 bytes em base64 = 64 chars (com padding)
    expect(raw.length).toBeGreaterThanOrEqual(64)
  })
})
