export default defineNuxtConfig({
  srcDir: 'app/',
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Tornearia Vieira — Usinagem de Precisão',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Fabricação de peças industriais sob desenho. Usinagem CNC de alta precisão, tolerâncias micrométricas. São José dos Pinhais — PR.' },
        { property: 'og:title', content: 'Tornearia Vieira — Usinagem de Precisão' },
        { property: 'og:description', content: 'Fabricação de peças industriais sob desenho. Usinagem CNC, eixos, buchas e conjuntos mecânicos.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
    },
  },
  compatibilityDate: '2025-07-01',
})
