<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const step = ref<'email' | 'password'>('email')
const email = ref('')
const password = ref('')

function goToPassword() {
  auth.error = null
  step.value = 'password'
}

function backToEmail() {
  auth.error = null
  password.value = ''
  step.value = 'email'
}

async function onSubmit() {
  if (step.value === 'email') {
    goToPassword()
    return
  }
  const ok = await auth.login({ email: email.value, password: password.value })
  if (ok) {
    const raw = route.query.redirect as string
    const redirect = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/conta'
    router.push(redirect)
  }
}
</script>

<template>
  <main class="authp">
    <div class="grid-layer authp__grid"></div>

    <!-- lado decorativo -->
    <aside class="authp__aside">
      <svg class="authp__schematic" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
        <g class="spin"><circle cx="100" cy="100" r="80" stroke-width="0.5" stroke-dasharray="3 5"/><circle cx="100" cy="100" r="60" stroke-width="0.4"/></g>
        <circle cx="100" cy="100" r="34" stroke-width="0.6"/><circle cx="100" cy="100" r="7" stroke-width="0.8"/>
        <line x1="0" y1="100" x2="200" y2="100" stroke-width="0.3" opacity="0.5"/><line x1="100" y1="0" x2="100" y2="200" stroke-width="0.3" opacity="0.5"/>
      </svg>
      <div class="authp__aside-in">
        <span class="eyebrow"><b>//</b> Área do cliente</span>
        <h2 class="authp__aside-title font-display">PRECISÃO<br /><span class="gold">EM CADA PEÇA</span></h2>
        <p class="mono">Acompanhe pedidos, orçamentos e fabricação sob desenho.</p>
      </div>
    </aside>

    <!-- formulário -->
    <div class="authp__panel">
      <div class="authp__card">
        <span class="eyebrow"><b>//</b> Entrar</span>
        <h1 class="authp__title font-display">ACESSE SUA CONTA</h1>

        <form class="authp__form" @submit.prevent="onSubmit">

          <!-- PASSO 1 — e-mail -->
          <template v-if="step === 'email'">
            <div class="field">
              <label class="field__label">E-mail</label>
              <input
                v-model="email"
                class="field__input"
                type="email"
                placeholder="seu@email.com"
                required
                autocomplete="email"
                autofocus
              />
            </div>
            <button type="submit" class="btn btn--gold authp__submit">
              Continuar <span class="arrow">→</span>
            </button>
          </template>

          <!-- PASSO 2 — senha -->
          <template v-else>
            <div class="field">
              <label class="field__label">E-mail</label>
              <div class="email-row">
                <span class="email-val">{{ email }}</span>
                <button type="button" class="authp__change mono" @click="backToEmail">Trocar</button>
              </div>
            </div>

            <div class="field">
              <div class="field-header">
                <label class="field__label">Senha</label>
                <RouterLink to="/conta/recuperar-senha" class="authp__forgot mono">Esqueceu?</RouterLink>
              </div>
              <input
                v-model="password"
                class="field__input"
                type="password"
                placeholder="Sua senha"
                required
                autocomplete="current-password"
                autofocus
              />
            </div>

            <p v-if="auth.error" class="authp__error mono">{{ auth.error }}</p>

            <button type="submit" class="btn btn--gold authp__submit" :disabled="auth.loading">
              {{ auth.loading ? 'Entrando…' : 'Entrar' }} <span class="arrow">→</span>
            </button>
          </template>

        </form>

        <p class="authp__footer mono">
          Não tem conta?
          <RouterLink to="/conta/cadastro" class="authp__link">Criar conta →</RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.authp { position: relative; min-height: 100vh; background: var(--c-bg); display: grid; grid-template-columns: 1fr; padding-top: 76px; overflow: hidden; }
@media (min-width: 940px){ .authp { grid-template-columns: 1fr 1fr; padding-top: 0; } }
.authp__grid { opacity: 0.5; }

.authp__aside { display: none; position: relative; border-right: 1px solid var(--c-border); background: var(--c-surface); overflow: hidden; }
@media (min-width: 940px){ .authp__aside { display: flex; align-items: flex-end; padding: 64px; } }
.authp__schematic { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120%; color: var(--c-accent); opacity: 0.4; }
.authp__schematic .spin { transform-origin: center; animation: spin 70s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.authp__aside-in { position: relative; z-index: 1; }
.authp__aside-title { font-size: clamp(2.4rem, 4vw, 3.6rem); line-height: 0.92; letter-spacing: 0.02em; margin: 16px 0 14px; }
.authp__aside-in p { color: var(--c-muted); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; max-width: 320px; line-height: 1.8; }

.authp__panel { position: relative; z-index: 1; display: grid; place-items: center; padding: 60px 24px; }
.authp__card { width: 100%; max-width: 420px; border: 1px solid var(--c-border); background: var(--c-surface); padding: 44px 38px; clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); }
.authp__title { font-size: 2.2rem; letter-spacing: 0.03em; margin: 14px 0 32px; line-height: 1; }
.authp__form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field-header { display: flex; justify-content: space-between; align-items: center; }

.email-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1px solid var(--c-border); background: var(--c-bg2); }
.email-val { font-size: 0.9rem; color: var(--c-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.authp__change { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-accent); transition: color 0.2s; flex-shrink: 0; }
.authp__change:hover { color: var(--c-accent-2); text-decoration: underline; text-underline-offset: 3px; }

.authp__forgot { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c-muted); transition: color 0.2s; }
.authp__forgot:hover { color: var(--c-accent); }
.authp__error { font-size: 0.7rem; color: #ef4444; letter-spacing: 0.04em; }
.authp__submit { width: 100%; justify-content: center; margin-top: 6px; }
.authp__footer { margin-top: 26px; text-align: center; font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--c-muted); }
.authp__link { color: var(--c-accent); }
.authp__link:hover { text-decoration: underline; text-underline-offset: 3px; }
</style>
