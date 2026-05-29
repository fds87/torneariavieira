type GtagFn = (...args: unknown[]) => void

function gtag(): GtagFn | undefined {
  if (import.meta.server) return undefined
  return (window as Window & { gtag?: GtagFn }).gtag
}

// E-commerce: produto visualizado
export function trackViewItem(product: { id: string | number; name: string; price: number; category?: string }) {
  gtag()?.('event', 'view_item', {
    currency: 'BRL',
    value: product.price,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: 1,
    }],
  })
}

// E-commerce: produto adicionado ao carrinho
export function trackAddToCart(product: { id: string | number; name: string; price: number; quantity?: number }) {
  gtag()?.('event', 'add_to_cart', {
    currency: 'BRL',
    value: product.price * (product.quantity ?? 1),
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity ?? 1,
    }],
  })
}

// E-commerce: checkout iniciado
export function trackBeginCheckout(value: number, items: Array<{ id: string | number; name: string; price: number; quantity: number }>) {
  gtag()?.('event', 'begin_checkout', {
    currency: 'BRL',
    value,
    items: items.map(i => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}

// E-commerce: compra concluída
export function trackPurchase(order: {
  id: string | number
  total: number
  items: Array<{ id: string | number; name: string; price: number; quantity: number }>
}) {
  gtag()?.('event', 'purchase', {
    transaction_id: String(order.id),
    currency: 'BRL',
    value: order.total,
    items: order.items.map(i => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}

// Evento genérico
export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag()?.('event', name, params)
}
