<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import { trackViewItem, trackAddToCart } from '@/composables/useAnalytics'
import { useJsonLd } from '@/composables/useJsonLd'
import { SITE_URL, business } from '@/lib/business'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cart = useCartStore()

const whatsapp = 'https://wa.me/5541998035540'

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw[0] : raw
})

// Carregado durante o prerender (SSG) para que o HTML estático já contenha
// o produto — indexável por motores de busca e agentes de IA.
const { data: product } = await useAsyncData(
  () => `product-${slug.value}`,
  () => productStore.fetchProduct(slug.value!),
)

const quantity = ref(1)
const added = ref(false)

// ── Galeria ─────────────────────────────────────────────────────────────────
const gallery = computed<string[]>(() => {
  const p = product.value
  if (!p) return []
  if (Array.isArray(p.images) && p.images.length) return p.images.map((i) => i.url)
  return p.imageUrl ? [p.imageUrl] : []
})
const activeIndex = ref(0)
const currentSrc = computed(() => gallery.value[activeIndex.value] ?? null)
const lightboxOpen = ref(false)

function selectImage(i: number) {
  activeIndex.value = i
}
function openLightbox(i = activeIndex.value) {
  if (!gallery.value.length) return
  activeIndex.value = i
  lightboxOpen.value = true
}
function closeLightbox() {
  lightboxOpen.value = false
}
function nextImage() {
  const n = gallery.value.length
  if (n > 1) activeIndex.value = (activeIndex.value + 1) % n
}
function prevImage() {
  const n = gallery.value.length
  if (n > 1) activeIndex.value = (activeIndex.value - 1 + n) % n
}

function onKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') nextImage()
  else if (e.key === 'ArrowLeft') prevImage()
}

// Bloqueia o scroll do body enquanto o lightbox está aberto.
watch(lightboxOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})

// Suporte a swipe no lightbox (mobile).
let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX
  if (Math.abs(dx) > 50) (dx < 0 ? nextImage : prevImage)()
}

const isInCart = computed(() =>
  product.value ? cart.items.some((i) => i.productId === product.value!.id) : false,
)

const categoryLabels: Record<string, string> = {
  injetora: 'Componente p/ Injetora',
  bucha: 'Bucha',
  eixo: 'Eixo',
  conjunto: 'Conjunto Mecânico',
  mola: 'Mola Usinada',
  cabecote: 'Cabeçote Angular',
  peca: 'Peça Usinada',
  servico: 'Serviço',
  outros: 'Peça Usinada',
}
const catLabel = computed(() => product.value ? (categoryLabels[product.value.category] ?? 'Peça Usinada') : '')

const customMsg = computed(() =>
  `Olá! Tenho interesse na peça "${product.value?.name ?? ''}". Gostaria de um orçamento sob desenho.`,
)

// ── SEO + dados estruturados ──────────────────────────────────────────────────
const canonical = computed(() => `${SITE_URL}/produto/${slug.value}`)
const seoDescription = computed(() => {
  const p = product.value
  if (!p) return business.description
  const base = p.description?.trim()
    || `${p.name} — ${catLabel.value.toLowerCase()} usinado${p.material ? ' em ' + p.material : ''} com precisão. Fabricação sob desenho com frete para todo o Brasil.`
  return base.length > 160 ? base.slice(0, 157).trimEnd() + '…' : base
})
const seoTitle = computed(() =>
  product.value ? `${product.value.name} — ${catLabel.value} | Tornearia Vieira` : 'Produto | Tornearia Vieira',
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'website',
  ogUrl: () => canonical.value,
  ogImage: () => gallery.value[0] ?? business.logo,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
})
useHead({ link: [{ rel: 'canonical', href: () => canonical.value }] })

if (product.value) {
  const p = product.value
  const inStock = p.inStock && p.price > 0
  useJsonLd([
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: seoDescription.value,
      sku: String(p.id),
      category: catLabel.value,
      image: gallery.value.length ? gallery.value : [business.logo],
      ...(p.material ? { material: p.material } : {}),
      brand: { '@type': 'Brand', name: business.name },
      manufacturer: { '@id': `${SITE_URL}/#organization` },
      offers: {
        '@type': 'Offer',
        url: canonical.value,
        priceCurrency: 'BRL',
        ...(inStock ? { price: p.price.toFixed(2) } : {}),
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#organization` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
        { '@type': 'ListItem', position: 3, name: p.name, item: canonical.value },
      ],
    },
  ])
}

