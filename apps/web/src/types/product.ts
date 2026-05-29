export interface Product {
  id: number
  slug: string
  name: string
  category: 'espeto' | 'churrasqueira' | 'grelha' | 'acessorio' | 'kit'
  description: string
  material: string
  price: number
  priceMin: number
  priceMax: number
  imageUrl: string | null
  inStock: boolean
  createdAt: string
  weightG: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface CartItem {
  productId: number
  slug: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}
