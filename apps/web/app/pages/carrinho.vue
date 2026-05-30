<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useFreightStore } from '@/stores/freight'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils/format'
import FreightCalculator from '@/components/cart/FreightCalculator.vue'
import { trackEvent } from '@/composables/useAnalytics'

const cart = useCartStore()
const freight = useFreightStore()
const auth = useAuthStore()
const router = useRouter()

const totalWithFreight = computed(
  () => cart.totalAmount + (freight.selected?.price ?? 0),
)

onMounted(() => {
  if (cart.items.length === 0) return
  trackEvent('view_cart', {
    currency: 'BRL', value: cart.totalAmount,
    items: cart.items.map(i => ({ item_id: String(i.productId), item_name: i.name, price: i.price, quantity: i.quantity })),
  })
})

function removeItem(productId: number, name: string, price: number) {
  trackEvent('remove_from_cart', { currency: 'BRL', value: price, items: [{ item_id: String(productId), item_name: name, price, quantity: 1 }] })
  cart.removeItem(productId)
}

function goToCheckout() {
  trackEvent('begin_checkout', {
    currency: 'BRL', value: totalWithFreight.value,
    items: cart.items.map(i => ({ item_id: String(i.productId), item_name: i.name, price: i.price, quantity: i.quantity })),
  })
  if (!auth.isLoggedIn) { router.push('/conta/entrar?redirect=/checkout'); return }
  router.push('/checkout')
}
</script>

<template>
  <main class="cartp">
    <div class="grid-layer cartp__grid"></div>
    <div class="shell cartp__inner">
      <div class="cartp__head">
        <span class="eyebrow"><b>//</b> Carrinho <span class="ln"></span></span>
        <h1 class="cartp__title font-display">SEU <span class="gold">PEDIDO</span></h1>
      </div>

      <div v-if="cart.items.length === 0" class="cartp__empty">
        <div class="cartp__empty-ic">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <p class="mono">Seu carrinho está vazio.</p>
        <RouterLink to="/catalogo" class="btn btn--gold" data-magnetic>Ver Catálogo <span class="arrow">→</span></RouterLink>
      </div>

      <div v-else class="cartp__layout">
        <div class="cartp__main">
          <div class="cartp__items">
            <div v-for="item in cart.items" :key="item.productId" class="citem">
              <RouterLink :to="`/produto/${item.slug}`" class="citem__thumb">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                <div v-else class="citem__ph">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
              </RouterLink>
              <div class="citem__info">
                <RouterLink :to="`/produto/${item.slug}`" class="citem__name font-display">{{ item.name }}</RouterLink>
                <span class="citem__price mono">{{ formatPrice(item.price) }} / un</span>
              </div>
              <div class="citem__controls">
                <div class="citem__qty">
                  <button class="citem__qty-btn" @click="cart.updateQuantity(item.productId, item.quantity - 1)">−</button>
                  <span class="citem__qty-val mono">{{ item.quantity }}</span>
                  <button class="citem__qty-btn" @click="cart.updateQuantity(item.productId, item.quantity + 1)">+</button>
                </div>
                <span class="citem__sub font-display">{{ formatPrice(item.price * item.quantity) }}</span>
                <button class="citem__rm" @click="removeItem(item.productId, item.name, item.price)" aria-label="Remover">&times;</button>
              </div>
            </div>
          </div>

          <FreightCalculator :items="cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }))" />
        </div>

        <aside class="cartp__summary">
          <div class="cartp__summary-label mono">// Resumo</div>
          <div class="srow"><span>Itens ({{ cart.totalItems }})</span><span>{{ formatPrice(cart.totalAmount) }}</span></div>
          <div v-if="freight.selected" class="srow"><span>Frete ({{ freight.selected.service }})</span><span>{{ formatPrice(freight.selected.price) }}</span></div>
          <div v-else class="srow srow--muted"><span>Frete</span><span>Calcule ao lado</span></div>
          <div class="stotal"><span>Total</span><span class="stotal__v font-display">{{ formatPrice(totalWithFreight) }}</span></div>
          <button class="btn btn--gold cartp__checkout" @click="goToCheckout">{{ auth.isLoggedIn ? 'Ir para Pagamento' : 'Entrar para Comprar' }} <span class="arrow">→</span></button>
          <RouterLink to="/catalogo" class="cartp__continue mono">← Continuar comprando</RouterLink>
        </aside>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cartp { position: relative; min-height: 100vh; background: var(--c-bg); padding: 116px 0 80px; overflow: hidden; }
