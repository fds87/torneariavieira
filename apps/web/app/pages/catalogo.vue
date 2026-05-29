<template>
  <div class="catalog-page">
    <div class="catalog-page__header">
      <TechBg />
      <div class="catalog-page__header-inner">
        <SectionLabel label="Produtos" />
        <h1 class="catalog-page__title font-display">Catálogo</h1>
        <p class="catalog-page__sub">
          Componentes usinados com precisão. Peças sob medida ou de linha.
        </p>
      </div>
    </div>

    <div class="catalog-page__body">
      <div class="catalog-page__filters">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="filter-btn label-tech"
          :class="{ 'filter-btn--active': activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>

      <div v-if="store.loading" class="catalog-page__loading">
        <span class="label-tech">Carregando produtos...</span>
      </div>

      <div v-else-if="!filteredProducts.length" class="catalog-page__empty">
        <span class="label-tech">Nenhum produto encontrado</span>
      </div>

      <div v-else class="catalog-page__grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.slug"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@/stores/products'
import { computed, onMounted, ref } from 'vue'

const store = useProductStore()
const activeCategory = ref('all')

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'injetora', label: 'Injetoras' },
  { value: 'bucha', label: 'Buchas' },
  { value: 'eixo', label: 'Eixos' },
  { value: 'conjunto', label: 'Conjuntos' },
  { value: 'outros', label: 'Outros' },
]

const filteredProducts = computed(() =>
  activeCategory.value === 'all'
    ? store.products
    : store.products.filter((p) => p.category === activeCategory.value),
)

onMounted(() => store.fetchProducts())

useHead({ title: 'Catálogo — Tornearia Vieira' })
</script>

<style scoped>
.catalog-page { min-height: 100vh; padding-top: 68px; }

.catalog-page__header {
  position: relative;
  padding: 80px 24px 60px;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
  overflow: hidden;
}

.catalog-page__header-inner {
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.catalog-page__title {
  font-size: clamp(3rem, 8vw, 7rem);
  letter-spacing: 0.04em;
  color: var(--c-text);
  margin: 12px 0 16px;
  line-height: 1;
}

.catalog-page__sub {
  color: var(--c-muted);
  max-width: 480px;
}

.catalog-page__body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px 100px;
}

.catalog-page__filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.filter-btn {
  padding: 8px 20px;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
}

.filter-btn:hover,
.filter-btn--active {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: rgba(184, 146, 30, 0.06);
}

.catalog-page__loading,
.catalog-page__empty {
  padding: 80px 0;
  text-align: center;
  color: var(--c-muted);
}

.catalog-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 900px) {
  .catalog-page__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .catalog-page__grid { grid-template-columns: 1fr; }
}
</style>
