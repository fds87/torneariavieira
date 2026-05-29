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

const product = ref<Product | null>(null)
const quantity = ref(1)
const added = ref(false)
const imgLoaded = ref(false)

const isInCart = computed(() =>
  product.value ? cart.items.some((i) => i.productId === product.value!.id) : false,
)

const categoryLabels: Record<Product['category'], string> = {
  espeto: 'Espeto',
  churrasqueira: 'Churrasqueira',
  grelha: 'Grelha',
  acessorio: 'Acessório',
  kit: 'Kit',
}

/* Map slugs to product images */
const productImages: Record<string, string> = {
  'churrasqueira-rotativa-9': '/churrasqueira-rotativa-9.png',
  'churrasqueira-imperial':   '/churrasqueira-imperial.png',
}
const fallbackImg = 'https://cdn.sistemawbuy.com.br/arquivos/100c580baca8c725f35897c2510dbb91/produtos/MO6DA4/735d68c44e1fc161aed24fc7a78c60c0-6691833bd2395.jpg'

const productImg = computed(() => {
  if (!product.value) return fallbackImg
  return productImages[product.value.slug] ?? fallbackImg
})

onMounted(async () => {
  const rawSlug = route.params.slug
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug
  if (!slug) { router.replace('/'); return }
  product.value = await productStore.fetchProduct(slug)
  if (!product.value) { router.replace('/'); return }
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
  <main class="detail" v-if="product">
    <!-- back -->
    <div class="detail__nav">
      <button class="detail__back" @click="router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Voltar
      </button>
      <nav class="detail__breadcrumb">
        <RouterLink to="/">Início</RouterLink>
        <span>/</span>
        <RouterLink to="/#produtos">Loja</RouterLink>
        <span>/</span>
        <span>{{ product.name }}</span>
      </nav>
    </div>

    <div class="detail__grid">
      <!-- ── IMAGE PANEL ── -->
      <div class="detail__media">
        <div class="detail__img-wrap">
          <!-- certificate badge -->
          <div class="detail__cert">
            <span class="detail__cert-star">✦</span> Peça única<br/>
            <span class="detail__cert-sub">série · un. assinada</span>
          </div>

          <img
            :src="productImg"
            :alt="product.name"
            class="detail__img"
            :class="{ 'detail__img--loaded': imgLoaded }"
            @load="imgLoaded = true"
            loading="eager"
          />

          <!-- category badge -->
          <div class="detail__cat-badge">{{ categoryLabels[product.category] }}</div>
        </div>

        <!-- thumbnails row -->
        <div class="detail__thumbs">
          <div class="detail__thumb detail__thumb--active">
            <img :src="productImg" :alt="product.name" />
          </div>
          <div class="detail__thumb detail__thumb--ph">
            <span>+</span>
          </div>
          <div class="detail__thumb detail__thumb--ph">
            <span>+</span>
          </div>
        </div>
      </div>

      <!-- ── INFO PANEL ── -->
      <div class="detail__info">
        <!-- eyebrow -->
        <div class="detail__eyebrow">
          <span class="detail__eyebrow-line" />
          {{ categoryLabels[product.category] }} · sob medida · exclusivo
        </div>

        <!-- name -->
        <h1 class="detail__name">{{ product.name }}</h1>

        <!-- material tag -->
        <div class="detail__material">{{ product.material }}</div>

        <!-- description -->
        <p class="detail__desc">{{ product.description }}</p>

        <!-- specs table -->
        <div class="detail__specs">
          <div class="detail__spec">
            <span class="detail__spec-k">Material</span>
            <span class="detail__spec-v">{{ product.material }}</span>
          </div>
          <div class="detail__spec">
            <span class="detail__spec-k">Fabricação</span>
            <span class="detail__spec-v">Artesanal · sob encomenda</span>
          </div>
          <div class="detail__spec">
            <span class="detail__spec-k">Garantia</span>
            <span class="detail__spec-v">5 anos contra defeitos</span>
          </div>
          <div class="detail__spec">
            <span class="detail__spec-k">Prazo</span>
            <span class="detail__spec-v">30 a 60 dias úteis</span>
          </div>
          <div class="detail__spec" v-if="product.inStock">
            <span class="detail__spec-k">Disponibilidade</span>
            <span class="detail__spec-v detail__spec-v--avail">Em linha · pronta entrega</span>
          </div>
          <div class="detail__spec" v-else>
            <span class="detail__spec-k">Disponibilidade</span>
            <span class="detail__spec-v">Sob consulta</span>
          </div>
        </div>

        <!-- price -->
        <div class="detail__price-block" v-if="product.inStock && product.price > 0">
          <div class="detail__price-label">A partir de</div>
          <div class="detail__price">{{ formatPrice(product.price) }}</div>
          <div class="detail__price-sub">ou 12× sem juros · frete a calcular</div>
        </div>
        <div class="detail__price-block" v-else>
          <div class="detail__price-label">Valor</div>
          <div class="detail__price-consult">Sob consulta</div>
          <div class="detail__price-sub">Mande sua medida — orçamento em 72h</div>
        </div>

        <!-- actions -->
        <div class="detail__actions" v-if="product.inStock">
          <template v-if="!isInCart">
            <div class="detail__qty">
              <button class="detail__qty-btn" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span class="detail__qty-val">{{ quantity }}</span>
              <button class="detail__qty-btn" @click="quantity++">+</button>
            </div>
            <button class="btn-ember btn-ember--full" @click="addToCart">
              {{ added ? '✓ Adicionado à sacola' : 'Adicionar à sacola' }}
            </button>
          </template>
          <template v-else>
            <RouterLink to="/checkout" class="btn-ember btn-ember--full">
              Finalizar compra →
            </RouterLink>
            <button class="btn-ghost-sm" @click="cart.removeItem(product!.id)">
              Remover da sacola
            </button>
          </template>
        </div>
        <div class="detail__actions" v-else>
          <a
            href="https://wa.me/5500000000000?text=Oi!%20Tenho%20interesse%20neste%20produto%20da%20Brasa%20Premium"
            target="_blank"
            rel="noopener"
            class="btn-ember btn-ember--full"
          >
            Consultar via WhatsApp →
          </a>
        </div>

        <!-- trust signals -->
        <div class="detail__trust">
          <div class="detail__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Garantia 5 anos
          </div>
          <div class="detail__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="2"/></svg>
            Pagamento seguro
          </div>
          <div class="detail__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Entrega para todo o país
          </div>
        </div>
      </div>
    </div>

    <!-- ── RELATED / MANIFESTO ── -->
    <div class="detail__manifesto">
      <div class="detail__manifesto-line" />
      <p class="detail__manifesto-text">
        Cada peça sai do atelier assinada e numerada.<br/>
        <em>Do metal bruto à sua churrasqueira — sem intermediários.</em>
      </p>
      <div class="detail__manifesto-line" />
    </div>
  </main>

  <!-- loading state -->
  <div class="detail-loading" v-else>
    <div class="detail-loading__pulse" />
  </div>
</template>

<style scoped>
/* ─── Page shell ─── */
.detail {
  min-height: 100vh;
  background: var(--c-ink);
  padding: 100px 70px 80px;
  max-width: 1600px;
  margin: 0 auto;
}

/* ─── Navigation bar ─── */
.detail__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 56px;
}

.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--c-ivory-mute);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  transition: color 150ms;
}
.detail__back:hover { color: var(--c-ivory); }

.detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
}
.detail__breadcrumb a { color: inherit; text-decoration: none; transition: color 150ms; }
.detail__breadcrumb a:hover { color: var(--c-ember); }
.detail__breadcrumb span:last-child { color: var(--c-ivory-dim); }

/* ─── Main grid ─── */
.detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

/* ─── Image panel ─── */
.detail__media { display: flex; flex-direction: column; gap: 16px; }

.detail__img-wrap {
  position: relative;
  aspect-ratio: 4/5;
  background: radial-gradient(ellipse at center, #1f1a16 0%, var(--c-ink-card) 70%);
  border: 1px solid var(--c-hair);
  overflow: hidden;
}

.detail__cert {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  border: 1px solid var(--c-ember);
  padding: 12px 16px;
  background: rgba(11, 10, 8, 0.82);
  backdrop-filter: blur(12px);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-ember);
  line-height: 1.7;
}
.detail__cert-star { margin-right: 4px; }
.detail__cert-sub { color: var(--c-ivory-dim); font-size: 9px; }

.detail__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 48px;
  opacity: 0;
  transition: opacity 600ms;
}
.detail__img--loaded { opacity: 1; }

.detail__cat-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory);
  background: rgba(11, 10, 8, 0.82);
  padding: 8px 14px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--c-hair-bold);
}

