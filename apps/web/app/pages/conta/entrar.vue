<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

async function onSubmit() {
  const ok = await auth.login({ email: email.value, password: password.value })
  if (ok) {
    const raw = route.query.redirect as string
    const redirect = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/conta'
    router.push(redirect)
  }
}
</script>

<template>
  <main class="container auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Entrar</h1>
      <p class="auth-sub">Acesse sua conta Brasa Premium</p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <div class="field">
          <label class="field__label">E-mail</label>
          <input
            v-model="email"
            class="field__input"
            type="email"
            placeholder="seu@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="field">
          <div class="field-header">
            <label class="field__label">Senha</label>
            <RouterLink to="/conta/recuperar-senha" class="forgot-link">Esqueceu a senha?</RouterLink>
          </div>
          <input
            v-model="password"
            class="field__input"
            type="password"
            placeholder="Sua senha"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="auth.error" class="auth-error">{{ auth.error }}</p>

        <button type="submit" class="btn btn--primary full-width" :disabled="auth.loading">
          {{ auth.loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="auth-footer">
        Não tem conta?
        <RouterLink to="/conta/cadastro" class="auth-link">Criar conta</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  padding: 7rem 1.5rem 4rem;
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
}

.auth-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--c-stone-50);
  margin-bottom: 0.25rem;
}

.auth-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.auth-error {
  font-size: 0.85rem;
  color: #ef4444;
  margin: 0;
}

.full-width {
  width: 100%;
  margin-top: 0.5rem;
}

.auth-footer {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
}

.auth-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.field-header .field__label {
  margin-bottom: 0;
}

.forgot-link {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.forgot-link:hover {
  color: var(--accent);
}
</style>
