<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatPrice } from '@/utils/format'

interface MlListing {
  id: number; productId: number; mlItemId: string
  mlStatus: string; mlUrl: string | null; createdAt: string
}
interface ProductWithListing {
  id: number; name: string; price: number; inStock: boolean
  imageUrl: string | null; category: string; mlListing: MlListing | null
}

const route = useRoute()
const router = useRouter()
const { adminFetch } = useAdminFetch()

const connected   = ref(false)
const mlUserId    = ref<string | null>(null)
const products    = ref<ProductWithListing[]>([])
const loading     = ref(true)
const actionLoading = ref<number | null>(null)
const error       = ref('')

const publishedCount = computed(() => products.value.filter(p => p.mlListing).length)

async function mlFetch(path: string, options: RequestInit = {}) {
  return adminFetch(`/api/ml${path}`, options)
}

async function loadStatus() {
  const res = await mlFetch('/status')
  if (res.ok) { const d = await res.json(); connected.value = d.connected; mlUserId.value = d.mlUserId }
}
async function loadProducts() {
  const res = await mlFetch('/products')
  if (res.ok) products.value = await res.json()
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([loadStatus(), loadProducts()])
    if (route.query.connected === '1') await loadStatus()
  } finally { loading.value = false }
})

async function connectML() {
  error.value = ''
  const res = await mlFetch('/auth/start')
  if (!res.ok) { error.value = 'Erro ao iniciar conexão ML'; return }
  const { url } = await res.json()
  window.location.href = url
}

async function publish(p: ProductWithListing) {
  actionLoading.value = p.id; error.value = ''
  const res = await mlFetch(`/products/${p.id}/publish`, { method: 'POST' })
  const d = await res.json()
  if (!res.ok) error.value = d.error ?? 'Erro ao publicar'
  else await loadProducts()
  actionLoading.value = null
}

async function sync(p: ProductWithListing) {
  actionLoading.value = p.id; error.value = ''
  const res = await mlFetch(`/products/${p.id}/sync`, { method: 'PUT' })
  const d = await res.json()
  if (!res.ok) error.value = d.error ?? 'Erro ao sincronizar'
  else await loadProducts()
  actionLoading.value = null
}

async function pauseListing(p: ProductWithListing) {
  if (!confirm(`Pausar "${p.name}" no Mercado Livre?`)) return
  actionLoading.value = p.id
  await mlFetch(`/products/${p.id}/listing`, { method: 'DELETE' })
  await loadProducts()
  actionLoading.value = null
}

function logout() { sessionStorage.removeItem('admin-key'); router.replace('/admin') }
function statusLabel(s: string) { return ({ active: 'Ativo', paused: 'Pausado', closed: 'Encerrado' }[s] ?? s) }
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-f">B</span><span class="logo-amp">&</span><span class="logo-b">P</span>
        <span class="logo-admin">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/pedidos" class="nav-item">Pedidos</RouterLink>
        <RouterLink to="/admin/produtos" class="nav-item">Produtos</RouterLink>
        <RouterLink to="/admin/ml" class="nav-item nav-item--active">Mercado Livre</RouterLink>
      </nav>
      <button @click="logout" class="btn-logout">Sair</button>
    </aside>

    <main class="admin-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">Mercado Livre</h1>
          <p class="page-sub">Publique e sincronize produtos no marketplace</p>
        </div>
        <div class="header-right">
          <span class="conn-badge" :class="connected ? 'conn-badge--on' : 'conn-badge--off'">
            <span class="conn-dot" />
            {{ connected ? `Conectado · ${mlUserId}` : 'Desconectado' }}
          </span>
          <button v-if="!connected" class="btn-connect" @click="connectML">Conectar ao ML</button>
        </div>
      </div>

      <div v-if="error" class="state-msg state-msg--error">{{ error }}</div>
      <div v-if="loading" class="state-msg">Carregando...</div>

      <!-- Stats -->
      <div v-if="!loading && connected" class="stats-row">
        <div class="stat-card">
          <span class="stat-val">{{ products.length }}</span>
          <span class="stat-label">No catálogo</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ publishedCount }}</span>
          <span class="stat-label">Publicados</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ products.length - publishedCount }}</span>
          <span class="stat-label">Não publicados</span>
        </div>
      </div>

      <!-- Tabela -->
      <div v-if="!loading && connected" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status ML</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td class="cell-name">{{ p.name }}</td>
              <td>{{ p.price > 0 ? formatPrice(p.price) : 'Consulta' }}</td>
              <td>
                <span class="badge" :class="p.inStock ? 'badge--green' : 'badge--red'">
                  {{ p.inStock ? 'Em estoque' : 'Esgotado' }}
                </span>
              </td>
              <td>
                <template v-if="p.mlListing">
                  <span class="badge" :class="p.mlListing.mlStatus === 'active' ? 'badge--green' : 'badge--yellow'">
                    {{ statusLabel(p.mlListing.mlStatus) }}
                  </span>
                  <a v-if="p.mlListing.mlUrl" :href="p.mlListing.mlUrl" target="_blank" class="ml-link">↗ Ver</a>
                </template>
                <span v-else class="badge badge--gray">Não publicado</span>
              </td>
              <td class="cell-actions">
                <template v-if="!p.mlListing">
                  <button class="btn-action btn-action--primary"
                    :disabled="actionLoading === p.id || !p.price"
                    @click="publish(p)">
                    {{ actionLoading === p.id ? '...' : 'Publicar' }}
                  </button>
                </template>
                <template v-else>
                  <button class="btn-action" :disabled="actionLoading === p.id" @click="sync(p)">
                    {{ actionLoading === p.id ? '...' : 'Sincronizar' }}
                  </button>
                  <button v-if="p.mlListing.mlStatus === 'active'"
                    class="btn-action btn-action--danger" :disabled="actionLoading === p.id"
                    @click="pauseListing(p)">Pausar</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Connect CTA -->
      <div v-if="!loading && !connected" class="connect-cta">
        <div class="connect-icon">🔗</div>
        <h2 class="connect-title">Conecte sua conta do Mercado Livre</h2>
        <p class="connect-desc">Autorize o acesso para publicar produtos, sincronizar estoque e receber pedidos automaticamente.</p>
        <button class="btn-connect btn-connect--lg" @click="connectML">Conectar ao Mercado Livre →</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ── Layout (idêntico ao pedidos/produtos) ── */
