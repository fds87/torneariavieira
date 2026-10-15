<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth'] })

import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAddressStore } from '@/stores/address'
import type { Address, NewAddress } from '@/types/user'
import AddressForm from '@/components/account/AddressForm.vue'
import type { ShippingAddress } from '@/types/order'

const auth = useAuthStore()
const addressStore = useAddressStore()

const loading = ref(true)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const formError = ref<string | null>(null)
const formLabel = ref('Casa')

const emptyAddress: ShippingAddress = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
const formAddress = ref<ShippingAddress>({ ...emptyAddress })

onMounted(async () => {
  if (auth.accessToken) {
    await addressStore.fetchSavedAddresses(auth.accessToken)
  }
  loading.value = false
})

function openNew() {
  editingId.value = null
  formLabel.value = 'Casa'
  formAddress.value = { ...emptyAddress }
  formError.value = null
  showForm.value = true
}

function openEdit(addr: Address) {
  editingId.value = addr.id
  formLabel.value = addr.label
  formAddress.value = { cep: addr.cep, street: addr.street, number: addr.number, complement: addr.complement ?? '', neighborhood: addr.neighborhood, city: addr.city, state: addr.state }
  formError.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

async function saveAddress() {
  formError.value = null
  const { cep, street, number, neighborhood, city, state } = formAddress.value
  if (!cep || !street || !number || !neighborhood || !city || !state) {
    formError.value = 'Preencha todos os campos obrigatórios.'
    return
  }
  const data: NewAddress = { label: formLabel.value, ...formAddress.value, complement: formAddress.value.complement ?? null, isDefault: false }

  if (!auth.accessToken) return
  if (editingId.value !== null) {
    await addressStore.updateAddress(editingId.value, data, auth.accessToken)
  } else {
    const result = await addressStore.createAddress(data, auth.accessToken)
    if (result && 'error' in result) {
      formError.value = result.error
      return
    }
  }
  showForm.value = false
}

async function remove(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Remover este endereço?')) return
  await addressStore.deleteAddress(id, auth.accessToken)
}

async function makeDefault(id: number) {
  if (!auth.accessToken) return
  await addressStore.setDefault(id, auth.accessToken)
}
</script>

<template>
  <div class="addresses-view">
    <div class="view-header">
      <h2 class="page-title">Meus Endereços</h2>
      <button class="btn btn--primary" @click="openNew">+ Adicionar</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>

    <!-- Address list -->
    <div v-else-if="!showForm" class="addresses-list">
      <div v-if="addressStore.savedAddresses.length === 0" class="empty">
        <p>Você ainda não tem endereços salvos.</p>
      </div>
      <div v-for="addr in addressStore.savedAddresses" :key="addr.id" class="address-card">
        <div class="addr-top">
          <span class="addr-label">{{ addr.label }}</span>
          <span v-if="addr.isDefault" class="addr-default">Padrão</span>
        </div>
        <p class="addr-line">{{ addr.street }}, {{ addr.number }}<span v-if="addr.complement"> — {{ addr.complement }}</span></p>
        <p class="addr-line">{{ addr.neighborhood }} · {{ addr.city }}/{{ addr.state }}</p>
        <p class="addr-cep">CEP {{ addr.cep }}</p>

        <div class="addr-actions">
          <button class="action-btn" @click="openEdit(addr)">Editar</button>
          <button class="action-btn" @click="makeDefault(addr.id)" :disabled="addr.isDefault">
            {{ addr.isDefault ? 'Padrão' : 'Definir como padrão' }}
          </button>
          <button class="action-btn action-btn--danger" @click="remove(addr.id)">Remover</button>
        </div>
      </div>
    </div>

    <!-- Add / Edit form -->
    <div v-if="showForm" class="form-card">
      <h3 class="form-title">{{ editingId !== null ? 'Editar endereço' : 'Novo endereço' }}</h3>

      <div class="field" style="margin-bottom:1rem">
        <label class="field__label">Identificação</label>
        <input v-model="formLabel" class="field__input" type="text" placeholder="Ex: Casa, Trabalho..." />
      </div>

      <AddressForm v-model="formAddress" @update:model-value="v => formAddress = v" />

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <div class="form-actions">
        <button class="btn btn--primary" @click="saveAddress">Salvar</button>
        <button class="btn btn--ghost" @click="cancelForm">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--c-stone-50);
  margin: 0;
}

.loading, .empty {
  color: var(--text-muted);
  padding: 2rem 0;
}

.addresses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.address-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.addr-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.addr-label {
  font-weight: 700;
  color: var(--c-stone-100);
  font-size: 0.9rem;
}

.addr-default {
  font-size: 0.7rem;
  background: rgba(202, 138, 4, 0.15);
  color: var(--accent);
  border: 1px solid rgba(202, 138, 4, 0.3);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-weight: 600;
}

.addr-line, .addr-cep {
  font-size: 0.85rem;
  color: var(--c-stone-400);
  margin: 0.15rem 0;
  line-height: 1.4;
}

.addr-cep {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.addr-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-400);
  font-size: 0.75rem;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.action-btn--danger:hover {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.form-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.form-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--c-stone-100);
  margin: 0 0 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--c-stone-400);
}

.field__input {
  background: var(--c-stone-950, #0a0807);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-100);
  font-size: 0.9rem;
  padding: 0.65rem 0.875rem;
  width: 100%;
}

.field__input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-error {
  font-size: 0.85rem;
  color: #ef4444;
  margin: 0.75rem 0 0;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn--ghost {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-400);
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.btn--ghost:hover {
  border-color: var(--c-stone-500);
  color: var(--c-stone-100);
}
</style>
