<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { useAddressStore } from '@/stores/address'
import { useAuthStore } from '@/stores/auth'
import { useFreightStore } from '@/stores/freight'
import { apiFetch } from '@/lib/api'
import { loadMercadoPagoSdk } from '@/composables/useMercadoPago'
import { formatPrice } from '@/utils/format'
import type { ProcessPaymentResponse } from '@/types/order'
import type { ShippingAddress } from '@/types/order'
import AddressForm from '@/components/account/AddressForm.vue'

const cart = useCartStore()
const checkout = useCheckoutStore()
const address = useAddressStore()
const auth = useAuthStore()
const freight = useFreightStore()
const router = useRouter()

if (cart.items.length === 0) {
  router.replace('/carrinho')
}

// Pré-popular dados do usuário logado
onMounted(async () => {
  if (auth.isLoggedIn && auth.user) {
    checkout.customer.name = auth.user.name
    checkout.customer.email = auth.user.email
    checkout.customer.phone = auth.user.phone ?? ''
    await initAddresses()
  }
})

// ---------------------------------------------------------------------------
// Estado local — lifecycle do componente (nao precisa ser global no store)
// ---------------------------------------------------------------------------
type Step = 'customer' | 'payment' | 'pix-pending'
const step = ref<Step>('customer')
const bricksController = ref<{ unmount: () => void } | null>(null)
const pixData = ref<ProcessPaymentResponse | null>(null)
const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
const submitting = ref(false)
const sdkLoading = ref(false)
const error = ref<string | null>(null)
const copied = ref(false)
const pixTimedOut = ref(false)

const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 600_000 // 10 minutos

// ---------------------------------------------------------------------------
// Seleção de endereço (usuário logado)
// ---------------------------------------------------------------------------
const selectedAddressId = ref<number | null>(null)
const showNewAddressForm = ref(false)
const newAddress = ref<ShippingAddress | null>(null)

const orderSubtotal = computed(() => cart.totalAmount)
const freightPrice = computed(() => freight.selected?.price ?? 0)
const orderTotal = computed(() => orderSubtotal.value + freightPrice.value)

async function initAddresses() {
  if (!auth.isLoggedIn || !auth.accessToken) return
  await address.fetchSavedAddresses(auth.accessToken)
  const def = address.savedAddresses.find((a) => a.isDefault) ?? address.savedAddresses[0]
  if (def) {
    selectedAddressId.value = def.id
    address.setCurrentAddress({
      cep: def.cep,
      street: def.street,
      number: def.number,
      complement: def.complement ?? '',
      neighborhood: def.neighborhood,
      city: def.city,
      state: def.state,
    })
  }
}

function selectSavedAddress(addr: typeof address.savedAddresses[0]) {
  selectedAddressId.value = addr.id
  showNewAddressForm.value = false
  address.setCurrentAddress({
    cep: addr.cep,
    street: addr.street,
    number: addr.number,
    complement: addr.complement ?? '',
    neighborhood: addr.neighborhood,
    city: addr.city,
    state: addr.state,
  })
}

function toggleNewAddressForm() {
  showNewAddressForm.value = !showNewAddressForm.value
  if (showNewAddressForm.value) {
    selectedAddressId.value = null
    newAddress.value = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
    address.setCurrentAddress(null)
  } else if (address.savedAddresses.length > 0) {
    const target = address.savedAddresses.find((a) => a.isDefault) ?? address.savedAddresses[0]
    if (target) selectSavedAddress(target)
  }
}

function onNewAddressChange(val: ShippingAddress) {
  newAddress.value = val
  address.setCurrentAddress(val)
}

