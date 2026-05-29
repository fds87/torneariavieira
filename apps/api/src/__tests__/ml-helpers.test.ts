import { describe, it, expect } from 'vitest'

// Replicação dos helpers internos de ml.ts e payments.ts para teste isolado.
// Se mudarem na implementação, atualizar aqui também.

const categoryMap: Record<string, string> = {
  espeto:        'MLB271837',
  grelha:        'MLB271837',
  churrasqueira: 'MLB189849',
  acessorio:     'MLB31036',
  kit:           'MLB31036',
}

function resolveCategory(productCategory: string, override?: string): string {
  return override || categoryMap[productCategory] || 'MLB271837'
}

const safeDim = (v: unknown, def: number) => {
  const n = Number(v)
  return isNaN(n) || n <= 0 ? def : Math.round(n)
}

function buildDimensionsString(p: { widthCm?: unknown; heightCm?: unknown; lengthCm?: unknown; weightG?: unknown }) {
  return `${safeDim(p.widthCm, 20)}x${safeDim(p.heightCm, 10)}x${safeDim(p.lengthCm, 30)},${safeDim(p.weightG, 500)}`
}

describe('ML category resolution', () => {
  it('mapeia espeto → MLB271837', () => {
    expect(resolveCategory('espeto')).toBe('MLB271837')
  })

  it('mapeia churrasqueira → MLB189849', () => {
    expect(resolveCategory('churrasqueira')).toBe('MLB189849')
  })

  it('mapeia acessorio e kit → MLB31036', () => {
    expect(resolveCategory('acessorio')).toBe('MLB31036')
    expect(resolveCategory('kit')).toBe('MLB31036')
  })

  it('usa fallback para categoria desconhecida', () => {
    expect(resolveCategory('inexistente')).toBe('MLB271837')
  })

  it('respeita override de env var', () => {
    expect(resolveCategory('espeto', 'MLB99999')).toBe('MLB99999')
  })
})

describe('safeDim — fallback robusto', () => {
  it('aceita número positivo', () => {
    expect(safeDim(30, 99)).toBe(30)
  })

  it('arredonda decimais', () => {
    expect(safeDim(29.7, 99)).toBe(30)
    expect(safeDim(29.4, 99)).toBe(29)
  })

  it('usa default para null', () => {
    expect(safeDim(null, 99)).toBe(99)
  })

  it('usa default para undefined', () => {
    expect(safeDim(undefined, 99)).toBe(99)
  })

  it('usa default para string não-numérica', () => {
    expect(safeDim('abc', 99)).toBe(99)
    expect(safeDim('weight_g', 99)).toBe(99)
  })

  it('usa default para zero ou negativo', () => {
    expect(safeDim(0, 99)).toBe(99)
    expect(safeDim(-5, 99)).toBe(99)
  })

  it('usa default para NaN', () => {
    expect(safeDim(NaN, 99)).toBe(99)
  })

  it('aceita string numérica', () => {
    expect(safeDim('30', 99)).toBe(30)
  })
})

describe('Dimensions string format (ML pattern WxHxL,weight)', () => {
  it('formata produto válido', () => {
    expect(buildDimensionsString({ widthCm: 20, heightCm: 10, lengthCm: 30, weightG: 500 }))
      .toBe('20x10x30,500')
  })

  it('aplica defaults quando todos os campos são null', () => {
    expect(buildDimensionsString({ widthCm: null, heightCm: null, lengthCm: null, weightG: null }))
      .toBe('20x10x30,500')
  })

  it('mistura defaults e valores reais', () => {
    expect(buildDimensionsString({ widthCm: 5, heightCm: null, lengthCm: 60, weightG: 200 }))
      .toBe('5x10x60,200')
  })

  it('arredonda decimais para inteiros', () => {
    expect(buildDimensionsString({ widthCm: 5.7, heightCm: 2.3, lengthCm: 60.5, weightG: 200.9 }))
      .toBe('6x2x61,201')
  })

  it('matches o pattern aceito pelo ML (^\\d+x\\d+x\\d+,\\d+$)', () => {
    const pattern = /^\d+x\d+x\d+,\d+$/
    expect(pattern.test(buildDimensionsString({ widthCm: 5, heightCm: 2, lengthCm: 60, weightG: 200 }))).toBe(true)
    expect(pattern.test(buildDimensionsString({ widthCm: null, heightCm: null, lengthCm: null, weightG: null }))).toBe(true)
  })
})

describe('Pictures URL — absolute vs relative', () => {
  function resolveImgUrl(imageUrl: string | null, baseUrl: string): string | null {
    if (!imageUrl) return null
    return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
  }

  const base = 'https://brasapremium.com.br'

  it('mantém URL absoluta http', () => {
    expect(resolveImgUrl('http://cdn.example.com/img.jpg', base)).toBe('http://cdn.example.com/img.jpg')
  })

  it('mantém URL absoluta https', () => {
    expect(resolveImgUrl('https://cdn.example.com/img.jpg', base)).toBe('https://cdn.example.com/img.jpg')
  })

  it('prefixa caminho relativo com base URL', () => {
    expect(resolveImgUrl('/produto.png', base)).toBe('https://brasapremium.com.br/produto.png')
  })

  it('retorna null para imageUrl null', () => {
    expect(resolveImgUrl(null, base)).toBeNull()
  })
})
