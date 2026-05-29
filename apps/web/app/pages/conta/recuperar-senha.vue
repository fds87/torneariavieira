<script setup lang="ts">
import { ref } from 'vue'
import { apiFetch } from '@/lib/api'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  error.value = null
  loading.value = true
  try {
    const res = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      error.value = data.error ?? 'Erro ao enviar e-mail.'
      return
    }
    sent.value = true
  } catch {
    error.value = 'Falha de conexão. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="container auth-page">
    <div class="auth-card">
      <template v-if="!sent">
        <h1 class="auth-title">Recuperar senha</h1>
        <p class="auth-sub">
          Informe o e-mail da sua conta. Se ele estiver cadastrado,
          você receberá um link para redefinir a senha.
        </p>

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

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button type="submit" class="btn btn--primary full-width" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="success-icon" aria-hidden="true">✉</div>
        <h1 class="auth-title">E-mail enviado</h1>
        <p class="auth-sub">
          Se o endereço <strong>{{ email }}</strong> estiver cadastrado,
          você receberá um link em instantes. Verifique também a caixa de spam.
        </p>
      </template>

      <p class="auth-footer">
        <RouterLink to="/conta/entrar" class="auth-link">← Voltar ao login</RouterLink>
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
  line-height: 1.6;
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

.success-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
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
</style>