.admin-layout { display: flex; min-height: 100vh; background: #0c0a09; color: #e7e5e4; }

.sidebar {
  width: 220px; background: #1c1917; border-right: 1px solid #292524;
  display: flex; flex-direction: column; padding: 1.5rem 1rem; flex-shrink: 0;
}
.sidebar-logo {
  font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700;
  margin-bottom: 2rem; display: flex; align-items: baseline; gap: 2px;
}
.logo-f, .logo-b { color: #f5f5f4; }
.logo-amp { color: #ca8a04; font-style: italic; margin: 0 2px; }
.logo-admin { font-size: 0.65rem; color: #78716c; font-family: Inter,sans-serif; font-weight: 400; margin-left: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
.nav-item { display: block; padding: 0.55rem 0.75rem; border-radius: 6px; font-size: 0.875rem; color: #a8a29e; text-decoration: none; transition: background 0.15s, color 0.15s; }
.nav-item:hover, .nav-item--active, .router-link-active { background: rgba(202,138,4,0.1); color: #ca8a04; }
.btn-logout { background: none; border: 1px solid #292524; color: #78716c; padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.btn-logout:hover { border-color: #44403c; color: #a8a29e; }

.admin-main { flex: 1; padding: 2rem; overflow-y: auto; }

/* ── Header ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 600; color: #f5f5f4; margin-bottom: 0.2rem; }
.page-sub { font-size: 0.85rem; color: #78716c; }
.header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.conn-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; font-size: 0.78rem; border: 1px solid; }
.conn-badge--on  { color: #4ade80; border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.06); }
.conn-badge--off { color: #78716c; border-color: #292524; background: #1c1917; }
.conn-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

.btn-connect { background: #ffe600; color: #1c1917; border: none; padding: 8px 18px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: opacity 0.15s; }
.btn-connect:hover { opacity: 0.88; }
.btn-connect--lg { padding: 12px 28px; font-size: 0.95rem; margin-top: 1rem; }

/* ── Stats ── */
.stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.stat-card { background: #1c1917; border: 1px solid #292524; border-radius: 8px; padding: 1rem 1.5rem; min-width: 120px; }
.stat-val { display: block; font-size: 1.8rem; font-weight: 700; color: #f5f5f4; line-height: 1; }
.stat-label { display: block; font-size: 0.78rem; color: #78716c; margin-top: 4px; }

/* ── Table ── */
.table-wrap { background: #1c1917; border: 1px solid #292524; border-radius: 10px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: #78716c; border-bottom: 1px solid #292524; }
.table td { padding: 0.875rem 1rem; border-bottom: 1px solid #1a1a1a; font-size: 0.875rem; color: #d4d0cc; vertical-align: middle; }
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: rgba(255,255,255,0.02); }

.cell-name { font-weight: 600; color: #f5f5f4; }
.cell-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

.badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; border: 1px solid transparent; }
.badge--green  { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.2); }
.badge--red    { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.2); }
.badge--yellow { background: rgba(250,204,21,0.1); color: #facc15; border-color: rgba(250,204,21,0.2); }
.badge--gray   { background: rgba(120,113,108,0.1); color: #78716c; border-color: #292524; }

.ml-link { margin-left: 8px; font-size: 0.75rem; color: #ca8a04; text-decoration: none; }
.ml-link:hover { text-decoration: underline; }

.btn-action { padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; border: 1px solid #44403c; background: #292524; color: #d4d0cc; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.btn-action:hover:not(:disabled) { background: #3c3734; }
.btn-action:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-action--primary { background: #ffe600; color: #1c1917; border-color: #ffe600; }
.btn-action--primary:hover:not(:disabled) { background: #ffd700; }
.btn-action--danger { color: #f87171; border-color: rgba(239,68,68,0.3); }
.btn-action--danger:hover:not(:disabled) { background: rgba(239,68,68,0.08); }

/* ── Connect CTA ── */
.connect-cta { max-width: 440px; margin: 3rem auto; text-align: center; background: #1c1917; border: 1px solid #292524; border-radius: 10px; padding: 2.5rem 2rem; }
.connect-icon { font-size: 2rem; margin-bottom: 1rem; }
.connect-title { font-size: 1.25rem; font-weight: 600; color: #f5f5f4; margin-bottom: 0.5rem; }
.connect-desc { font-size: 0.875rem; color: #78716c; line-height: 1.6; }

/* ── States ── */
.state-msg { padding: 1rem; color: #a8a29e; font-size: 0.875rem; }
.state-msg--error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; color: #f87171; margin-bottom: 1rem; }
</style>
