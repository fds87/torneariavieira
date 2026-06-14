<template>
  <main>
    <HeroSection />

    <!-- Preview do catálogo -->
    <section id="catalogo" class="section">
      <div class="grid-layer" style="opacity:0.6"></div>
      <div class="shell">
        <div class="cat__head" v-reveal>
          <div>
            <span class="eyebrow"><b>//</b> 01 — Catálogo Online <span class="ln"></span></span>
            <h2 class="section__title">PEÇAS<br /><span class="gold">DISPONÍVEIS</span></h2>
          </div>
          <p>Componentes industriais usinados com precisão. Compre online com frete para todo o Brasil.</p>
        </div>

        <div v-if="productStore.loading" class="cat__loading mono">Carregando…</div>

        <div v-else-if="featuredProducts.length" class="cat__grid">
          <ProductCard v-for="p in featuredProducts" :key="p.slug" :product="p" v-reveal />
        </div>

        <div class="cat__actions">
          <NuxtLink to="/catalogo" class="btn btn--gold" data-magnetic>Ver Catálogo Completo <span class="arrow">→</span></NuxtLink>
        </div>
      </div>
    </section>

    <ServicesSection />
    <AboutSection />
    <WhyUsSection />
    <ContactSection />
  </main>
</template>

<script setup>
import { useProductStore } from '@/stores/products'
import { computed, onMounted } from 'vue'

const productStore = useProductStore()
onMounted(() => { productStore.fetchProducts() })
const featuredProducts = computed(() => productStore.products.slice(0, 3))
</script>

<style scoped>
.cat__head { display: flex; flex-direction: column; gap: 20px; margin-bottom: 56px; }
@media (min-width: 900px){ .cat__head { flex-direction: row; align-items: flex-end; justify-content: space-between; } }
.cat__head p { max-width: 460px; color: var(--c-muted); }
.cat__loading { text-align: center; padding: 40px 0; color: var(--c-muted); letter-spacing: 0.16em; text-transform: uppercase; font-size: 0.7rem; }
.cat__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-bottom: 48px; }
@media (max-width: 900px){ .cat__grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 560px){ .cat__grid { grid-template-columns: 1fr; } }
.cat__actions { display: flex; justify-content: center; }
@media (max-width: 760px){ .cat__head { margin-bottom: 40px; } }
</style>