// ---------------------------------------------------------------------------
// Passo 1 → 2: validar dados e ir para pagamento
// ---------------------------------------------------------------------------
async function goToPaymentStep() {
  error.value = null

  // Se não logado: valida campos manualmente
  if (!auth.isLoggedIn) {
    const c = checkout.customer
    if (!c.name.trim() || !c.email.trim() || !c.phone.trim()) {
      error.value = 'Preencha nome, e-mail e telefone.'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
      error.value = 'E-mail invalido.'
      return
    }
  }

  checkout.syncAddressToCustomer()

  sdkLoading.value = true
  try {
    const config = await checkout.fetchConfig()
    if (!config.mock) {
      await loadMercadoPagoSdk()
    }
    step.value = 'payment'
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar formulario de pagamento.'
  } finally {
    sdkLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Inicializa o PaymentBrick quando step muda para 'payment'
// ---------------------------------------------------------------------------
watch(step, async (newStep) => {
  if (newStep !== 'payment') return
  await nextTick()

  if (checkout.isMockMode) return // mock mode usa UI propria

  const publicKey = checkout.mpPublicKey ?? ''
  if (!publicKey) {
    error.value = 'Chave publica do Mercado Pago nao disponivel.'
    return
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' }) as {
      bricks: () => {
        create: (type: string, containerId: string, config: unknown) => Promise<{ unmount: () => void }>
      }
    }

    bricksController.value = await mp.bricks().create('payment', 'payment-brick-container', {
      initialization: {
        amount: cart.totalAmount,
      },
      customization: {
        paymentMethods: {
          creditCard: 'all',
          debitCard: 'all',
          bankTransfer: 'all',
          maxInstallments: 12,
        },
        visual: {
          style: {
            theme: 'dark',
            customVariables: {
              baseColor: '#d97706',
              textPrimaryColor: '#f5f5f4',
              inputBackgroundColor: '#1c1917',
              borderRadiusMedium: '8px',
              borderRadiusLarge: '12px',
            },
          },
        },
      },
      callbacks: {
        onReady: () => {
          submitting.value = false
        },
        onError: (err: unknown) => {
          console.error('[PaymentBrick] erro:', err)
          error.value = 'Erro no formulario de pagamento. Recarregue a pagina.'
        },
        onSubmit: async ({ formData }: { formData: Record<string, unknown> }) => {
          return processPayment(formData)
        },
      },
    })
  } catch (err: unknown) {
    console.error('[PaymentBrick] falha ao inicializar:', err)
    error.value = 'Nao foi possivel carregar o formulario de pagamento.'
  }
})

// ---------------------------------------------------------------------------
// Processar pagamento — chamado pelo Brick (real) ou pelos botoes mock
// ---------------------------------------------------------------------------
async function processPayment(formData: Record<string, unknown>): Promise<void> {
  error.value = null
  submitting.value = true

  const addr = address.currentAddress

  try {
    const res = await apiFetch('/api/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: checkout.customer,
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping: addr
          ? {
              cep: addr.cep,
              street: addr.street,
              number: addr.number,
              complement: addr.complement,
              neighborhood: addr.neighborhood,
            }
          : {},
        userId: auth.user?.id,
        addressId: (addr as Record<string, unknown>)?.id as number | undefined,
        formData,
      }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      const msg = data.error || 'Erro ao processar pagamento.'
      error.value = msg
      submitting.value = false
      // Rejeita a promise para o Brick mostrar o erro inline
      throw new Error(msg)
    }

    const data = (await res.json()) as ProcessPaymentResponse

    cart.clearCart()
    checkout.reset()

    if (data.status === 'approved') {
      router.push(`/pagamento/sucesso?external_reference=${data.orderId}`)
    } else if (data.pixQrCode || (data.mock && (formData.payment_method_id === 'pix'))) {
      pixData.value = data
      step.value = 'pix-pending'
      startPixPolling(data.orderId)
    } else {
      router.push(`/pagamento/falha?external_reference=${data.orderId}`)
    }
  } finally {
    submitting.value = false
  }
}

// ---------------------------------------------------------------------------
// Simulacoes para mock mode (dev sem credenciais MP)
// ---------------------------------------------------------------------------
async function submitMock(type: 'pix' | 'cc_approved' | 'cc_rejected') {
  const formData: Record<string, unknown> = { payment_method_id: type === 'pix' ? 'pix' : 'visa' }
  if (type === 'cc_rejected') formData.__mock_rejected = true
  await processPayment(formData).catch(() => {})
}

// ---------------------------------------------------------------------------
// Polling PIX
// ---------------------------------------------------------------------------
function startPixPolling(orderId: number) {
  const startTime = Date.now()

  pollingInterval.value = setInterval(async () => {
    if (Date.now() - startTime > POLL_TIMEOUT_MS) {
      clearPolling()
      pixTimedOut.value = true
      return
    }

    try {
      const res = await apiFetch(`/api/payments/status/${orderId}`)
      if (!res.ok) return
      const data = (await res.json()) as { status: string; mpPaymentStatus: string | null }

      if (data.status === 'paid' || data.mpPaymentStatus === 'approved') {
        clearPolling()
        router.push(`/pagamento/sucesso?external_reference=${orderId}`)
      } else if (data.status === 'cancelled' || data.mpPaymentStatus === 'rejected' || data.mpPaymentStatus === 'cancelled') {
        clearPolling()
        router.push(`/pagamento/falha?external_reference=${orderId}`)
      }
    } catch {
      // hiccup de rede — continua polling
    }
  }, POLL_INTERVAL_MS)
}

function clearPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// ---------------------------------------------------------------------------
// Copiar codigo PIX
// ---------------------------------------------------------------------------
async function copyPixCode() {
  if (!pixData.value?.pixCopyPaste) return
  try {
    await navigator.clipboard.writeText(pixData.value.pixCopyPaste)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    // clipboard nao disponivel
  }
}

// ---------------------------------------------------------------------------
// Voltar para step de dados do cliente
// ---------------------------------------------------------------------------
function goBack() {
  bricksController.value?.unmount()
  bricksController.value = null
  clearPolling()
  step.value = 'customer'
  error.value = null
}

// ---------------------------------------------------------------------------
// Cleanup ao desmontar
// ---------------------------------------------------------------------------
onUnmounted(() => {
  bricksController.value?.unmount()
  clearPolling()
})
</script>

<template>
  <main class="container checkout-page">
    <h1 class="page-title">Checkout</h1>

    <!-- Indicador de etapas -->
    <div class="steps-indicator" aria-label="Etapas do checkout">
      <div class="step-item" :class="{ active: step === 'customer', done: step !== 'customer' }">
        <span class="step-number">{{ step !== 'customer' ? '✓' : '1' }}</span>
        <span class="step-label">Seus dados</span>
      </div>
      <div class="step-divider"></div>
      <div class="step-item" :class="{ active: step === 'payment' || step === 'pix-pending' }">
        <span class="step-number">2</span>
        <span class="step-label">Pagamento</span>
      </div>
    </div>

    <div class="checkout-layout">
      <!-- ======================= PASSO 1: Dados do cliente ======================= -->
      <div v-if="step === 'customer'" class="checkout-form">

        <!-- Usuário logado: tela de confirmação -->
        <template v-if="auth.isLoggedIn">
          <h2 class="form-section-title">Confirmar dados</h2>

          <div class="confirm-block">
            <div class="confirm-row">
              <span class="confirm-label">Nome</span>
              <span class="confirm-value">{{ auth.user?.name }}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">E-mail</span>
              <span class="confirm-value">{{ auth.user?.email }}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Telefone</span>
              <span class="confirm-value">{{ auth.user?.phone || '—' }}</span>
            </div>
          </div>

          <RouterLink to="/conta/dados" class="confirm-edit-link">Editar dados da conta →</RouterLink>

          <!-- Endereço de entrega -->
          <h2 class="form-section-title" style="margin-top: 1.5rem">Endereço de entrega</h2>

          <!-- Endereços salvos -->
          <div v-if="address.savedAddresses.length > 0" class="address-list">
            <label
              v-for="addr in address.savedAddresses"
              :key="addr.id"
              class="address-option"
              :class="{ 'address-option--selected': selectedAddressId === addr.id && !showNewAddressForm }"
            >
              <input
                type="radio"
                name="shipping-address"
                :value="addr.id"
                :checked="selectedAddressId === addr.id && !showNewAddressForm"
                class="address-radio"
                @change="selectSavedAddress(addr)"
              />
              <div class="address-option-body">
                <span class="address-option-label">{{ addr.label }}<span v-if="addr.isDefault" class="address-default-badge">padrão</span></span>
                <span class="address-option-text">{{ addr.street }}, {{ addr.number }}<span v-if="addr.complement">, {{ addr.complement }}</span></span>
                <span class="address-option-text">{{ addr.neighborhood }} — {{ addr.city }}/{{ addr.state }} · CEP {{ addr.cep }}</span>
              </div>
            </label>
          </div>

          <!-- Adicionar novo endereço -->
          <button type="button" class="btn-add-address" @click="toggleNewAddressForm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path v-if="showNewAddressForm" d="M19 12H5"/>
              <path v-else d="M12 5v14M5 12h14"/>
            </svg>
            {{ showNewAddressForm ? 'Cancelar novo endereço' : (address.savedAddresses.length === 0 ? 'Adicionar endereço de entrega' : 'Usar outro endereço') }}
          </button>

          <div v-if="showNewAddressForm" class="new-address-wrapper">
            <AddressForm :model-value="newAddress" @update:model-value="onNewAddressChange" />
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <button
            type="button"
            class="btn btn--primary full-width"
            :disabled="sdkLoading || (!address.currentAddress)"
            @click="goToPaymentStep"
          >
            <span v-if="sdkLoading" class="btn-loading">
              <span class="spinner"></span> Carregando...
            </span>
            <span v-else>Confirmar e ir para Pagamento &rarr;</span>
          </button>
        </template>

        <!-- Usuário não logado: formulário normal -->
        <template v-else>

          <!-- Banner de login -->
          <div class="login-callout">
            <div class="login-callout__text">
              <strong>Já tem conta?</strong>
              <span>Faça login para usar seus endereços salvos e acompanhar o pedido.</span>
            </div>
            <RouterLink
              :to="`/conta/entrar?redirect=/checkout`"
              class="btn btn--outline login-callout__btn"
            >
              Entrar
            </RouterLink>
          </div>

          <div class="login-callout__divider">
            <span>ou continue como visitante</span>
          </div>

          <h2 class="form-section-title">Seus dados</h2>

          <div class="form-group">
            <label for="name">Nome completo *</label>
            <input id="name" v-model="checkout.customer.name" type="text" required autocomplete="name" />
          </div>

          <div class="form-group">
            <label for="email">E-mail *</label>
            <input id="email" v-model="checkout.customer.email" type="email" required autocomplete="email" />
          </div>

          <div class="form-group">
            <label for="phone">Telefone / WhatsApp *</label>
            <input
              id="phone"
              v-model="checkout.customer.phone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
              autocomplete="tel"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">Cidade</label>
              <input id="city" v-model="checkout.customer.city" type="text" autocomplete="address-level2" />
            </div>
            <div class="form-group">
              <label for="state">Estado</label>
              <input
                id="state"
                v-model="checkout.customer.state"
                type="text"
                maxlength="2"
                placeholder="SP"
                autocomplete="address-level1"
              />
            </div>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <button
            type="button"
            class="btn btn--primary full-width"
            :disabled="sdkLoading"
            @click="goToPaymentStep"
          >
            <span v-if="sdkLoading" class="btn-loading">
              <span class="spinner"></span> Carregando...
            </span>
            <span v-else>Continuar para Pagamento &rarr;</span>
          </button>
        </template>
      </div>

      <!-- ======================= PASSO 2: Pagamento ======================= -->
      <div v-else-if="step === 'payment'" class="checkout-form payment-step">
        <div class="step-header">
          <button class="btn-back" @click="goBack" aria-label="Voltar para dados">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Voltar
          </button>
          <h2 class="form-section-title">Forma de pagamento</h2>
        </div>

        <!-- Mock mode: botoes de simulacao -->
        <div v-if="checkout.isMockMode" class="mock-payment">
          <div class="mock-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Modo desenvolvimento — pagamento simulado
          </div>
          <p class="mock-desc">Nenhuma credencial MP configurada. Simule o resultado:</p>
          <div class="mock-buttons">
            <button
              class="btn btn--ghost"
              :disabled="submitting"
              @click="submitMock('pix')"
            >
              <span v-if="submitting" class="spinner sm"></span>
              Simular PIX
            </button>
            <button
              class="btn btn--primary"
              :disabled="submitting"
              @click="submitMock('cc_approved')"
            >
              <span v-if="submitting" class="spinner sm"></span>
              Simular Cartao Aprovado
            </button>
            <button
              class="btn btn--ghost danger"
              :disabled="submitting"
              @click="submitMock('cc_rejected')"
            >
              Simular Cartao Recusado
            </button>
          </div>
        </div>

        <!-- Bricks real -->
        <div v-else>
          <div id="payment-brick-container"></div>
          <div v-if="!bricksController" class="brick-loading">
            <span class="spinner"></span> Carregando formulario de pagamento...
          </div>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>
      </div>

      <!-- ======================= PASSO 3: PIX pendente ======================= -->
      <div v-else-if="step === 'pix-pending'" class="checkout-form pix-section">
        <div v-if="!pixTimedOut">
          <div class="pix-header">
            <div class="pix-logo">PIX</div>
            <div>
              <h2 class="form-section-title" style="margin-bottom: 0.25rem">Aguardando pagamento</h2>
              <p class="pix-subtitle">Pedido #{{ pixData?.orderId }}</p>
            </div>
          </div>

          <p class="pix-instruction">
            Abra o app do seu banco, escaneie o QR Code ou copie o codigo abaixo.
          </p>

          <!-- QR Code -->
          <div class="pix-qr-wrapper">
            <img
              v-if="pixData?.pixQrCode"
              :src="`data:image/png;base64,${pixData.pixQrCode}`"
              alt="QR Code PIX"
              class="pix-qr"
            />
            <div v-else class="pix-qr-placeholder">
              <span>QR Code</span>
            </div>
          </div>

          <!-- Copia e cola -->
          <div v-if="pixData?.pixCopyPaste" class="pix-copy-wrapper">
            <p class="pix-copy-label">Copia e cola</p>
            <div class="pix-copy-row">
              <code class="pix-code">{{ pixData.pixCopyPaste.slice(0, 48) }}...</code>
              <button class="btn btn--ghost btn--sm copy-btn" @click="copyPixCode">
                {{ copied ? '✓ Copiado' : 'Copiar' }}
              </button>
            </div>
          </div>

          <div class="pix-status-row">
            <span class="spinner"></span>
            <span class="pix-status-text">Verificando pagamento automaticamente...</span>
          </div>

          <p v-if="pixData?.pixExpiresAt" class="pix-expires">
            Codigo expira em
            {{ new Date(pixData.pixExpiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>

        <!-- Timeout -->
        <div v-else class="pix-timeout">
          <p class="form-error">O tempo para pagamento via PIX expirou.</p>
          <button class="btn btn--primary" @click="router.push('/carrinho')">
            Voltar ao carrinho
          </button>
        </div>
      </div>

      <!-- ======================= RESUMO DO PEDIDO (sidebar) ======================= -->
      <aside class="order-summary">
        <h2 class="form-section-title">Resumo do pedido</h2>
        <div v-for="item in cart.items" :key="item.productId" class="summary-item">
          <div class="summary-item-left">
            <div class="summary-item-thumb">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="summary-item-thumb-img" />
              <div v-else class="summary-item-thumb-placeholder" />
            </div>
            <div>
              <span class="summary-item-name">{{ item.name }}</span>
              <span class="summary-item-qty"> x{{ item.quantity }}</span>
            </div>
          </div>
          <span class="summary-item-price">{{ formatPrice(item.price * item.quantity) }}</span>
        </div>

        <div class="summary-subtotal">
          <span>Subtotal</span>
          <span>{{ formatPrice(orderSubtotal) }}</span>
        </div>
        <div class="summary-freight" :class="{ 'summary-freight--empty': !freight.selected }">
          <span>Frete{{ freight.selected ? ` (${freight.selected.service})` : '' }}</span>
          <span>{{ freight.selected ? formatPrice(freightPrice) : '—' }}</span>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span class="total-value">{{ formatPrice(orderTotal) }}</span>
        </div>

        <div class="mp-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#00b1ea"/>
          </svg>
          <span>Pagamento seguro via Mercado Pago</span>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  padding: 6rem 1.5rem 4rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--c-stone-50);
  margin-bottom: 1.5rem;
}

/* Indicador de etapas */
.steps-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.45;
  transition: opacity var(--duration) var(--ease);
}

