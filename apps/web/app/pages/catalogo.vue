<template>
  <div class="cat">
    <!-- Header -->
    <header class="cat__hero">
      <div class="grid-layer"></div>
      <div class="shell cat__hero-in">
        <span class="eyebrow"><b>//</b> Catálogo <span class="ln"></span></span>
        <h1 class="cat__title font-display">PEÇAS &amp;<br /><span class="gold">SERVIÇOS</span></h1>
        <p class="cat__sub">Componentes usinados com precisão — peças de linha prontas para envio e fabricação sob desenho. Frete para todo o Brasil.</p>
      </div>
    </header>

    <div class="shell cat__body">
      <!-- Filtros -->
      <div class="cat__filters">
        <button
          v-for="c in categories"
          :key="c.value"
          class="cat__filter"
          :class="{ 'is-active': active === c.value }"
          @click="active = c.value"
        >{{ c.label }}</button>
      </div>

      <div v-if="store.loading" class="cat__state mono">Carregando peças…</div>
      <div v-else-if="!filtered.length" class="cat__state mono">Nenhuma peça encontrada nesta categoria.</div>

      <div v-else class="cat__grid">
        <ProductCard v-for="p in filtered" :key="p.slug" :product="p" v-reveal />
      </div>

      <!-- CTA sob encomenda -->
      <section class="cat__cta" v-reveal>
        <div class="cat__cta-bg grid-layer"></div>
        <div class="cat__cta-in">
          <span class="eyebrow"><b>//</b> Sob encomenda</span>
          <h2 class="cat__cta-title font-display">NÃO ACHOU A PEÇA?<br /><span class="gold">FABRICAMOS SOB DESENHO.</span></h2>
          <p>Envie o desenho técnico ou a amostra. Fazemos eixos, buchas, conjuntos e componentes especiais com tolerância micrométrica — orçamento em até 24h.</p>
          <a :href="whatsapp" target="_blank" rel="noopener" class="btn btn--gold" data-magnetic>Solicitar orçamento <span class="arrow">→</span></a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@/stores/products'
import { computed, ref } from 'vue'
import { useJsonLd } from '@/composables/useJsonLd'
import { SITE_URL } from '@/lib/business'

const store = useProductStore()
const active = ref('all')
const whatsapp = 'https://wa.me/5541998035540'

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'injetora', label: 'Injetoras' },
  { value: 'bucha', label: 'Buchas' },
  { value: 'eixo', label: 'Eixos' },
  { value: 'conjunto', label: 'Conjuntos' },
  { value: 'outros', label: 'Outros' },
]

const filtered = computed(() =>
  active.value === 'all'
    ? store.products
    : store.products.filter((p) => p.category === active.value),
)

// SSG: popula o catálogo durante o prerender para HTML indexável.
await useAsyncData('catalog-products', async () => {
  await store.fetchProducts()
  return store.products.length
})

const seoDescription =
  'Catálogo de peças usinadas com precisão: eixos, buchas, conjuntos mecânicos e componentes para injetoras. Peças de linha prontas para envio e fabricação sob desenho, com frete para todo o Brasil.'

useSeoMeta({
  title: 'Catálogo de Peças Usinadas — Tornearia Vieira',
  description: seoDescription,
  ogTitle: 'Catálogo de Peças Usinadas — Tornearia Vieira',
  ogDescription: seoDescription,
  ogType: 'website',
  ogUrl: `${SITE_URL}/catalogo`,
  twitterCard: 'summary_large_image',
})
useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}/catalogo` }] })

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Catálogo de Peças Usinadas — Tornearia Vieira',
    url: `${SITE_URL}/catalogo`,
    description: seoDescription,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: store.products.length,
      itemListElement: store.products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/produto/${p.slug}`,
        name: p.name,
      })),
    },
  },
])
</script>

<style scoped>
.cat { min-height: 100vh; padding-top: 76px; background: var(--c-bg); }

.cat__hero { position: relative; padding: 80px 0 60px; border-bottom: 1px solid var(--c-border); overflow: hidden; }
.cat__hero-in { position: relative; z-index: 1; }
.cat__title { font-size: clamp(3rem, 8vw, 6.5rem); letter-spacing: 0.02em; line-height: 0.9; margin: 16px 0 18px; }
.cat__sub { color: var(--c-muted); max-width: 520px; }

.cat__body { padding: 48px 0 110px; }
.cat__filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 44px; }
.cat__filter {
  padding: 9px 20px; border: 1px solid var(--c-border); background: transparent; color: var(--c-muted);
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer;
  clip-path: polygon(7px 0, 100% 0, calc(100% - 7px) 100%, 0 100%);
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.cat__filter:hover, .cat__filter.is-active { border-color: var(--c-accent); color: var(--c-accent); background: color-mix(in srgb, var(--c-accent) 8%, transparent); }

.cat__state { padding: 80px 0; text-align: center; color: var(--c-muted); letter-spacing: 0.16em; text-transform: uppercase; font-size: 0.7rem; }

.cat__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media (max-width: 900px){ .cat__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px){ .cat__grid { grid-template-columns: 1fr; } }

.cat__cta { position: relative; margin-top: 72px; border: 1px solid var(--c-border); background: var(--c-surface); overflow: hidden; }
.cat__cta-bg { opacity: 0.5; }
.cat__cta-in { position: relative; z-index: 1; padding: 64px 48px; display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.cat__cta-title { font-size: clamp(1.9rem, 4.5vw, 3.4rem); line-height: 0.95; letter-spacing: 0.02em; }
.cat__cta-in p { color: var(--c-muted); max-width: 560px; }
.cat__cta-in .btn { margin-top: 8px; }
@media (max-width: 640px){ .cat__cta-in { padding: 40px 24px; } .cat__body { padding: 40px 0 90px; } }
</style>