onMounted(() => {
  if (!product.value) { router.replace('/catalogo'); return }
  const p = product.value
  trackViewItem({ id: p.id, name: p.name, price: p.price, category: p.category })
})

function addToCart() {
  if (!product.value || !product.value.inStock) return
  cart.addItem(product.value, quantity.value)
  trackAddToCart({ id: product.value.id, name: product.value.name, price: product.value.price, quantity: quantity.value })
  added.value = true
  setTimeout(() => (added.value = false), 2000)
}
</script>

<template>
  <main class="pd" v-if="product">
    <div class="grid-layer pd__grid"></div>
    <div class="shell pd__inner">
      <!-- nav -->
      <div class="pd__nav">
        <button class="pd__back" @click="router.back()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar
        </button>
        <nav class="pd__crumb">
          <RouterLink to="/">Início</RouterLink><span>/</span>
          <RouterLink to="/catalogo">Catálogo</RouterLink><span>/</span>
          <span class="pd__crumb-cur">{{ product.name }}</span>
        </nav>
      </div>

      <div class="pd__grid-main">
        <!-- MEDIA -->
        <div class="pd__media">
          <div class="pd__frame">
            <svg class="pd__dim" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
              <line x1="7" y1="16" x2="7" y2="84" stroke-width="0.4"/><line x1="4" y1="16" x2="10" y2="16" stroke-width="0.5"/><line x1="4" y1="84" x2="10" y2="84" stroke-width="0.5"/>
              <line x1="16" y1="92" x2="84" y2="92" stroke-width="0.4"/><line x1="16" y1="89" x2="16" y2="95" stroke-width="0.5"/><line x1="84" y1="89" x2="84" y2="95" stroke-width="0.5"/>
              <circle cx="84" cy="16" r="8" stroke-width="0.4"/><circle cx="84" cy="16" r="1.8" stroke-width="0.5"/>
            </svg>
            <div class="pd__cert mono"><span class="pd__cert-star">✦</span> Controle dimensional<br /><span class="pd__cert-sub">usinado sob desenho</span></div>
            <button v-if="currentSrc" type="button" class="pd__main" @click="openLightbox()" aria-label="Ampliar imagem">
              <Transition name="pd-fade" mode="out-in">
                <img :key="currentSrc" :src="currentSrc" :alt="product.name" class="pd__img is-loaded" loading="eager" />
              </Transition>
              <span class="pd__zoom mono">⤢ Ampliar</span>
            </button>
            <div v-else class="pd__ph">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>
            </div>
            <div class="pd__cat mono">{{ catLabel }}</div>
          </div>

          <!-- thumbnails -->
          <div v-if="gallery.length > 1" class="pd__thumbs">
            <button
              v-for="(src, i) in gallery"
              :key="src"
              type="button"
              class="pd__thumb"
              :class="{ 'pd__thumb--active': i === activeIndex }"
              @click="selectImage(i)"
              :aria-label="`Ver imagem ${i + 1}`"
            >
              <img :src="src" :alt="`${product.name} — imagem ${i + 1}`" loading="lazy" />
            </button>
          </div>
        </div>

        <!-- INFO -->
        <div class="pd__info">
          <div class="pd__eyebrow mono"><span class="pd__eyebrow-ln"></span>{{ catLabel }} · sob desenho</div>
          <h1 class="pd__name font-display">{{ product.name }}</h1>
          <div class="pd__material mono">{{ product.material }}</div>
          <p class="pd__desc">{{ product.description }}</p>

          <div class="pd__specs">
            <div class="pd__spec"><span class="pd__spec-k">Material</span><span class="pd__spec-v">{{ product.material }}</span></div>
            <div class="pd__spec"><span class="pd__spec-k">Fabricação</span><span class="pd__spec-v">Usinagem CNC · sob desenho</span></div>
            <div class="pd__spec"><span class="pd__spec-k">Tolerância</span><span class="pd__spec-v">Micrométrica · controle dimensional</span></div>
            <div class="pd__spec"><span class="pd__spec-k">Prazo</span><span class="pd__spec-v">A combinar conforme lote</span></div>
            <div class="pd__spec">
              <span class="pd__spec-k">Disponibilidade</span>
              <span v-if="product.inStock" class="pd__spec-v pd__spec-v--ok">Pronta entrega</span>
              <span v-else class="pd__spec-v">Fabricação sob encomenda</span>
            </div>
          </div>

          <!-- price -->
          <div class="pd__price-block" v-if="product.inStock && product.price > 0">
            <div class="pd__price-label mono">A partir de</div>
            <div class="pd__price font-display">{{ formatPrice(product.price) }}</div>
            <div class="pd__price-sub mono">por peça · frete a calcular</div>
          </div>
          <div class="pd__price-block" v-else>
            <div class="pd__price-label mono">Valor</div>
            <div class="pd__price pd__price--consult font-display">Sob consulta</div>
            <div class="pd__price-sub mono">envie o desenho — orçamento em até 24h</div>
          </div>

          <!-- actions -->
          <div class="pd__actions" v-if="product.inStock">
            <template v-if="!isInCart">
              <div class="pd__qty">
                <button class="pd__qty-btn" @click="quantity = Math.max(1, quantity - 1)">−</button>
                <span class="pd__qty-val mono">{{ quantity }}</span>
                <button class="pd__qty-btn" @click="quantity++">+</button>
              </div>
              <button class="btn btn--gold pd__cta" @click="addToCart">{{ added ? '✓ Adicionado' : 'Adicionar ao carrinho' }}</button>
            </template>
            <template v-else>
              <RouterLink to="/checkout" class="btn btn--gold pd__cta">Finalizar compra <span class="arrow">→</span></RouterLink>
              <button class="pd__remove mono" @click="cart.removeItem(product!.id)">Remover</button>
            </template>
          </div>
          <div class="pd__actions" v-else>
            <a :href="`${whatsapp}?text=${encodeURIComponent(customMsg)}`" target="_blank" rel="noopener" class="btn btn--gold pd__cta">Solicitar orçamento <span class="arrow">→</span></a>
          </div>

          <!-- trust -->
          <div class="pd__trust">
            <div class="pd__trust-item mono"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg> Controle dimensional</div>
            <div class="pd__trust-item mono"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Pagamento seguro</div>
            <div class="pd__trust-item mono"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> Frete p/ todo o Brasil</div>
          </div>
        </div>
      </div>

      <!-- manifesto -->
      <div class="pd__manifesto">
        <span class="pd__manifesto-ln"></span>
        <p class="mono">Cada peça segue o desenho técnico — do material certificado ao controle dimensional final.</p>
        <span class="pd__manifesto-ln"></span>
      </div>
    </div>

    <!-- Lightbox / galeria ampliada -->
    <Teleport to="body">
      <Transition name="lb-fade">
        <div
          v-if="lightboxOpen"
          class="lb"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de imagens"
          @click.self="closeLightbox"
        >
          <button class="lb__close" @click="closeLightbox" aria-label="Fechar">✕</button>

          <button
            v-if="gallery.length > 1"
            class="lb__nav lb__nav--prev"
            @click.stop="prevImage"
            aria-label="Imagem anterior"
          >‹</button>

          <div class="lb__stage" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
            <Transition name="pd-fade" mode="out-in">
              <img :key="currentSrc ?? ''" :src="currentSrc ?? ''" :alt="product.name" class="lb__img" />
            </Transition>
          </div>

          <button
            v-if="gallery.length > 1"
            class="lb__nav lb__nav--next"
            @click.stop="nextImage"
            aria-label="Próxima imagem"
          >›</button>

          <div v-if="gallery.length > 1" class="lb__counter mono">
            {{ activeIndex + 1 }} / {{ gallery.length }}
          </div>

          <div v-if="gallery.length > 1" class="lb__strip">
            <button
              v-for="(src, i) in gallery"
              :key="src"
              class="lb__strip-thumb"
              :class="{ 'lb__strip-thumb--active': i === activeIndex }"
              @click.stop="selectImage(i)"
              :aria-label="`Ver imagem ${i + 1}`"
            >
              <img :src="src" :alt="`${product.name} — miniatura ${i + 1}`" loading="lazy" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>

  <div class="pd-loading" v-else><div class="pd-loading__pulse"></div></div>
