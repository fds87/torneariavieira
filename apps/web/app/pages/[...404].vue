<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">
    <div class="not-found__inner">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">Página não encontrada</h1>
      <p class="not-found__desc">
        A página que você procura não existe ou foi movida.
      </p>
      <RouterLink to="/" class="btn btn--primary">Voltar à loja</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.5rem;
  text-align: center;
}

.not-found__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.not-found__code {
  font-family: var(--font-display);
  font-size: 6rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  opacity: 0.5;
}

.not-found__title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--c-stone-100);
}

.not-found__desc {
  color: var(--text-muted);
  max-width: 360px;
}
</style>
