<template>
  <main>
    <HeroSection />
    <ServicesSection />
    <AboutSection />
    <WhyUsSection />

    <!-- Preview do catálogo -->
    <section class="catalog-preview" id="catalogo">
      <TechBg />
      <div class="catalog-preview__inner">
        <SectionLabel label="Catálogo Online" />
        <h2 class="catalog-preview__title font-display">
          Peças Disponíveis
        </h2>
        <p class="catalog-preview__sub">
          Componentes industriais usinados com precisão. Compre online com frete para todo o Brasil.
        </p>

        <div v-if="productStore.loading" class="catalog-preview__loading">
          <span class="label-tech">Carregando...</span>
        </div>

        <div v-else-if="featuredProducts.length" class="catalog-preview__grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.slug"
            :product="product"
          />
        </div>

        <div class="catalog-preview__actions">
          <NuxtLink to="/catalogo" class="btn-gold">Ver Catálogo Completo</NuxtLink>
        </div>
      </div>
    </section>

    <ContactSection />
  </main>
</template>

<script setup>
import { useProductStore } from '@/stores/products'
import { computed, onMounted } from 'vue'

const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProducts()
})

const featuredProducts = computed(() => productStore.products.slice(0, 3))
</script>

<style scoped>
.catalog-preview {
  position: relative;
  padding: 100px 24px;
  background: var(--c-surface);
  overflow: hidden;
}

.catalog-preview__inner {
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.catalog-preview__title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  letter-spacing: 0.04em;
  color: var(--c-text);
  margin: 12px 0 16px;
  line-height: 1;
}

.catalog-preview__sub {
  color: var(--c-muted);
  max-width: 520px;
  margin-bottom: 56px;
  line-height: 1.6;
}

.catalog-preview__loading {
  padding: 40px 0;
  text-align: center;
}

.catalog-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

@media (max-width: 900px) {
  .catalog-preview__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .catalog-preview__grid {
    grid-template-columns: 1fr;
  }
}

.catalog-preview__actions {
  display: flex;
  justify-content: center;
}
</style>