</template>

<style scoped>
.pd { position: relative; min-height: 100vh; background: var(--c-bg); padding: 116px 0 80px; overflow: hidden; }
.pd__grid { opacity: 0.5; }
.pd__inner { position: relative; z-index: 1; }

.pd__nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; }
.pd__back { display: inline-flex; align-items: center; gap: 8px; color: var(--c-muted); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; transition: color 0.2s; }
.pd__back:hover { color: var(--c-accent); }
.pd__crumb { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-muted); }
.pd__crumb a:hover { color: var(--c-accent); }
.pd__crumb-cur { color: var(--c-text); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 640px){ .pd__crumb { display: none; } }

.pd__grid-main { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: start; }
@media (min-width: 940px){ .pd__grid-main { grid-template-columns: 1fr 1fr; gap: 72px; } }

.pd__frame { position: relative; aspect-ratio: 4/5; background: var(--c-surface); border: 1px solid var(--c-border); overflow: hidden; display: grid; place-items: center; }
.pd__dim { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--c-accent); opacity: 0.22; pointer-events: none; z-index: 1; }
.pd__cert { position: absolute; top: 18px; left: 18px; z-index: 2; border: 1px solid var(--c-accent); padding: 10px 14px; background: color-mix(in srgb, var(--c-bg) 82%, transparent); backdrop-filter: blur(8px); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-accent); line-height: 1.7; }
.pd__cert-sub { color: var(--c-muted); font-size: 0.52rem; }
.pd__img { width: 100%; height: 100%; object-fit: contain; padding: 44px; opacity: 0; transition: opacity 0.6s; position: relative; z-index: 1; }
.pd__img.is-loaded { opacity: 1; }
.pd__ph { color: var(--c-faint); position: relative; z-index: 1; }
.pd__cat { position: absolute; bottom: 18px; right: 18px; z-index: 2; font-size: 0.56rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-text); background: color-mix(in srgb, var(--c-bg) 82%, transparent); padding: 7px 12px; border: 1px solid var(--c-border-2); backdrop-filter: blur(8px); }

