<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils/format'
import type { Product, ProductImage } from '@/types/product'

type ProductCategory = Product['category']

interface ProductForm {
  slug: string
  name: string
  category: ProductCategory
  description: string
  material: string
  price: number
  priceMin: number
  priceMax: number
  imageUrl: string
  images: ProductImage[]
  inStock: boolean
  weightG: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

const router = useRouter()
const { adminFetch } = useAdminFetch()
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const adminKey = import.meta.client ? (sessionStorage.getItem('admin-key') ?? '') : ''

// Modal de adicionar/editar
const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const form = ref<ProductForm>({
  slug: '', name: '', category: 'espeto', description: '',
  material: '', price: 0, priceMin: 0, priceMax: 0,
  imageUrl: '', images: [], inStock: true,
  weightG: 500, lengthCm: 30, widthCm: 20, heightCm: 10,
})

const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function openAdd() {
  editingId.value = null
  uploadError.value = ''
  form.value = { slug: '', name: '', category: 'espeto' as ProductCategory, description: '', material: '', price: 0, priceMin: 0, priceMax: 0, imageUrl: '', images: [], inStock: true, weightG: 500, lengthCm: 30, widthCm: 20, heightCm: 10 }
  showModal.value = true
}

function openEdit(p: Product) {
  editingId.value = p.id
  uploadError.value = ''
  form.value = {
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    material: p.material,
    price: p.price,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    imageUrl: p.imageUrl ?? '',
    images: Array.isArray(p.images) ? [...p.images] : [],
    inStock: p.inStock,
    weightG: p.weightG ?? 500,
    lengthCm: p.lengthCm ?? 30,
    widthCm: p.widthCm ?? 20,
    heightCm: p.heightCm ?? 10,
  }
  showModal.value = true
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await adminFetch('/api/admin/products')
    if (res.status === 401) { router.replace('/admin'); return }
    products.value = (await res.json()) as Product[]
  } catch {
    error.value = 'Erro ao carregar produtos'
  } finally {
    loading.value = false
  }
}

