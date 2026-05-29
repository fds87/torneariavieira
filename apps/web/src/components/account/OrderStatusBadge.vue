<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const config: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Aguardando pagamento', color: '#f59e0b' },
  paid: { label: 'Pago', color: '#22c55e' },
  processing: { label: 'Em processamento', color: '#3b82f6' },
  shipped: { label: 'Enviado', color: '#8b5cf6' },
  delivered: { label: 'Entregue', color: '#10b981' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
}

const info = computed(() => config[props.status] ?? { label: props.status, color: '#6b7280' })
</script>

<template>
  <span class="badge" :style="{ '--badge-color': info.color }">{{ info.label }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--badge-color) 15%, transparent);
  color: var(--badge-color);
  border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
  white-space: nowrap;
}
</style>
