<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ShippingAddress } from '@/types/order'
import { useAddressStore } from '@/stores/address'

const props = defineProps<{ modelValue: ShippingAddress | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: ShippingAddress] }>()

const address = useAddressStore()

const form = ref<ShippingAddress>({
  cep: props.modelValue?.cep ?? '',
  street: props.modelValue?.street ?? '',
  number: props.modelValue?.number ?? '',
  complement: props.modelValue?.complement ?? '',
  neighborhood: props.modelValue?.neighborhood ?? '',
  city: props.modelValue?.city ?? '',
  state: props.modelValue?.state ?? '',
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) form.value = { ...form.value, ...val }
  },
)

function update(field: keyof ShippingAddress, value: string) {
  form.value = { ...form.value, [field]: value }
  emit('update:modelValue', { ...form.value })
}

function onCepInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const masked = address.formatCep(raw)
  ;(e.target as HTMLInputElement).value = masked
  update('cep', masked)
}

async function onCepBlur() {
  const cep = form.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  const result = await address.lookupCep(cep)
  if (result) {
    form.value = { ...form.value, ...result }
    emit('update:modelValue', { ...form.value })
  }
}
</script>

<template>
  <div class="address-form">
    <div class="form-row">
      <div class="field field--cep">
        <label class="field__label">CEP *</label>
        <input
          class="field__input"
          :class="{ 'field__input--error': address.cepError }"
          type="text"
          :value="form.cep"
          placeholder="00000-000"
          maxlength="9"
          inputmode="numeric"
          @input="onCepInput"
          @blur="onCepBlur"
        />
        <span v-if="address.loadingCep" class="field__hint">Buscando...</span>
        <span v-else-if="address.cepError" class="field__error">{{ address.cepError }}</span>
      </div>
    </div>

    <div class="form-row form-row--2">
      <div class="field field--street">
        <label class="field__label">Logradouro *</label>
        <input
          class="field__input"
          type="text"
          :value="form.street"
          placeholder="Rua, Av., Travessa..."
          @input="update('street', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="field field--number">
        <label class="field__label">Número *</label>
        <input
          class="field__input"
          type="text"
          :value="form.number"
          placeholder="123"
          @input="update('number', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="field">
        <label class="field__label">Complemento</label>
        <input
          class="field__input"
          type="text"
          :value="form.complement"
          placeholder="Apto, bloco, andar..."
          @input="update('complement', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="form-row form-row--3">
      <div class="field field--neighborhood">
        <label class="field__label">Bairro *</label>
        <input
          class="field__input"
          type="text"
          :value="form.neighborhood"
          placeholder="Bairro"
          @input="update('neighborhood', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="field field--city">
        <label class="field__label">Cidade *</label>
        <input
          class="field__input"
          type="text"
          :value="form.city"
          placeholder="Cidade"
          @input="update('city', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="field field--state">
        <label class="field__label">UF *</label>
        <input
          class="field__input"
          type="text"
          :value="form.state"
          placeholder="SP"
          maxlength="2"
          style="text-transform: uppercase"
          @input="update('state', ($event.target as HTMLInputElement).value.toUpperCase())"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: grid;
  gap: 0.75rem;
}

.form-row--2 {
  grid-template-columns: 1fr 120px;
}

.form-row--3 {
  grid-template-columns: 1fr 1fr 72px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--c-stone-400);
}

.field__input {
  background: var(--c-stone-950, #0a0807);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-100);
  font-size: 0.9rem;
  padding: 0.65rem 0.875rem;
  transition: border-color 0.15s;
  width: 100%;
}

.field__input:focus {
  outline: none;
  border-color: var(--accent);
}

.field__input--error {
  border-color: #ef4444;
}

.field__error {
  font-size: 0.75rem;
  color: #ef4444;
}

.field__hint {
  font-size: 0.75rem;
  color: var(--c-stone-500);
}

@media (max-width: 480px) {
  .form-row--2 {
    grid-template-columns: 1fr 100px;
  }
  .form-row--3 {
    grid-template-columns: 1fr 1fr 60px;
  }
}
</style>
