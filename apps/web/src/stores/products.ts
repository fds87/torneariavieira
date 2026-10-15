import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '@/types/product'
import { apiFetch } from '@/lib/api'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const espetos = computed(() =>
    products.value.filter((p) => p.category === 'espeto'),
  )
  const churrasqueiras = computed(() =>
    products.value.filter((p) => p.category === 'churrasqueira'),
  )

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch('/api/products')
      products.value = (await res.json()) as Product[]
    } catch {
      error.value = 'Erro ao carregar produtos'
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(slug: string): Promise<Product | null> {
    try {
      const res = await apiFetch(`/api/products/${slug}`)
      if (!res.ok) return null
      return (await res.json()) as Product
    } catch {
      return null
    }
  }

  return {
    products,
    loading,
    error,
    espetos,
    churrasqueiras,
    fetchProducts,
    fetchProduct,
  }
})
