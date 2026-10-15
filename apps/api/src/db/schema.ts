import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Uma imagem da galeria do produto. `key` aponta para o objeto no R2 (permite remoção).
export type ProductImage = { url: string; key?: string }

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default('Casa'),
  cep: text('cep').notNull(),
  street: text('street').notNull(),
  number: text('number').notNull(),
  complement: text('complement'),
  neighborhood: text('neighborhood').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  material: text('material').notNull(),
  price: real('price').notNull(),
  priceMin: real('price_min').notNull(),
  priceMax: real('price_max').notNull(),
  imageUrl: text('image_url'),
  // Galeria de imagens (JSON). Cada item: { url, key? }. `key` presente quando hospedada no R2.
  images: text('images', { mode: 'json' }).$type<ProductImage[]>(),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  weightG: integer('weight_g').default(500),
  lengthCm: real('length_cm').default(30),
  widthCm: real('width_cm').default(20),
  heightCm: real('height_cm').default(10),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerCity: text('customer_city'),
  customerState: text('customer_state'),
  shippingCep: text('shipping_cep'),
  shippingStreet: text('shipping_street'),
  shippingNumber: text('shipping_number'),
  shippingComplement: text('shipping_complement'),
  shippingNeighborhood: text('shipping_neighborhood'),
  shippingAddressId: integer('shipping_address_id').references(() => addresses.id),
  status: text('status').notNull().default('pending_payment'),
  totalAmount: real('total_amount').notNull(),
  notes: text('notes'),
  mpPreferenceId: text('mp_preference_id'),
  mpPaymentId: text('mp_payment_id'),
  mpPaymentStatus: text('mp_payment_status'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
})

export const mlConfig = sqliteTable('ml_config', {
  id: integer('id').primaryKey().default(1),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at').notNull(),
  mlUserId: text('ml_user_id').notNull(),
})

export const mlListings = sqliteTable('ml_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  mlItemId: text('ml_item_id').notNull().unique(),
  mlStatus: text('ml_status').notNull().default('active'),
  mlUrl: text('ml_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export type MlConfig = typeof mlConfig.$inferSelect
export type MlListing = typeof mlListings.$inferSelect

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Inferred types for use across the codebase
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
export type RefreshToken = typeof refreshTokens.$inferSelect

// Valid order statuses as a const tuple for reuse in routes
export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
