<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import type { Product } from '@/types/product'
import { trackViewItem, trackAddToCart } from '@/composables/useAnalytics'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cart = useCartStore()

const whatsapp = 'https://wa.me/5541999802662'

const product = ref<Product | null>(null)
const quantity = ref(1)
const added = ref(false)
const imgLoaded = ref(false)

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

onMounted(async () => {
  const rawSlug = route.params.slug
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug
  if (!slug) { router.replace('/'); return }
  product.value = await productStore.fetchProduct(slug)
  if (!product.value) { router.replace('/catalogo'); return }
  trackViewItem({ id: product.value.id, name: product.value.name, price: product.value.price, category: product.value.category })
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
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" class="pd__img" :class="{ 'is-loaded': imgLoaded }" @load="imgLoaded = true" loading="eager" />
            <div v-else class="pd__ph">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>
            </div>
            <div class="pd__cat mono">{{ catLabel }}</div>
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

.pd-loading { min-height: 100vh; display: grid; place-items: center; background: var(--c-bg); }
.pd-loading__pulse { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--c-accent); animation: pdp 1.4s ease-in-out infinite; }
@keyframes pdp { 0%,100%{ transform: scale(0.85); opacity: 0.4; } 50%{ transform: scale(1.1); opacity: 1; } }
</style>