/* thumbnails */
.detail__thumbs {
  display: flex;
  gap: 12px;
}
.detail__thumb {
  width: 80px;
  height: 80px;
  border: 1px solid var(--c-hair);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 200ms;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-ink-card);
  flex-shrink: 0;
}
.detail__thumb img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
.detail__thumb--active { border-color: var(--c-ember); }
.detail__thumb--ph { color: var(--c-ivory-mute); font-size: 20px; font-weight: 300; }
.detail__thumb:hover { border-color: var(--c-hair-bold); }

/* ─── Info panel ─── */
.detail__info { padding-top: 8px; }

.detail__eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ember);
  margin-bottom: 20px;
}
.detail__eyebrow-line {
  width: 32px;
  height: 1px;
  background: var(--c-ember);
  flex-shrink: 0;
}

.detail__name {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4vw, 3.8rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 0.95;
  color: var(--c-ivory);
  margin-bottom: 18px;
}

.detail__material {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 17px;
  color: var(--c-ivory-dim);
  margin-bottom: 20px;
}

.detail__desc {
  font-size: 16px;
  line-height: 1.75;
  color: var(--c-ivory-dim);
  margin-bottom: 32px;
  max-width: 520px;
  text-wrap: pretty;
}

/* specs */
.detail__specs {
  border-top: 1px solid var(--c-hair);
  margin-bottom: 36px;
}
.detail__spec {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  padding: 13px 0;
  border-bottom: 1px solid var(--c-hair);
  gap: 16px;
  align-items: center;
}
.detail__spec-k {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
}
.detail__spec-v {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--c-ivory);
  text-align: right;
}
.detail__spec-v--avail { color: var(--c-ember); }

/* price */
.detail__price-block { margin-bottom: 36px; }
.detail__price-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
  margin-bottom: 6px;
}
.detail__price {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--c-ember);
}
.detail__price-consult {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 32px;
  color: var(--c-ivory-dim);
}
.detail__price-sub {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 14px;
  color: var(--c-ivory-mute);
  margin-top: 6px;
}

/* actions */
.detail__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.detail__qty {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--c-hair-bold);
}
.detail__qty-btn {
  width: 44px;
  height: 52px;
  background: none;
  border: none;
  color: var(--c-ivory);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms;
}
.detail__qty-btn:hover { background: var(--c-hair); }
.detail__qty-val {
  width: 44px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--c-ivory);
  border-left: 1px solid var(--c-hair-bold);
  border-right: 1px solid var(--c-hair-bold);
  line-height: 52px;
}

.btn-ember {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-ember);
  color: var(--c-ivory);
  border: none;
  padding: 16px 28px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  transition: background 200ms, box-shadow 200ms;
  white-space: nowrap;
}
.btn-ember:hover {
  background: var(--c-ember-hot);
  box-shadow: 0 10px 40px var(--c-ember-glow);
}
.btn-ember--full { flex: 1; }

.btn-ghost-sm {
  background: none;
  border: none;
  color: var(--c-ivory-mute);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  transition: color 150ms;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.btn-ghost-sm:hover { color: var(--c-ivory); }

/* trust */
.detail__trust {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid var(--c-hair);
}
.detail__trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
}
.detail__trust-item svg { color: var(--c-ember); flex-shrink: 0; }

/* ─── Manifesto strip ─── */
.detail__manifesto {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 32px;
  align-items: center;
  margin-top: 96px;
  padding: 56px 0;
  border-top: 1px solid var(--c-hair);
}
.detail__manifesto-line {
  height: 1px;
  background: var(--c-hair-bold);
}
.detail__manifesto-text {
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 22px;
  color: var(--c-ivory-dim);
  text-align: center;
  line-height: 1.6;
  text-wrap: balance;
  white-space: nowrap;
}
.detail__manifesto-text em { color: var(--c-ember); }

/* ─── Loading ─── */
.detail-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-ink);
}
.detail-loading__pulse {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--c-ember);
  animation: detail-pulse 1.4s ease-in-out infinite;
}
@keyframes detail-pulse {
  0%, 100% { transform: scale(0.85); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .detail { padding: 80px 40px 60px; }
  .detail__grid { gap: 48px; }
  .detail__name { font-size: 2.4rem; }
}

@media (max-width: 768px) {
  .detail { padding: 80px 24px 48px; }
  .detail__grid { grid-template-columns: 1fr; gap: 32px; }
  .detail__nav { flex-direction: column; align-items: flex-start; gap: 16px; }
  .detail__breadcrumb { display: none; }
  .detail__manifesto { grid-template-columns: 1fr; text-align: center; }
  .detail__manifesto-line { display: none; }
  .detail__manifesto-text { white-space: normal; }
  .detail__price { font-size: 40px; }
}
</style>
