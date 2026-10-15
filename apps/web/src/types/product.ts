export type ProductCategory =
  | 'injetora'
  | 'bucha'
  | 'eixo'
  | 'conjunto'
  | 'mola'
  | 'cabecote'
  | 'peca'
  | 'servico'
  | 'outros'
  // legados (compatibilidade)
  | 'espeto'
  | 'churrasqueira'
  | 'grelha'
  | 'acessorio'
  | 'kit'

export interface ProductImage {
  url: string
  key?: string
}

export interface Product {
  id: number
  slug: string
  name: string
  category: ProductCategory
  description: string
  material: string
  price: number
  priceMin: number
  priceMax: number
  imageUrl: string | null
  images?: ProductImage[] | null
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
