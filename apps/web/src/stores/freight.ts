import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/lib/api'

export interface FreightOption {
  service: 'PAC' | 'SEDEX'
  price: number
  days: number
}

export const useFreightStore = defineStore('freight', () => {
  const options = ref<FreightOption[]>([])
  const selected = ref<FreightOption | null>(null)
  const calculating = ref(false)
  const error = ref<string | null>(null)
  const calculatedCep = ref<string | null>(null)

  async function calculate(
    cep: string,
    items: Array<{ productId: number; quantity: number }>,
  ): Promise<void> {
    calculating.value = true
    error.value = null
    options.value = []
    selected.value = null
    try {
      const res = await apiFetch('/api/freight/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cep.replace(/\D/g, ''), items }),
      })
      const data = await res.json() as { options?: FreightOption[]; error?: string }
      if (!res.ok) {
        error.value = data.error ?? 'Erro ao calcular frete'
        return
      }
      options.value = data.options ?? []
      calculatedCep.value = cep.replace(/\D/g, '')
    } catch {
      error.value = 'Erro de conexão ao calcular frete'
    } finally {
      calculating.value = false
    }
  }

  function selectOption(opt: FreightOption): void {
    selected.value = opt
  }

  function reset(): void {
    options.value = []
    selected.value = null
    error.value = null
    calculatedCep.value = null
  }

  return { options, selected, calculating, error, calculatedCep, calculate, selectOption, reset }
})