.step-item.active,
.step-item.done {
  opacity: 1;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: background var(--duration) var(--ease), color var(--duration) var(--ease);
}

.step-item.active .step-number {
  background: var(--accent);
  color: #fff;
}

.step-item.done .step-number {
  background: #22c55e;
  color: #fff;
}

.step-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.step-item.active .step-label {
  color: var(--c-stone-100);
  font-weight: 500;
}

.step-divider {
  flex: 1;
  max-width: 60px;
  height: 1px;
  background: var(--border);
}

/* Layout */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
  align-items: start;
}

.form-section-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--c-stone-100);
  margin-bottom: 1.25rem;
}

.login-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(202, 138, 4, 0.07);
  border: 1px solid rgba(202, 138, 4, 0.25);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
}

.login-callout__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
  color: var(--c-stone-200);
}

.login-callout__text strong {
  color: var(--accent);
  font-size: 0.95rem;
}

.login-callout__btn {
  flex-shrink: 0;
  font-size: 0.85rem;
  padding: 0.5rem 1.25rem;
}

.login-callout__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 1.25rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.login-callout__divider::before,
.login-callout__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.checkout-form {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.checkout-form.payment-step {
  background: #0c0a09;
  border-color: rgba(202, 138, 4, 0.25);
  box-shadow: 0 0 0 1px rgba(202, 138, 4, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Passo 1 */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  background: var(--c-stone-900);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-100);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color var(--duration) var(--ease);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.form-error {
  color: #f87171;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.full-width { width: 100%; }

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.spinner.sm { width: 12px; height: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }

/* Passo 2 — header com botao voltar */
.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-header .form-section-title {
  margin-bottom: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color var(--duration) var(--ease);
  flex-shrink: 0;
}

.btn-back:hover { color: var(--c-stone-100); }

/* Mock mode */
.mock-payment {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mock-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(217,119,6,0.1);
  border: 1px solid rgba(217,119,6,0.3);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.85rem;
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 500;
}

.mock-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.mock-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn--ghost.danger {
  color: #f87171;
  border-color: rgba(248,113,113,0.3);
}

.btn--ghost.danger:hover {
  background: rgba(248,113,113,0.08);
}

/* Brick loading */
.brick-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  justify-content: center;
  min-height: 200px;
}

/* Passo 3 — PIX */
.pix-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pix-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pix-logo {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #32BCAD, #22a99a);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  color: white;
  letter-spacing: -0.5px;
  flex-shrink: 0;
}

.pix-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.pix-instruction {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.pix-qr-wrapper {
  display: flex;
  justify-content: center;
}

.pix-qr {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-md);
  background: #fff;
  padding: 8px;
  box-sizing: border-box;
}

.pix-qr-placeholder {
  width: 200px;
  height: 200px;
  background: var(--c-stone-800);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.pix-copy-wrapper {
  background: var(--c-stone-900);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.pix-copy-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
}

.pix-copy-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pix-code {
  flex: 1;
  font-size: 0.75rem;
  color: var(--c-stone-300);
  word-break: break-all;
  font-family: monospace;
  min-width: 0;
}

.copy-btn {
  flex-shrink: 0;
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
}

.pix-status-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.pix-status-text {
  font-size: 0.85rem;
}

.pix-expires {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
}

.pix-timeout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

/* Sidebar resumo */
.order-summary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  position: sticky;
  top: 96px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.summary-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-item-thumb {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-stone-900);
}

.summary-item-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-item-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--c-stone-800);
}

