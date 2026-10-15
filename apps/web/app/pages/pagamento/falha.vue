<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = computed(() => (route.query.external_reference as string) ?? null)
</script>

<template>
  <main class="container result-page">
    <div class="result-card result-card--failure">
      <div class="result-icon result-icon--failure">✕</div>
      <h1 class="result-title">Pagamento nao aprovado</h1>
      <p class="result-subtitle">
        Nao foi possivel processar seu pagamento. Nenhuma cobranca foi realizada.
      </p>
      <p v-if="orderId" class="order-id">Pedido #{{ orderId }}</p>

      <div class="actions">
        <RouterLink to="/carrinho" class="btn btn--primary">
          Tentar novamente
        </RouterLink>
        <RouterLink to="/" class="btn btn--ghost">
          Voltar para a loja
        </RouterLink>
      </div>
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

.result-card--failure {
  border-color: rgba(248, 113, 113, 0.3);
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
}

.result-icon--failure {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
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
  margin-bottom: 1rem;
}

.order-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
