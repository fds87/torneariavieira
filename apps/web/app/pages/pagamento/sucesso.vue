<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatPrice } from '@/utils/format'
import type { Order } from '@/types/order'
import { trackPurchase } from '@/composables/useAnalytics'

const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)

onMounted(async () => {
  const externalRef = route.query.external_reference as string
  if (!externalRef) { loading.value = false; return }

  try {
    const res = await fetch(`/api/orders/${externalRef}`)
    if (res.ok) {
      order.value = await res.json()
      if (order.value) {
        trackPurchase({
          id: order.value.id,
          total: order.value.totalAmount,
          items: order.value.items.map(i => ({
            id: i.id,
            name: i.productName,
            price: i.unitPrice,
            quantity: i.quantity,
          })),
        })
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container result-page">
    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else class="result-card result-card--success">
      <div class="result-icon result-icon--success">✓</div>
      <h1 class="result-title">Pagamento confirmado!</h1>
      <p class="result-subtitle">Seu pedido foi recebido e esta sendo processado.</p>

      <div v-if="order" class="order-details">
        <p class="order-id">Pedido #{{ order.id }}</p>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span>{{ item.productName }} &times;{{ item.quantity }}</span>
            <span>{{ formatPrice(item.unitPrice * item.quantity) }}</span>
          </div>
        </div>
        <div class="order-total">
          <span>Total</span>
          <span class="total-value">{{ formatPrice(order.totalAmount) }}</span>
        </div>
        <p class="contact-note">
          Entraremos em contato pelo WhatsApp <strong>{{ order.customerPhone }}</strong> para combinar a entrega.
        </p>
      </div>

      <RouterLink to="/" class="btn btn--primary" style="margin-top:2rem">
        Voltar para a loja
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.result-page {
  padding: 6rem 1.5rem 4rem;
  display: flex;
  justify-content: center;
}

.result-card {
  max-width: 520px;
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
}

.result-card--success {
  border-color: rgba(74, 222, 128, 0.3);
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
}

.result-icon--success {
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
}

.result-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--c-stone-50);
  margin-bottom: 0.5rem;
}

.result-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.order-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.order-items {
  text-align: left;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text);
  padding: 0.35rem 0;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1rem;
  color: var(--c-stone-100);
  margin-bottom: 1.5rem;
}

.total-value { color: var(--accent); }

.contact-note {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: rgba(202,138,4,0.06);
  border: 1px solid rgba(202,138,4,0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  text-align: left;
}
</style>