.summary-item-name {
  color: var(--c-stone-100);
  font-weight: 500;
  font-size: 0.9rem;
}

.summary-item-qty {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.summary-item-price {
  color: var(--text);
  font-size: 0.9rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  color: var(--c-stone-100);
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
}

.total-value { color: var(--accent); }

.mp-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.75rem;
  background: rgba(0, 177, 234, 0.06);
  border: 1px solid rgba(0, 177, 234, 0.2);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Bloco de confirmação (usuário logado) */
.confirm-block {
  background: var(--c-stone-900);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-label {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-muted);
  flex-shrink: 0;
}

.confirm-value {
  font-size: 0.9rem;
  color: var(--c-stone-100);
  text-align: right;
}

.confirm-days {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-left: 0.3rem;
}

.confirm-edit-link {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--accent);
  text-decoration: none;
  margin-bottom: 1.25rem;
  transition: opacity 0.15s;
}

.confirm-edit-link:hover {
  opacity: 0.8;
}

/* Seleção de endereço */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.address-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: var(--c-stone-900);
}

.address-option:hover {
  border-color: rgba(217,119,6,0.4);
}

.address-option--selected {
  border-color: var(--accent);
  background: rgba(217,119,6,0.06);
}

.address-radio {
  margin-top: 2px;
  accent-color: var(--accent);
  flex-shrink: 0;
}

.address-option-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.address-option-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-stone-100);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.address-default-badge {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--accent);
  background: rgba(217,119,6,0.15);
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.address-option-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-add-address {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--accent);
  background: none;
  border: 1px dashed rgba(217,119,6,0.4);
  border-radius: var(--radius-md);
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  width: 100%;
  margin-bottom: 0.75rem;
  transition: border-color 0.15s, background 0.15s;
}

.btn-add-address:hover {
  border-color: var(--accent);
  background: rgba(217,119,6,0.05);
}

.new-address-wrapper {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 1rem;
  background: var(--c-stone-900);
}

/* Sidebar frete */
.summary-subtotal,
.summary-freight {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  color: var(--text-muted);
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--border);
}

.summary-freight--empty span:last-child {
  color: var(--c-stone-600);
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .step-divider { max-width: 32px; }
}
</style>
