<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth'] })

import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiFetchAuth } from '@/lib/api'

const auth = useAuthStore()

const name = ref(auth.user?.name ?? '')
const phone = ref(auth.user?.phone ?? '')
const profileSuccess = ref(false)
const profileError = ref<string | null>(null)
const profileLoading = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordSuccess = ref(false)
const passwordError = ref<string | null>(null)
const passwordLoading = ref(false)

onMounted(() => {
  name.value = auth.user?.name ?? ''
  phone.value = auth.user?.phone ?? ''
})

async function saveProfile() {
  profileError.value = null
  profileSuccess.value = false
  profileLoading.value = true
  try {
    const res = await apiFetchAuth('/api/account/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, phone: phone.value }),
    })
    const data = await res.json()
    if (!res.ok) {
      profileError.value = data.error ?? 'Erro ao salvar'
      return
    }
    auth.setAuth({ accessToken: auth.accessToken!, user: data })
    profileSuccess.value = true
    setTimeout(() => (profileSuccess.value = false), 3000)
  } finally {
    profileLoading.value = false
  }
}

async function changePassword() {
  passwordError.value = null
  passwordSuccess.value = false
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'As senhas não coincidem.'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'A nova senha deve ter pelo menos 8 caracteres.'
    return
  }
  passwordLoading.value = true
  try {
    const res = await apiFetchAuth('/api/account/me/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPassword.value, newPassword: newPassword.value }),
    })
    const data = await res.json()
    if (!res.ok) {
      passwordError.value = data.error ?? 'Erro ao alterar senha'
      return
    }
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordSuccess.value = true
    setTimeout(() => (passwordSuccess.value = false), 3000)
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="profile-view">
    <h2 class="page-title">Meus Dados</h2>

    <!-- Profile section -->
    <section class="form-card">
      <h3 class="section-title">Informações pessoais</h3>

      <div class="form-fields">
        <div class="field">
          <label class="field__label">Nome completo</label>
          <input v-model="name" class="field__input" type="text" />
        </div>
        <div class="field">
          <label class="field__label">E-mail</label>
          <input class="field__input field__input--disabled" type="email" :value="auth.user?.email" disabled />
        </div>
        <div class="field">
          <label class="field__label">Telefone</label>
          <input v-model="phone" class="field__input" type="tel" placeholder="(11) 91234-5678" />
        </div>
      </div>

      <p v-if="profileError" class="feedback feedback--error">{{ profileError }}</p>
      <p v-if="profileSuccess" class="feedback feedback--success">Dados atualizados com sucesso!</p>

      <button class="btn btn--primary" :disabled="profileLoading" @click="saveProfile">
        {{ profileLoading ? 'Salvando...' : 'Salvar alterações' }}
      </button>
    </section>

    <!-- Password section -->
    <section class="form-card">
      <h3 class="section-title">Alterar senha</h3>

      <div class="form-fields">
        <div class="field">
          <label class="field__label">Senha atual</label>
          <input v-model="currentPassword" class="field__input" type="password" autocomplete="current-password" />
        </div>
        <div class="field">
          <label class="field__label">Nova senha</label>
          <input v-model="newPassword" class="field__input" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
        </div>
        <div class="field">
          <label class="field__label">Confirmar nova senha</label>
          <input v-model="confirmPassword" class="field__input" type="password" autocomplete="new-password" />
        </div>
      </div>

      <p v-if="passwordError" class="feedback feedback--error">{{ passwordError }}</p>
      <p v-if="passwordSuccess" class="feedback feedback--success">Senha alterada com sucesso!</p>

      <button class="btn btn--primary" :disabled="passwordLoading" @click="changePassword">
        {{ passwordLoading ? 'Alterando...' : 'Alterar senha' }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.page-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--c-stone-50);
  margin-bottom: 1.5rem;
}

.form-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-stone-100);
  margin: 0 0 1.25rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
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

.field__input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback {
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.feedback--error {
  color: #ef4444;
}

.feedback--success {
  color: #22c55e;
}
</style>
