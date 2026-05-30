<script setup lang="ts">
import type { Product } from '@/types/product'
import { formatPrice } from '@/utils/format'

const { product } = defineProps<{ product: Product }>()

const categoryLabels: Record<string, string> = {
  injetora: 'Injetora',
  bucha: 'Bucha',
  eixo: 'Eixo',
  conjunto: 'Conjunto',
  mola: 'Mola',
  cabecote: 'Cabeçote',
  peca: 'Peça',
  servico: 'Serviço',
  outros: 'Outros',
}
</script>

<template>
  <NuxtLink :to="`/produto/${product.slug}`" class="pcard">
    <div class="pcard__img">
      <svg class="pcard__dim" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
        <line x1="6" y1="14" x2="6" y2="86" stroke-width="0.4" /><line x1="3" y1="14" x2="9" y2="14" stroke-width="0.5" /><line x1="3" y1="86" x2="9" y2="86" stroke-width="0.5" />
        <line x1="14" y1="93" x2="86" y2="93" stroke-width="0.4" /><line x1="14" y1="90" x2="14" y2="96" stroke-width="0.5" /><line x1="86" y1="90" x2="86" y2="96" stroke-width="0.5" />
        <circle cx="85" cy="14" r="7" stroke-width="0.4" /><circle cx="85" cy="14" r="1.6" stroke-width="0.5" />
      </svg>
      <span class="pcard__tag">{{ categoryLabels[product.category] ?? product.category }}</span>
      <span v-if="!product.inStock" class="pcard__enc">Sob encomenda</span>
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" loading="lazy" />
      <div v-else class="pcard__ph">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>
      </div>
    </div>

    <div class="pcard__body">
      <div class="pcard__name font-display">{{ product.name }}</div>
      <div class="pcard__mat">{{ product.material }}</div>
      <div class="pcard__foot">
        <div class="pcard__price">
          <template v-if="product.inStock && product.price > 0">
            {{ formatPrice(product.price) }}<br /><small>por peça</small>
          </template>
          <template v-else>
            <span class="pcard__consult">Sob consulta</span><br /><small>orçamento sob desenho</small>
          </template>
        </div>
        <span class="pcard__btn" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13,6 19,12 13,18"/></svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.pcard {
  position: relative; display: flex; flex-direction: column;
  border: 1px solid var(--c-border); background: var(--c-bg2);
  overflow: hidden; text-decoration: none; color: inherit;
  transition: border-color 0.35s, transform 0.4s var(--ease-out);
}
.pcard:hover { border-color: var(--c-accent); transform: translateY(-6px); }
.pcard__img { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--c-surface); display: grid; place-items: center; }
.pcard__img img { width: 100%; height: 100%; object-fit: contain; padding: 30px; transition: transform 0.6s var(--ease-out); }
.pcard:hover .pcard__img img { transform: scale(1.08); }
.pcard__dim { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--c-accent); opacity: 0.22; pointer-events: none; z-index: 1; }
.pcard__ph { color: var(--c-faint); }
.pcard__tag { position: absolute; top: 14px; left: 14px; z-index: 2; font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-accent); border: 1px solid var(--c-border-2); background: color-mix(in srgb, var(--c-bg) 70%, transparent); padding: 4px 9px; }
.pcard__enc { position: absolute; top: 14px; right: 14px; z-index: 2; font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-muted); border: 1px solid var(--c-border); padding: 4px 8px; }
.pcard__body { padding: 22px 22px 24px; border-top: 1px solid var(--c-border); display: flex; flex-direction: column; gap: 8px; }
.pcard__name { font-size: 1.45rem; letter-spacing: 0.03em; line-height: 1; color: var(--c-text); }
.pcard__mat { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-muted); }
.pcard__foot { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 10px; }
.pcard__price { font-family: var(--font-display); font-size: 1.5rem; color: var(--c-text); letter-spacing: 0.02em; line-height: 1.1; }
.pcard__price small { font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.1em; color: var(--c-muted); text-transform: uppercase; }
.pcard__consult { color: var(--c-accent); font-size: 1.25rem; }
.pcard__btn { width: 40px; height: 40px; flex-shrink: 0; border: 1px solid var(--c-border-2); display: grid; place-items: center; color: var(--c-accent); transition: background 0.3s, color 0.3s, border-color 0.3s; }
.pcard:hover .pcard__btn { background: var(--c-accent); color: #fff; border-color: var(--c-accent); }
:global(:root.dark) .pcard:hover .pcard__btn { color: #0B0B0C; }
</style>
