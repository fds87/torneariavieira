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
    currency: 'BRL',
    value: cart.totalAmount,
    items: cart.items.map(i => ({
      item_id: String(i.productId),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
})

function removeItem(productId: number, name: string, price: number) {
  trackEvent('remove_from_cart', {
    currency: 'BRL',
    value: price,
    items: [{ item_id: String(productId), item_name: name, price, quantity: 1 }],
  })
  cart.removeItem(productId)
}

function goToCheckout() {
  trackEvent('begin_checkout', {
    currency: 'BRL',
    value: totalWithFreight.value,
    items: cart.items.map(i => ({
      item_id: String(i.productId),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
  if (!auth.isLoggedIn) {
    router.push('/conta/entrar?redirect=/checkout')
    return
  }
  router.push('/checkout')
}
</script>

<template>
  <main class="container cart-page">
    <h1 class="page-title">Carrinho</h1>

    <div v-if="cart.items.length === 0" class="empty-cart">
      <p>Seu carrinho está vazio.</p>
      <RouterLink to="/" class="btn btn--primary">Ver Produtos</RouterLink>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-main">
        <!-- Items -->
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.productId" class="cart-item">
            <RouterLink :to="`/produto/${item.slug}`" class="item-thumb">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="item-thumb-img" />
              <div v-else class="item-thumb-placeholder" />
            </RouterLink>
            <div class="item-info">
              <RouterLink :to="`/produto/${item.slug}`" class="item-name">
                {{ item.name }}
              </RouterLink>
              <span class="item-price">{{ formatPrice(item.price) }} /un</span>
            </div>

            <div class="item-controls">
              <div class="quantity-control">
                <button
                  class="qty-btn"
                  @click="cart.updateQuantity(item.productId, item.quantity - 1)"
                >
                  -
                </button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="cart.updateQuantity(item.productId, item.quantity + 1)"
                >
                  +
                </button>
              </div>
              <span class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</span>
              <button class="remove-btn" @click="removeItem(item.productId, item.name, item.price)">&times;</button>
            </div>
          </div>
        </div>

        <!-- Freight Calculator -->
        <FreightCalculator :items="cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }))" />
      </div>

      <!-- Sticky Summary Sidebar -->
      <div class="cart-summary">
        <div class="summary-row">
          <span>Itens ({{ cart.totalItems }})</span>
          <span>{{ formatPrice(cart.totalAmount) }}</span>
        </div>

        <div v-if="freight.selected" class="summary-row">
          <span>Frete ({{ freight.selected.service }})</span>
          <span>{{ formatPrice(freight.selected.price) }}</span>
        </div>
        <div v-else class="summary-row summary-row--muted">
          <span>Frete</span>
          <span>Calcule abaixo</span>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span class="total-value">{{ formatPrice(totalWithFreight) }}</span>
        </div>

        <button class="btn btn--primary full-width" @click="goToCheckout">
          {{ auth.isLoggedIn ? 'Ir para Pagamento' : 'Entrar para Comprar' }}
        </button>
        <RouterLink to="/" class="continue-link">Continuar comprando</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cart-page {
  padding: 6rem 1.5rem 4rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--c-stone-50);
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: var(--text-muted);
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

.cart-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: 0.75rem;
}

.item-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-stone-900);
}

.item-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--c-stone-800);
}

.item-name {
  font-weight: 600;
  color: var(--c-stone-100);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease);
}

.item-name:hover {
  color: var(--accent);
}

.item-price {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.qty-btn {
  background: var(--bg-card);
  border: none;
  color: var(--c-stone-100);
  width: 36px;
  height: 36px;
  font-size: 1rem;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease);
}

.qty-btn:hover {
  background: var(--c-stone-900);
}

.qty-value {
  width: 36px;
  text-align: center;
  font-weight: 600;
  color: var(--c-stone-100);
  font-size: 0.9rem;
}

.item-subtotal {
  font-weight: 600;
  color: var(--accent);
  min-width: 90px;
  text-align: right;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--c-stone-500);
  font-size: 1.4rem;
  padding: 0 0.25rem;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease);
}

.remove-btn:hover {
  color: var(--c-red, #ef4444);
}

/* Sidebar */
.cart-summary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  position: sticky;
  top: 96px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.9rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.75rem;
}

.summary-row--muted span:last-child {
  font-style: italic;
  font-size: 0.82rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  color: var(--c-stone-100);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.total-value {
  color: var(--accent);
}

.full-width {
  width: 100%;
}

.continue-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: color var(--duration-fast) var(--ease);
}

.continue-link:hover {
  color: var(--c-stone-100);
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
