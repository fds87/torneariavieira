import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ShippingAddress } from '@/types/order'
import type { Address, NewAddress } from '@/types/user'

const STORAGE_KEY = 'forja-brasa-address'

function loadFromStorage(): ShippingAddress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export const useAddressStore = defineStore('address', () => {
  const currentAddress = ref<ShippingAddress | null>(loadFromStorage())
  const savedAddresses = ref<Address[]>([])
  const loadingCep = ref(false)
  const cepError = ref<string | null>(null)

  function setCurrentAddress(addr: ShippingAddress | null) {
    currentAddress.value = addr
    if (addr) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addr))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clearCurrentAddress() {
    setCurrentAddress(null)
  }

  async function lookupCep(cep: string): Promise<Partial<ShippingAddress> | null> {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return null

    loadingCep.value = true
    cepError.value = null
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!res.ok) {
        cepError.value = 'Erro ao buscar CEP'
        return null
      }
      const data = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
      if (data.erro) {
        cepError.value = 'CEP não encontrado'
        return null
      }
      return {
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      }
    } catch {
      cepError.value = 'Erro de conexão ao buscar CEP'
      return null
    } finally {
      loadingCep.value = false
    }
  }

  async function fetchSavedAddresses(token: string): Promise<void> {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/account/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        savedAddresses.value = await res.json()
      }
    } catch {
      // silently fail
    }
  }

  async function createAddress(data: NewAddress, token: string): Promise<{ address: Address } | { error: string } | null> {
    let res: Response
    try {
      res = await fetch(`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/account/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
    } catch {
      return { error: 'Sem ligação ao servidor. Verifique a sua internet.' }
    }
    if (!res.ok) {
      let msg = `Erro ${res.status}`
      try {
        const body = await res.json() as { error?: string }
        if (body.error) msg = body.error
      } catch { /* ignore */ }
      return { error: msg }
    }
    const created = await res.json() as Address
    savedAddresses.value.push(created)
    return { address: created }
  }

  async function updateAddress(id: number, data: Partial<NewAddress>, token: string): Promise<Address | null> {
    const res = await fetch(`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/account/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const updated = await res.json() as Address
    const idx = savedAddresses.value.findIndex((a) => a.id === id)
    if (idx !== -1) savedAddresses.value[idx] = updated
    return updated
  }

  async function deleteAddress(id: number, token: string): Promise<boolean> {
    const res = await fetch(`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/account/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return false
    savedAddresses.value = savedAddresses.value.filter((a) => a.id !== id)
    return true
  }

  async function setDefault(id: number, token: string): Promise<void> {
    const res = await fetch(`${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/account/addresses/${id}/default`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      savedAddresses.value = savedAddresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
    }
  }

  return {
    currentAddress,
    savedAddresses,
    loadingCep,
    cepError,
    formatCep,
    setCurrentAddress,
    clearCurrentAddress,
    lookupCep,
    fetchSavedAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  }
})
