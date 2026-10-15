<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = computed(() => (route.query.external_reference as string) ?? null)
</script>

<template>
  <main class="container result-page">
    <div class="result-card result-card--pending">
      <div class="result-icon result-icon--pending">⏳</div>
      <h1 class="result-title">Pagamento em analise</h1>
      <p class="result-subtitle">
        Seu pagamento esta sendo processado. Assim que for confirmado, entraremos em contato pelo WhatsApp.
      </p>
      <p v-if="orderId" class="order-id">Pedido #{{ orderId }}</p>
      <p class="result-note">
        Esse processo pode levar alguns minutos dependendo do metodo de pagamento escolhido.
      </p>
      <RouterLink to="/" class="btn btn--primary" style="margin-top:2rem">
        Voltar para a loja
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.result-page {
  padding: 6rem 1.5rem 4rem;
  display: flex;
  justify-content: center;
}

.result-card {
  max-width: 480px;
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
}

.result-card--pending {
  border-color: rgba(251, 191, 36, 0.3);
}

.result-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.result-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--c-stone-50);
  margin-bottom: 0.5rem;
}

.result-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.order-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.result-note {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: rgba(251,191,36,0.06);
  border: 1px solid rgba(251,191,36,0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}
</style>
