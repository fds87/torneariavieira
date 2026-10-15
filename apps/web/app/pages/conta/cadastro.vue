<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const formError = ref<string | null>(null)

async function onSubmit() {
  formError.value = null
  if (password.value !== confirmPassword.value) {
    formError.value = 'As senhas não coincidem.'
    return
  }
  if (password.value.length < 8) {
    formError.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }
  const ok = await auth.register({ name: name.value, email: email.value, phone: phone.value, password: password.value })
  if (ok) router.push('/conta')
}
</script>

<template>
  <main class="container auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Criar Conta</h1>
      <p class="auth-sub">Crie sua conta</p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <div class="field">
          <label class="field__label">Nome completo</label>
          <input v-model="name" class="field__input" type="text" placeholder="Seu nome" required />
        </div>

        <div class="field">
          <label class="field__label">E-mail</label>
          <input v-model="email" class="field__input" type="email" placeholder="seu@email.com" required autocomplete="email" />
        </div>

        <div class="field">
          <label class="field__label">Telefone</label>
          <input v-model="phone" class="field__input" type="tel" placeholder="(11) 91234-5678" />
        </div>

        <div class="field">
          <label class="field__label">Senha</label>
          <input v-model="password" class="field__input" type="password" placeholder="Mínimo 8 caracteres" required autocomplete="new-password" />
        </div>

        <div class="field">
          <label class="field__label">Confirmar senha</label>
          <input v-model="confirmPassword" class="field__input" type="password" placeholder="Repita a senha" required autocomplete="new-password" />
        </div>

        <p v-if="formError || auth.error" class="auth-error">{{ formError ?? auth.error }}</p>

        <button type="submit" class="btn btn--primary full-width" :disabled="auth.loading">
          {{ auth.loading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <p class="auth-footer">
        Já tem conta?
        <RouterLink to="/conta/entrar" class="auth-link">Entrar</RouterLink>
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
</style>
