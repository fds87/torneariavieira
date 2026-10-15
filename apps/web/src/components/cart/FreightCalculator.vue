<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFreightStore } from '@/stores/freight'
import { formatPrice } from '@/utils/format'

const { items } = defineProps<{
  items: Array<{ productId: number; quantity: number }>
}>()

const freight = useFreightStore()
const cepInput = ref('')

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function onCepInput(e: Event) {
  cepInput.value = formatCep((e.target as HTMLInputElement).value)
}

async function onCalculate() {
  const digits = cepInput.value.replace(/\D/g, '')
  if (digits.length !== 8) {
    freight.error = 'CEP inválido — informe 8 dígitos'
    return
  }
  await freight.calculate(digits, items)
}

// Reset freight se os itens mudarem
watch(() => items.length, () => freight.reset())
</script>

<template>
  <section class="freight-calc">
    <h2 class="freight-title">Calcular Frete</h2>

    <div class="freight-input-row">
      <input
        :value="cepInput"
        class="freight-cep-input"
        type="text"
        placeholder="00000-000"
        inputmode="numeric"
        maxlength="9"
        @input="onCepInput"
        @keydown.enter="onCalculate"
      />
      <button
        class="btn btn--ghost freight-btn"
        :disabled="freight.calculating"
        @click="onCalculate"
      >
        <span v-if="freight.calculating" class="spinner sm"></span>
        <span v-else>Calcular</span>
      </button>
    </div>

    <p v-if="freight.error" class="freight-error">{{ freight.error }}</p>

    <div v-if="freight.options.length > 0" class="freight-options">
      <label
        v-for="opt in freight.options"
        :key="opt.service"
        class="freight-option"
        :class="{ 'freight-option--selected': freight.selected?.service === opt.service }"
      >
        <input
          type="radio"
          name="freight-option"
          :value="opt.service"
          :checked="freight.selected?.service === opt.service"
          class="freight-radio"
          @change="freight.selectOption(opt)"
        />
        <div class="freight-option-info">
          <span class="freight-service">{{ opt.service }}</span>
          <span class="freight-days">{{ opt.days }} dias úteis</span>
        </div>
        <span class="freight-price">{{ formatPrice(opt.price) }}</span>
      </label>
    </div>

    <p v-if="freight.calculatedCep && freight.options.length > 0" class="freight-cep-info">
      CEP consultado: {{ freight.calculatedCep.slice(0, 5) }}-{{ freight.calculatedCep.slice(5) }}
    </p>
  </section>
</template>

<style scoped>
.freight-calc {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.freight-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-stone-100);
  margin-bottom: 1.25rem;
  letter-spacing: 0.3px;
}

.freight-input-row {
  display: flex;
  gap: 0.75rem;
}

.freight-cep-input {
  flex: 1;
  background: var(--c-stone-950, #0a0807);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-100);
  font-size: 0.95rem;
  padding: 0.65rem 0.875rem;
  transition: border-color 0.15s;
  font-family: inherit;
}

.freight-cep-input:focus {
  outline: none;
  border-color: var(--accent);
}

.freight-btn {
  white-space: nowrap;
  min-width: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.freight-error {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: #ef4444;
}

.freight-options {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.freight-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--c-stone-950, #0a0807);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.freight-option:hover {
  border-color: rgba(202, 138, 4, 0.4);
}

.freight-option--selected {
  border-color: var(--accent);
  background: rgba(202, 138, 4, 0.06);
}

.freight-radio {
  accent-color: var(--accent);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.freight-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.freight-service {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-stone-100);
}

.freight-days {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.freight-price {
  font-weight: 700;
  color: var(--accent);
  font-size: 0.95rem;
}

.freight-cep-info {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner.sm { width: 12px; height: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