.cartp__grid { opacity: 0.5; }
.cartp__inner { position: relative; z-index: 1; }
.cartp__head { margin-bottom: 44px; }
.cartp__title { font-size: clamp(2.4rem, 6vw, 4.5rem); line-height: 0.9; letter-spacing: 0.02em; margin-top: 14px; }

.cartp__empty { display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 70px 0; border: 1px solid var(--c-border); background: var(--c-surface); }
.cartp__empty-ic { width: 76px; height: 76px; border: 1px solid var(--c-border-2); display: grid; place-items: center; color: var(--c-accent); }
.cartp__empty p { color: var(--c-muted); letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.72rem; }

.cartp__layout { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: start; }
@media (min-width: 940px){ .cartp__layout { grid-template-columns: 1fr 340px; gap: 32px; } }
.cartp__main { display: flex; flex-direction: column; gap: 28px; }
.cartp__items { border-top: 1px solid var(--c-border); }

.citem { display: flex; align-items: center; gap: 18px; padding: 20px 0; border-bottom: 1px solid var(--c-border); }
.citem__thumb { flex-shrink: 0; width: 76px; height: 76px; border: 1px solid var(--c-border); background: var(--c-surface); display: grid; place-items: center; overflow: hidden; }
.citem__thumb img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
.citem__ph { color: var(--c-faint); }
.citem__info { flex: 1; min-width: 0; }
.citem__name { display: block; font-size: 1.3rem; letter-spacing: 0.02em; color: var(--c-text); line-height: 1; transition: color 0.2s; }
.citem__name:hover { color: var(--c-accent); }
.citem__price { display: block; font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-muted); margin-top: 8px; }
.citem__controls { display: flex; align-items: center; gap: 18px; }
.citem__qty { display: flex; align-items: center; border: 1px solid var(--c-border-2); }
.citem__qty-btn { width: 34px; height: 38px; color: var(--c-text); font-size: 1rem; display: grid; place-items: center; transition: background 0.2s; }
.citem__qty-btn:hover { background: var(--c-surface2); }
.citem__qty-val { width: 38px; text-align: center; font-size: 0.78rem; color: var(--c-text); line-height: 38px; border-left: 1px solid var(--c-border-2); border-right: 1px solid var(--c-border-2); }
.citem__sub { min-width: 92px; text-align: right; font-size: 1.3rem; color: var(--c-accent); letter-spacing: 0.02em; }
.citem__rm { color: var(--c-faint); font-size: 1.5rem; line-height: 1; padding: 0 4px; transition: color 0.2s; }
.citem__rm:hover { color: #ef4444; }

.cartp__summary { border: 1px solid var(--c-border); background: var(--c-surface); padding: 28px 24px; position: sticky; top: 96px; }
.cartp__summary-label { font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-accent); margin-bottom: 22px; }
.srow { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--c-muted); padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--c-border); }
.srow--muted span:last-child { font-style: italic; font-size: 0.76rem; }
.stotal { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.stotal span:first-child { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-text); }
.stotal__v { font-size: 1.9rem; color: var(--c-accent); letter-spacing: 0.02em; }
.cartp__checkout { width: 100%; justify-content: center; }
.cartp__continue { display: block; text-align: center; margin-top: 16px; color: var(--c-muted); font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; transition: color 0.2s; }
.cartp__continue:hover { color: var(--c-accent); }

@media (max-width: 640px){
  .citem { flex-wrap: wrap; }
  .citem__controls { width: 100%; justify-content: space-between; }
}
</style>
