import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readDotEnv(file: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(resolve(file), 'utf8')
        .split('\n')
        .filter((l) => l && !l.startsWith('#') && l.includes('='))
        .map((l) => l.split('=').map((s) => s.trim()) as [string, string]),
    )
  } catch {
    return {}
  }
}

const prodEnv = readDotEnv('.env.production')
const apiUrl = process.env.NUXT_PUBLIC_API_URL || process.env.VITE_API_URL || prodEnv.VITE_API_URL || ''

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/sitemap'],

  site: {
    url: 'https://torneariavieiraoficial.com.br',
    name: 'Tornearia Vieira',
  },

  // Enumera as páginas de produto no build (busca os slugs da API ao vivo)
  // para que sejam pré-renderizadas como HTML estático — essencial para
  // SEO e descoberta por agentes de IA.
  hooks: {
    async 'nitro:config'(nitroConfig) {
      try {
        const res = await fetch(`${apiUrl}/api/products`)
        if (!res.ok) return
        const products = (await res.json()) as Array<{ slug: string }>
        const routes = products.filter((p) => p.slug).map((p) => `/produto/${p.slug}`)
        nitroConfig.prerender ||= {}
        nitroConfig.prerender.routes = [...(nitroConfig.prerender.routes || []), ...routes]
        // eslint-disable-next-line no-console
        console.log(`[prerender] +${routes.length} rotas de produto`)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[prerender] não foi possível buscar produtos da API:', e)
      }
    },
  },

  routeRules: {
    '/admin/**': { ssr: false },
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/catalogo',
        '/carrinho',
        '/checkout',
        '/pagamento/sucesso',
        '/pagamento/pendente',
        '/pagamento/falha',
        '/conta/entrar',
        '/conta/cadastro',
        '/conta/recuperar-senha',
        '/conta/redefinir-senha',
        '/conta',
        '/conta/pedidos',
        '/conta/enderecos',
        '/conta/dados',
      ],
      ignore: ['/admin/**'],
    },
    devProxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? 8787}/api`,
        changeOrigin: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl,
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_PROJECT_ID ?? '',
    },
  },

  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },

  srcDir: 'app/',

  components: [
    { path: '~/components', pathPrefix: false },
    { path: fileURLToPath(new URL('./src/components', import.meta.url)), pathPrefix: false },
  ],

  css: [
    '~/assets/css/main.css',
    fileURLToPath(new URL('./src/assets/tokens.css', import.meta.url)),
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Tornearia Vieira — Usinagem de Precisão',
      meta: [
        {
          name: 'description',
          content:
            'Fabricação de peças industriais sob desenho. Usinagem CNC de alta precisão, tolerâncias micrométricas. São José dos Pinhais — PR.',
        },
        { name: 'theme-color', content: '#B8921E' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tornearia Vieira' },
        { property: 'og:title', content: 'Tornearia Vieira — Usinagem de Precisão' },
        {
          property: 'og:description',
          content:
            'Fabricação de peças industriais sob desenho. Usinagem CNC, eixos, buchas e conjuntos mecânicos. São José dos Pinhais — PR.',
        },
        { property: 'og:url', content: 'https://torneariavieiraoficial.com.br' },
        { property: 'og:locale', content: 'pt_BR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Tornearia Vieira — Usinagem de Precisão' },
        {
          name: 'twitter:description',
          content:
            'Fabricação de peças industriais sob desenho. Usinagem CNC, eixos, buchas e conjuntos mecânicos.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  vite: {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  },

  compatibilityDate: '2025-07-01',
})
