<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/lib/api'

const route = useRoute()
const router = useRouter()

const token = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const done = ref(false)
const error = ref<string | null>(null)
const tokenMissing = ref(false)

onMounted(() => {
  const t = route.query.token as string
  if (!t) {
    tokenMissing.value = true
    return
  }
  token.value = t
})

async function onSubmit() {
  error.value = null
  if (password.value !== confirm.value) {
    error.value = 'As senhas não coincidem.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }

  loading.value = true
  try {
    const res = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, password: password.value }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || !data.ok) {
      error.value = data.error ?? 'Erro ao redefinir senha.'
      return
    }
    done.value = true
    setTimeout(() => router.push('/conta/entrar'), 3000)
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

      <!-- Token ausente -->
      <template v-if="tokenMissing">
        <h1 class="auth-title">Link inválido</h1>
        <p class="auth-sub">
          Este link de recuperação é inválido ou expirou.
          Solicite um novo link abaixo.
        </p>
        <RouterLink to="/conta/recuperar-senha" class="btn btn--primary full-width">
          Solicitar novo link
        </RouterLink>
      </template>

      <!-- Sucesso -->
      <template v-else-if="done">
        <div class="success-icon" aria-hidden="true">✓</div>
        <h1 class="auth-title">Senha redefinida!</h1>
        <p class="auth-sub">
          Sua senha foi atualizada com sucesso.
          Você será redirecionado para o login em instantes.
        </p>
      </template>

      <!-- Formulário -->
      <template v-else>
        <h1 class="auth-title">Nova senha</h1>
        <p class="auth-sub">Defina sua nova senha abaixo.</p>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="field">
            <label class="field__label">Nova senha</label>
            <input
              v-model="password"
              class="field__input"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              autocomplete="new-password"
            />
          </div>

          <div class="field">
            <label class="field__label">Confirmar senha</label>
            <input
              v-model="confirm"
              class="field__input"
              type="password"
              placeholder="Repita a senha"
              required
              autocomplete="new-password"
            />
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button type="submit" class="btn btn--primary full-width" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Redefinir senha' }}
          </button>
        </form>
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
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  text-align: center;
}

.success-icon {
  font-size: 2.5rem;
  color: #22c55e;
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