/* galeria — imagem principal clicável */
.pd__main { position: absolute; inset: 0; width: 100%; height: 100%; display: grid; place-items: center; cursor: zoom-in; background: none; border: none; padding: 0; }
.pd__zoom { position: absolute; bottom: 18px; left: 18px; z-index: 3; font-size: 0.54rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-text); background: color-mix(in srgb, var(--c-bg) 78%, transparent); padding: 6px 10px; border: 1px solid var(--c-border-2); backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.25s; pointer-events: none; }
.pd__main:hover .pd__zoom, .pd__main:focus-visible .pd__zoom { opacity: 1; }

/* thumbnails */
.pd__thumbs { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.pd__thumb { width: 72px; height: 72px; flex-shrink: 0; border: 1px solid var(--c-border-2); background: var(--c-surface); overflow: hidden; cursor: pointer; padding: 0; transition: border-color 0.2s, opacity 0.2s; opacity: 0.6; }
.pd__thumb img { width: 100%; height: 100%; object-fit: cover; }
.pd__thumb:hover { opacity: 1; }
.pd__thumb--active { border-color: var(--c-accent); opacity: 1; }

/* transição de troca de imagem */
.pd-fade-enter-active, .pd-fade-leave-active { transition: opacity 0.3s ease; }
.pd-fade-enter-from, .pd-fade-leave-to { opacity: 0; }

.pd__eyebrow { display: flex; align-items: center; gap: 12px; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-accent); margin-bottom: 18px; }
.pd__eyebrow-ln { width: 30px; height: 1px; background: var(--c-accent); }
.pd__name { font-size: clamp(2.2rem, 4.5vw, 3.6rem); line-height: 0.95; letter-spacing: 0.02em; color: var(--c-text); margin-bottom: 14px; }
.pd__material { font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-muted); margin-bottom: 22px; }
.pd__desc { color: var(--c-muted); line-height: 1.75; margin-bottom: 32px; max-width: 520px; }

.pd__specs { border-top: 1px solid var(--c-border); margin-bottom: 36px; }
.pd__spec { display: grid; grid-template-columns: 1fr 1.4fr; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--c-border); align-items: center; }
.pd__spec-k { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-muted); }
.pd__spec-v { font-family: var(--font-mono); font-size: 0.72rem; color: var(--c-text); text-align: right; }
.pd__spec-v--ok { color: var(--c-accent); }

.pd__price-block { margin-bottom: 32px; }
.pd__price-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-muted); margin-bottom: 6px; }
.pd__price { font-size: 3.4rem; line-height: 1; letter-spacing: 0.02em; color: var(--c-accent); }
.pd__price--consult { font-size: 2.4rem; }
.pd__price-sub { font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-muted); margin-top: 8px; }

