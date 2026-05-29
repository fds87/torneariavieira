import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CustomerInfo } from '@/types/order'
import type { PaymentConfig } from '@/types/order'
import { apiFetch } from '@/lib/api'
import { useAddressStore } from '@/stores/address'

export const useCheckoutStore = defineStore('checkout', () => {
  const customer = ref<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
  })

  const mpPublicKey = ref<string | null>(null)
  const isMockMode = ref(false)

  async function fetchConfig(): Promise<PaymentConfig> {
    if (mpPublicKey.value !== null) {
      return { publicKey: mpPublicKey.value, mock: isMockMode.value }
    }
    const res = await apiFetch('/api/payments/config')
    const data = (await res.json()) as PaymentConfig
    mpPublicKey.value = data.publicKey
    isMockMode.value = data.mock
    return data
  }

  function syncAddressToCustomer() {
    const addressStore = useAddressStore()
    const addr = addressStore.currentAddress
    if (addr) {
      customer.value.city = addr.city
      customer.value.state = addr.state
    }
  }

  function reset() {
    customer.value = { name: '', email: '', phone: '', city: '', state: '' }
  }

  return { customer, mpPublicKey, isMockMode, fetchConfig, syncAddressToCustomer, reset }
})