async function saveProduct() {
  saving.value = true
  error.value = ''
  try {
    const isEdit = editingId.value !== null
    const url = isEdit ? `/api/admin/products/${editingId.value}` : '/api/admin/products'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await adminFetch(url, { method, body: JSON.stringify(form.value) })
    if (res.ok) {
      await fetchProducts()
      showModal.value = false
    } else {
      const data = await res.json().catch(() => ({}))
      error.value = (data as { error?: string }).error ?? `Erro ${res.status}`
    }
  } catch {
    error.value = 'Erro de conexão'
  } finally {
    saving.value = false
  }
}

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  uploadError.value = ''
  uploading.value = true
  const base = (useRuntimeConfig().public.apiUrl as string || '').replace(/\/$/, '')
  const key = import.meta.client ? (sessionStorage.getItem('admin-key') ?? '') : ''
  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) { uploadError.value = `"${file.name}" não é uma imagem`; continue }
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${base}/api/admin/uploads`, {
        method: 'POST',
        headers: { 'x-admin-key': key },
        body: fd,
      })
      if (res.ok) {
        const img = (await res.json()) as ProductImage
        form.value.images.push(img)
      } else {
        const data = await res.json().catch(() => ({}))
        uploadError.value = (data as { error?: string }).error ?? `Erro ${res.status} ao enviar "${file.name}"`
      }
    }
  } catch {
    uploadError.value = 'Erro de conexão ao enviar imagem'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function removeImage(idx: number) {
  const img = form.value.images[idx]
  form.value.images.splice(idx, 1)
  // Limpa o objeto no R2 (best-effort) — só imagens hospedadas têm key.
  if (img?.key) {
    adminFetch(`/api/admin/uploads/${img.key}`, { method: 'DELETE' }).catch(() => {})
  }
}

function setCover(idx: number) {
  if (idx <= 0) return
  const [img] = form.value.images.splice(idx, 1)
  if (img) form.value.images.unshift(img)
}

async function toggleStock(p: Product) {
  await adminFetch(`/api/admin/products/${p.id}`, { method: 'PATCH', body: JSON.stringify({ inStock: !p.inStock }) })
  const idx = products.value.findIndex((x) => x.id === p.id)
  if (idx !== -1) products.value[idx] = { ...p, inStock: !p.inStock }
}

async function deleteProduct(id: number) {
  if (!confirm('Tem certeza? Esta acao nao pode ser desfeita.')) return
  await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  products.value = products.value.filter((p) => p.id !== id)
}

function logout() {
  sessionStorage.removeItem('admin-key')
  router.replace('/admin')
}

onMounted(fetchProducts)
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-f">F</span><span class="logo-amp">&</span><span class="logo-b">B</span>
        <span class="logo-admin">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/pedidos" class="nav-item">Pedidos</RouterLink>
        <RouterLink to="/admin/produtos" class="nav-item nav-item--active">Produtos</RouterLink>
        <RouterLink to="/admin/ml" class="nav-item">Mercado Livre</RouterLink>
      </nav>
      <button @click="logout" class="btn-logout">Sair</button>
    </aside>

    <main class="admin-main">
      <div class="page-header">
        <h1 class="page-title">Produtos</h1>
        <button @click="openAdd" class="btn-add">+ Novo Produto</button>
      </div>

      <div v-if="loading" class="state-msg">Carregando...</div>
      <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preco</th>
              <th>Estoque</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td class="cell-id">{{ p.id }}</td>
              <td class="cell-name">
                <div>{{ p.name }}</div>
                <div class="cell-slug">{{ p.slug }}</div>
              </td>
              <td>
                <span class="badge-category">{{ p.category }}</span>
              </td>
              <td class="cell-price">
                {{ p.price > 0 ? formatPrice(p.price) : 'Consulta' }}
              </td>
              <td>
                <button
                  @click="toggleStock(p)"
                  class="toggle-stock"
                  :class="p.inStock ? 'toggle-stock--on' : 'toggle-stock--off'"
                >
                  {{ p.inStock ? 'Disponivel' : 'Indisponivel' }}
                </button>
              </td>
              <td class="cell-actions">
                <button @click="openEdit(p)" class="btn-edit">Editar</button>
                <button @click="deleteProduct(p.id)" class="btn-delete">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal adicionar/editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2 class="modal-title">{{ editingId ? 'Editar Produto' : 'Novo Produto' }}</h2>

        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="form.name" required placeholder="Ex: Espeto Duplo" />
            </div>
            <div class="form-group">
              <label>Slug *</label>
              <input v-model="form.slug" required placeholder="ex: espeto-duplo" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="form.category">
                <option value="espeto">Espeto</option>
                <option value="grelha">Grelha</option>
                <option value="churrasqueira">Churrasqueira</option>
                <option value="acessorio">Acessorio</option>
                <option value="kit">Kit</option>
              </select>
            </div>
            <div class="form-group">
              <label>Material</label>
              <input v-model="form.material" placeholder="Ex: Inox AISI 304" />
            </div>
          </div>

          <div class="form-group">
            <label>Descricao</label>
            <textarea v-model="form.description" rows="3" placeholder="Descricao do produto..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Preco (R$)</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>Preco Min (R$)</label>
              <input v-model.number="form.priceMin" type="number" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>Preco Max (R$)</label>
              <input v-model.number="form.priceMax" type="number" step="0.01" min="0" />
            </div>
          </div>

          <div class="form-group">
            <label>Fotos do produto</label>
            <div class="uploader">
              <div v-if="form.images.length" class="thumb-grid">
                <div
                  v-for="(img, idx) in form.images"
                  :key="img.url"
                  class="thumb"
                  :class="{ 'thumb--cover': idx === 0 }"
                >
                  <img :src="img.url" :alt="`Foto ${idx + 1}`" />
                  <span v-if="idx === 0" class="thumb-badge">Capa</span>
                  <div class="thumb-actions">
                    <button v-if="idx !== 0" type="button" class="thumb-btn" title="Definir como capa" @click="setCover(idx)">★</button>
                    <button type="button" class="thumb-btn thumb-btn--del" title="Remover" @click="removeImage(idx)">✕</button>
                  </div>
                </div>
              </div>

              <label class="upload-drop" :class="{ 'is-loading': uploading }">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  @change="onFilesSelected"
                />
                <span v-if="uploading">Enviando...</span>
                <span v-else>+ Adicionar fotos <small>(pode selecionar várias)</small></span>
              </label>
              <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
            </div>
          </div>

          <div class="form-group">
            <label>URL da Imagem (opcional — usada se nenhuma foto enviada)</label>
            <input v-model="form.imageUrl" type="url" placeholder="https://..." />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Peso (g)</label>
              <input v-model.number="form.weightG" type="number" min="1" placeholder="500" />
            </div>
            <div class="form-group">
              <label>Comprimento (cm)</label>
              <input v-model.number="form.lengthCm" type="number" min="1" step="0.1" placeholder="30" />
            </div>
            <div class="form-group">
              <label>Largura (cm)</label>
              <input v-model.number="form.widthCm" type="number" min="1" step="0.1" placeholder="20" />
            </div>
            <div class="form-group">
              <label>Altura (cm)</label>
              <input v-model.number="form.heightCm" type="number" min="1" step="0.1" placeholder="10" />
            </div>
          </div>

          <div class="form-check">
            <input id="inStock" v-model="form.inStock" type="checkbox" />
            <label for="inStock">Disponivel em estoque</label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancel">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-save">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout compartilhado com AdminOrders */
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

.sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }

.nav-item {
  display: block;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #a8a29e;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover, .nav-item--active, .router-link-active {
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

.admin-main { flex: 1; padding: 2rem; overflow-x: auto; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title { font-size: 1.4rem; font-weight: 600; color: #f5f5f4; }

.btn-add {
  background: #ca8a04;
  color: #0c0a09;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.state-msg { color: #78716c; font-size: 0.9rem; padding: 2rem; text-align: center; }
.state-msg--error { color: #f87171; }
.table-wrap { overflow-x: auto; }

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
.cell-name div:first-child { color: #f5f5f4; font-weight: 500; }
.cell-slug { color: #78716c; font-size: 0.75rem; margin-top: 2px; font-family: monospace; }
.cell-price { color: #ca8a04; font-weight: 600; }

.badge-category {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #a8a29e;
  text-transform: capitalize;
}

.toggle-stock {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.toggle-stock--on { background: rgba(74,222,128,0.12); color: #4ade80; }
.toggle-stock--off { background: rgba(248,113,113,0.12); color: #f87171; }

.cell-actions { display: flex; gap: 0.5rem; }
.btn-edit, .btn-delete {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid;
  cursor: pointer;
  font-family: inherit;
}
.btn-edit { border-color: rgba(202,138,4,0.3); color: #ca8a04; background: rgba(202,138,4,0.08); }
.btn-delete { border-color: rgba(248,113,113,0.3); color: #f87171; background: rgba(248,113,113,0.08); }

/* Uploader de imagens */
.uploader { display: flex; flex-direction: column; gap: 0.75rem; }

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 0.6rem;
}

.thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: #0c0a09;
}
.thumb--cover { border-color: #ca8a04; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.thumb-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ca8a04;
  color: #0c0a09;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.thumb-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 3px;
}
.thumb-btn {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 4px;
  background: rgba(12,10,9,0.8);
  color: #f5f5f4;
  font-size: 0.7rem;
  cursor: pointer;
  line-height: 1;
}
.thumb-btn:hover { background: #ca8a04; color: #0c0a09; }
.thumb-btn--del:hover { background: #f87171; color: #0c0a09; }

.upload-drop {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 6px;
  color: #a8a29e;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  text-align: center;
}
.upload-drop:hover { border-color: #ca8a04; color: #ca8a04; }
.upload-drop small { color: #78716c; }
.upload-drop.is-loading { opacity: 0.6; pointer-events: none; }
.upload-error { color: #f87171; font-size: 0.75rem; margin: 0; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: #1c1917;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f5f5f4;
  margin-bottom: 1.5rem;
}

.modal-form .form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.modal-form .form-group {
  margin-bottom: 1rem;
}

.modal-form label {
  display: block;
  font-size: 0.8rem;
  color: #a8a29e;
  margin-bottom: 0.35rem;
}

.modal-form input,
.modal-form select,
.modal-form textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: #0c0a09;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f5f5f4;
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
}

.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  outline: none;
  border-color: #ca8a04;
}

.modal-form textarea { resize: vertical; }

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #d6d3d1;
  font-size: 0.875rem;
}

.form-check input { width: auto; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #a8a29e;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-family: inherit;
}

.btn-save {
  background: #ca8a04;
  color: #0c0a09;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
