<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils/format'
import type { OrderStatus } from '@/types/order'

const router = useRouter()

interface AdminOrder {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCity: string | null
  customerState: string | null
  status: OrderStatus
  totalAmount: number
  mpPaymentStatus: string | null
  createdAt: string
}

const orders = ref<AdminOrder[]>([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref<'all' | OrderStatus>('all')

const { adminFetch } = useAdminFetch()
const adminKey = import.meta.client ? (sessionStorage.getItem('admin-key') ?? '') : ''

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando Pagamento',
  paid: 'Pago',
  processing: 'Em Producao',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<OrderStatus, string> = {
  pending_payment: '#78716c',
  paid: '#4ade80',
  processing: '#60a5fa',
  shipped: '#a78bfa',
  delivered: '#ca8a04',
  cancelled: '#f87171',
}

async function fetchOrders() {
  loading.value = true
  try {
    const res = await adminFetch('/api/admin/orders')
    if (res.status === 401) {
      router.replace('/admin')
      return
    }
    orders.value = (await res.json()) as AdminOrder[]
  } catch {
    error.value = 'Erro ao carregar pedidos'
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: number, status: OrderStatus) {
  const res = await adminFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
  if (res.ok) {
    const updated = await res.json()
    const idx = orders.value.findIndex((o) => o.id === id)
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], ...updated }
  }
}

function logout() {
  sessionStorage.removeItem('admin-key')
  router.replace('/admin')
}

function formatDate(dt: string) {
  return new Date(dt + 'Z').toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const filtered = computed(() =>
  filterStatus.value === 'all'
    ? orders.value
    : orders.value.filter((o) => o.status === filterStatus.value),
)

onMounted(fetchOrders)
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-f">F</span><span class="logo-amp">&</span><span class="logo-b">B</span>
        <span class="logo-admin">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/pedidos" class="nav-item nav-item--active">Pedidos</RouterLink>
        <RouterLink to="/admin/produtos" class="nav-item">Produtos</RouterLink>
        <RouterLink to="/admin/ml" class="nav-item">Mercado Livre</RouterLink>
      </nav>
      <button @click="logout" class="btn-logout">Sair</button>
    </aside>

    <main class="admin-main">
      <div class="page-header">
        <h1 class="page-title">Pedidos</h1>
        <div class="filters">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Todos</option>
            <option v-for="(label, val) in statusLabels" :key="val" :value="val">{{ label }}</option>
          </select>
          <button @click="fetchOrders" class="btn-refresh">↻ Atualizar</button>
        </div>
      </div>

      <div v-if="loading" class="state-msg">Carregando...</div>
      <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>
      <div v-else-if="filtered.length === 0" class="state-msg">Nenhum pedido encontrado.</div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Status Pagamento</th>
              <th>Status Pedido</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filtered" :key="order.id">
              <td class="cell-id">{{ order.id }}</td>
              <td class="cell-customer">
                <div class="customer-name">{{ order.customerName }}</div>
                <div class="customer-contact">{{ order.customerPhone }}</div>
              </td>
              <td class="cell-amount">{{ formatPrice(order.totalAmount) }}</td>
              <td>
                <span
                  class="badge"
                  :style="{ background: order.mpPaymentStatus === 'approved' ? 'rgba(74,222,128,0.12)' : 'rgba(120,113,108,0.15)', color: order.mpPaymentStatus === 'approved' ? '#4ade80' : '#a8a29e' }"
                >
                  {{ order.mpPaymentStatus === 'approved' ? 'Aprovado' : order.mpPaymentStatus ?? 'Aguardando' }}
                </span>
              </td>
              <td>
                <select
                  :value="order.status"
                  @change="(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value as OrderStatus)"
                  class="status-select"
                  :style="{ color: statusColors[order.status] }"
                >
                  <option v-for="(label, val) in statusLabels" :key="val" :value="val">
                    {{ label }}
                  </option>
                </select>
              </td>
              <td class="cell-date">{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0c0a09;
  font-family: Inter, sans-serif;
}

.sidebar {
  width: 200px;
  background: #1c1917;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}

.sidebar-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 2rem;
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.logo-f, .logo-b { color: #f5f5f4; }
.logo-amp { color: #ca8a04; font-style: italic; margin: 0 2px; }
.logo-admin { font-size: 0.65rem; color: #78716c; font-family: Inter,sans-serif; font-weight: 400; margin-left: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: block;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #a8a29e;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover,
.nav-item--active,
.router-link-active {
  background: rgba(202,138,4,0.1);
  color: #ca8a04;
}

.btn-logout {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #78716c;
  font-size: 0.8rem;
  padding: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.btn-logout:hover { color: #f87171; border-color: rgba(248,113,113,0.3); }

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-x: auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #f5f5f4;
}

.filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select,
.status-select {
  background: #1c1917;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f5f5f4;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-refresh {
  background: rgba(202,138,4,0.1);
  border: 1px solid rgba(202,138,4,0.3);
  border-radius: 6px;
  color: #ca8a04;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
}

.state-msg {
  color: #78716c;
  font-size: 0.9rem;
  padding: 2rem;
  text-align: center;
}

.state-msg--error { color: #f87171; }

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  text-align: left;
  padding: 0.6rem 1rem;
  color: #78716c;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #d6d3d1;
  vertical-align: middle;
}

.table tr:hover td { background: rgba(255,255,255,0.02); }

.cell-id { color: #78716c; }
.customer-name { color: #f5f5f4; font-weight: 500; }
.customer-contact { color: #78716c; font-size: 0.8rem; margin-top: 2px; }
.cell-amount { color: #ca8a04; font-weight: 600; }
.cell-date { color: #78716c; font-size: 0.8rem; white-space: nowrap; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-select {
  min-width: 150px;
}
</style>
