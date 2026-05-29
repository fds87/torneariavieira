<script setup lang="ts">
import type { Product } from '@/types/product'
import { formatPrice } from '@/utils/format'

const { product } = defineProps<{ product: Product }>()

const categoryLabels: Record<string, string> = {
  injetora: 'Injetora',
  bucha: 'Bucha',
  eixo: 'Eixo',
  conjunto: 'Conjunto',
  outros: 'Outros',
  espeto: 'Espeto',
  churrasqueira: 'Churrasqueira',
  grelha: 'Grelha',
  acessorio: 'Acessório',
  kit: 'Kit',
}
</script>

<template>
  <NuxtLink :to="`/produto/${product.slug}`" class="product-card card-cut">
    <div class="card-image">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="card-img"
        loading="lazy"
      />
      <div v-else class="image-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="0"/>
          <circle cx="12" cy="10" r="3"/>
          <path d="M3 18 L8 13 L12 17 L16 12 L21 18"/>
        </svg>
      </div>
      <span v-if="!product.inStock" class="out-of-stock-badge label-tech">Consulte</span>
    </div>

    <div class="card-body">
      <span class="card-category label-tech">{{ categoryLabels[product.category] ?? product.category }}</span>
      <h3 class="card-title font-display">{{ product.name }}</h3>
      <p class="card-material">{{ product.material }}</p>

      <div class="card-price">
        <template v-if="product.inStock && product.price > 0">
          <span class="price">{{ formatPrice(product.price) }}</span>
        </template>
        <template v-else>
          <span class="price-consult">Sob consulta</span>
        </template>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all var(--duration) var(--ease);
  cursor: pointer;
}

.product-card:hover {
  border-color: var(--c-accent);
  box-shadow: var(--shadow-gold);
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--c-surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease);
}

.product-card:hover .card-img {
  transform: scale(1.04);
}

.image-placeholder {
  color: var(--c-muted);
}

.out-of-stock-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  padding: 0.25rem 0.6rem;
}

.card-body {
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-category {
  font-size: 0.65rem;
}

.card-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--c-text);
  line-height: 1.1;
  letter-spacing: 0.03em;
}

.card-material {
  font-size: 0.8rem;
  color: var(--c-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}

.card-price {
  margin-top: 0.5rem;
}

.price {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--c-accent);
  font-family: 'Inter', sans-serif;
}

.price-consult {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-muted);
}
</style>
