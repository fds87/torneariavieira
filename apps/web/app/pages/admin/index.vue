<script setup lang="ts">
definePageMeta({ layout: 'admin' })

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { adminFetch } = useAdminFetch()
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await adminFetch('/api/admin/login', {
      method: 'POST',
      headers: { 'x-admin-key': password.value },
    })
    if (!res.ok) {
      error.value = 'Senha incorreta'
      return
    }
    sessionStorage.setItem('admin-key', password.value)
    router.push('/admin/pedidos')
  } catch {
    error.value = 'Erro de conexao'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-login">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-forja">Forja</span><span class="logo-amp"> & </span><span class="logo-brasa">Brasa</span>
      </div>
      <h1 class="login-title">Painel Admin</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="password">Senha de acesso</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••••••"
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading" class="btn-login">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c0a09;
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #1c1917;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 2.5rem 2rem;
}

.login-logo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
}

.logo-forja { color: #f5f5f4; }
.logo-amp { color: #ca8a04; font-style: italic; }
.logo-brasa { color: #ca8a04; }

.login-title {
  text-align: center;
  font-size: 0.85rem;
  color: #78716c;
  font-weight: 400;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: #a8a29e;
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  background: #0c0a09;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f5f5f4;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ca8a04;
}

.error {
  color: #f87171;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #ca8a04;
  color: #0c0a09;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
