export interface ShippingAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  city: string
  state: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  userId: number | null
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCity: string | null
  customerState: string | null
  shippingCep: string | null
  shippingStreet: string | null
  shippingNumber: string | null
  shippingComplement: string | null
  shippingNeighborhood: string | null
  status: string
  totalAmount: number
  notes: string | null
  mpPreferenceId: string | null
  mpPaymentId: string | null
  mpPaymentStatus: string | null
  createdAt: string
  items?: OrderItem[]
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface ProcessPaymentResponse {
  orderId: number
  paymentId: string
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled'
  statusDetail: string
  pixQrCode?: string
  pixCopyPaste?: string
  pixExpiresAt?: string
  mock?: boolean
}

export interface PaymentConfig {
  publicKey: string
  mock: boolean
}
