<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth'] })

import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiFetchAuth } from '@/lib/api'
import type { Order } from '@/types/order'
import { formatPrice } from '@/utils/format'

const auth = useAuthStore()
const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await apiFetchAuth('/api/account/orders')
    if (res.ok) orders.value = await res.json()
  } finally {
    loading.value = false
  }
})

const lastOrder = computed(() => orders.value[0] ?? null)

const statusLabel: Record<string, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  processing: 'Em processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}
</script>

<template>
  <div class="overview">
    <h2 class="page-title">Olá, {{ auth.user?.name?.split(' ')[0] }}</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total de pedidos</span>
        <span class="stat-value">{{ loading ? '—' : orders.length }}</span>
      </div>
      <div class="stat-card" v-if="lastOrder">
        <span class="stat-label">Último pedido</span>
        <span class="stat-value">{{ formatPrice(lastOrder.totalAmount) }}</span>
        <span class="stat-status">{{ statusLabel[lastOrder.status] ?? lastOrder.status }}</span>
      </div>
    </div>

    <div class="quick-links">
      <RouterLink to="/conta/pedidos" class="quick-link">Ver todos os pedidos</RouterLink>
      <RouterLink to="/conta/enderecos" class="quick-link">Gerenciar endereços</RouterLink>
      <RouterLink to="/" class="quick-link quick-link--accent">Continuar comprando</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--c-stone-50);
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-status {
  font-size: 0.8rem;
  color: var(--c-stone-400);
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--c-stone-400);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.15s;
  border-bottom: 1px solid var(--border);
}

.quick-link:hover {
  color: var(--c-stone-100);
}

.quick-link--accent {
  color: var(--accent);
}

.quick-link--accent:hover {
  color: var(--accent);
  opacity: 0.85;
}
</style>
