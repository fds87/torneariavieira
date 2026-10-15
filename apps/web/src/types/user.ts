export interface User {
  id: number
  name: string
  email: string
  phone: string | null
}

export interface Address {
  id: number
  userId: number
  label: string
  cep: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
  createdAt: string
}

export type NewAddress = Omit<Address, 'id' | 'userId' | 'createdAt'>

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}