.pd__actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 32px; }
.pd__qty { display: flex; align-items: center; border: 1px solid var(--c-border-2); }
.pd__qty-btn { width: 46px; height: 52px; color: var(--c-text); font-size: 1.2rem; display: grid; place-items: center; transition: background 0.2s; }
.pd__qty-btn:hover { background: var(--c-surface2); }
.pd__qty-val { width: 46px; text-align: center; font-size: 0.85rem; color: var(--c-text); border-left: 1px solid var(--c-border-2); border-right: 1px solid var(--c-border-2); line-height: 52px; }
.pd__cta { flex: 1; justify-content: center; min-width: 200px; }
.pd__remove { color: var(--c-muted); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 4px; transition: color 0.2s; }
.pd__remove:hover { color: #ef4444; }

.pd__trust { display: flex; gap: 22px; flex-wrap: wrap; padding-top: 22px; border-top: 1px solid var(--c-border); }
.pd__trust-item { display: flex; align-items: center; gap: 8px; font-size: 0.56rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c-muted); }
.pd__trust-item svg { color: var(--c-accent); flex-shrink: 0; }

.pd__manifesto { display: grid; grid-template-columns: 1fr auto 1fr; gap: 28px; align-items: center; margin-top: 88px; padding: 48px 0; border-top: 1px solid var(--c-border); }
.pd__manifesto-ln { height: 1px; background: var(--c-border-2); }
.pd__manifesto p { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--c-muted); text-align: center; line-height: 1.8; }
@media (max-width: 768px){ .pd__manifesto { grid-template-columns: 1fr; } .pd__manifesto-ln { display: none; } .pd__price { font-size: 2.6rem; } }

/* Lightbox */
.lb { position: fixed; inset: 0; z-index: 200; display: grid; grid-template-rows: 1fr auto; place-items: center; background: color-mix(in srgb, var(--c-bg) 94%, #000); backdrop-filter: blur(6px); padding: 56px 16px 16px; }
.lb__stage { grid-row: 1; display: grid; place-items: center; width: 100%; height: 100%; max-width: 1100px; }
.lb__img { max-width: 100%; max-height: 78vh; object-fit: contain; user-select: none; }
.lb__close { position: absolute; top: 16px; right: 18px; z-index: 3; width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid var(--c-border-2); background: color-mix(in srgb, var(--c-bg) 70%, transparent); color: var(--c-text); font-size: 1.1rem; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.lb__close:hover { border-color: var(--c-accent); color: var(--c-accent); }
.lb__nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 52px; height: 52px; display: grid; place-items: center; border: 1px solid var(--c-border-2); background: color-mix(in srgb, var(--c-bg) 70%, transparent); color: var(--c-text); font-size: 2rem; line-height: 1; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.lb__nav:hover { border-color: var(--c-accent); color: var(--c-accent); }
.lb__nav--prev { left: 16px; }
.lb__nav--next { right: 16px; }
.lb__counter { position: absolute; top: 22px; left: 18px; z-index: 3; font-size: 0.62rem; letter-spacing: 0.14em; color: var(--c-muted); }
.lb__strip { grid-row: 2; display: flex; gap: 8px; padding: 14px 0 2px; overflow-x: auto; max-width: 100%; }
.lb__strip-thumb { width: 60px; height: 60px; flex-shrink: 0; border: 1px solid var(--c-border-2); background: var(--c-surface); overflow: hidden; cursor: pointer; padding: 0; opacity: 0.5; transition: opacity 0.2s, border-color 0.2s; }
.lb__strip-thumb img { width: 100%; height: 100%; object-fit: cover; }
.lb__strip-thumb:hover { opacity: 0.85; }
.lb__strip-thumb--active { opacity: 1; border-color: var(--c-accent); }
@media (max-width: 640px){ .lb__nav { width: 42px; height: 42px; font-size: 1.5rem; } .lb__img { max-height: 70vh; } }

.lb-fade-enter-active, .lb-fade-leave-active { transition: opacity 0.25s ease; }
.lb-fade-enter-from, .lb-fade-leave-to { opacity: 0; }

.pd-loading { min-height: 100vh; display: grid; place-items: center; background: var(--c-bg); }
.pd-loading__pulse { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--c-accent); animation: pdp 1.4s ease-in-out infinite; }
@keyframes pdp { 0%,100%{ transform: scale(0.85); opacity: 0.4; } 50%{ transform: scale(1.1); opacity: 1; } }
</style>
