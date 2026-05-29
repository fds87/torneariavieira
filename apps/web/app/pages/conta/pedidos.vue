<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth'] })

import { ref, onMounted } from 'vue'
import { apiFetchAuth } from '@/lib/api'
import type { Order } from '@/types/order'
import { formatPrice } from '@/utils/format'
import OrderStatusBadge from '@/components/account/OrderStatusBadge.vue'

const orders = ref<Order[]>([])
const loading = ref(true)
const expanded = ref<number | null>(null)

onMounted(async () => {
  try {
    const res = await apiFetchAuth('/api/account/orders')
    if (res.ok) orders.value = await res.json()
  } finally {
    loading.value = false
  }
})

async function toggleExpand(id: number) {
  if (expanded.value === id) {
    expanded.value = null
    return
  }
  expanded.value = id
  const order = orders.value.find((o) => o.id === id)
  if (order && !order.items) {
    const res = await apiFetchAuth(`/api/account/orders/${id}`)
    if (res.ok) {
      const data = await res.json()
      const idx = orders.value.findIndex((o) => o.id === id)
      if (idx !== -1) orders.value[idx] = data
    }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="orders-view">
    <h2 class="page-title">Meus Pedidos</h2>

    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else-if="orders.length === 0" class="empty">
      <p>Você ainda não fez nenhum pedido.</p>
      <RouterLink to="/" class="btn btn--primary" style="display:inline-block;margin-top:1rem">Ver Produtos</RouterLink>
    </div>

    <div v-else class="orders-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        :class="{ 'order-card--expanded': expanded === order.id }"
      >
        <div class="order-header" @click="toggleExpand(order.id)">
          <div class="order-meta">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-right">
            <OrderStatusBadge :status="order.status" />
            <span class="order-total">{{ formatPrice(order.totalAmount) }}</span>
            <span class="expand-icon">{{ expanded === order.id ? '−' : '+' }}</span>
          </div>
        </div>

        <div v-if="expanded === order.id" class="order-detail">
          <div v-if="order.items && order.items.length" class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-qty">{{ item.quantity }}x</span>
              <span class="item-price">{{ formatPrice(item.unitPrice) }}</span>
            </div>
          </div>
          <div v-if="order.shippingCep" class="order-address">
            <p class="address-label">Endereço</p>
            <p class="address-line">
              {{ order.shippingStreet }}, {{ order.shippingNumber }}
              <span v-if="order.shippingComplement"> — {{ order.shippingComplement }}</span>
            </p>
            <p class="address-line">{{ order.customerCity }}/{{ order.customerState }} — CEP {{ order.shippingCep }}</p>
          </div>
        </div>
      </div>
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

.loading,
.empty {
  color: var(--text-muted);
  padding: 2rem 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 0.15s;
}

.order-card--expanded {
  border-color: var(--accent);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  gap: 1rem;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.order-id {
  font-weight: 700;
  color: var(--c-stone-100);
  font-size: 0.9rem;
}

.order-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.order-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.order-total {
  font-weight: 700;
  color: var(--accent);
  font-size: 0.9rem;
}

.expand-icon {
  color: var(--c-stone-500);
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.order-detail {
  border-top: 1px solid var(--border);
  padding: 1rem 1.25rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.item-name {
  flex: 1;
  color: var(--c-stone-200);
}

.item-qty {
  color: var(--text-muted);
}

.item-price {
  font-weight: 600;
  color: var(--accent);
}

.order-address {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
}

.address-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin: 0 0 0.25rem;
}

.address-line {
  font-size: 0.85rem;
  color: var(--c-stone-300);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .order-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.4rem;
  }
}
</style>
