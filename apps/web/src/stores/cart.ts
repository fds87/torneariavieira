import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CartItem, Product } from '@/types/product'

const STORAGE_KEY = 'forja-brasa-cart'

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCart())

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0),
  )

  const totalAmount = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  watch(items, (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), {
    deep: true,
  })

  function addItem(product: Product, quantity = 1) {
    const existing = items.value.find((i) => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      })
    }
  }

  function removeItem(productId: number) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
})
