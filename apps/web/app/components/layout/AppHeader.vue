<template>
  <header class="hdr" :class="{ scrolled }">
    <div class="hdr__in">
      <NuxtLink to="/" class="brand" aria-label="Tornearia Vieira">
        <img class="brand__logo brand__logo--dark" src="/logo-dark.png" alt="Tornearia Vieira" />
        <img class="brand__logo brand__logo--light" src="/logo.png" alt="" aria-hidden="true" />
      </NuxtLink>

      <!-- Nav desktop -->
      <nav class="nav">
        <a href="/#services" class="link" @click.prevent="go('#services')">Serviços</a>
        <NuxtLink to="/catalogo" class="link">Catálogo</NuxtLink>
        <a href="/#about" class="link" @click.prevent="go('#about')">Sobre</a>
        <a href="/#contact" class="link" @click.prevent="go('#contact')">Contato</a>
      </nav>

      <div class="hdr__actions">
        <!-- Carrinho -->
        <NuxtLink to="/carrinho" class="iconbtn cart" aria-label="Carrinho">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span v-if="cart.totalItems > 0" class="cart__badge">{{ cart.totalItems }}</span>
        </NuxtLink>

        <!-- Conta -->
        <div v-if="auth.isLoggedIn" class="account" @mouseenter="dropdown = true" @mouseleave="dropdown = false">
          <button class="account__avatar">{{ auth.user?.name?.[0]?.toUpperCase() }}</button>
          <div v-show="dropdown" class="account__menu">
            <NuxtLink to="/conta" class="account__item" @click="dropdown = false">Minha Conta</NuxtLink>
            <NuxtLink to="/conta/pedidos" class="account__item" @click="dropdown = false">Pedidos</NuxtLink>
            <button class="account__item account__item--danger" @click="logout">Sair</button>
          </div>
        </div>
        <NuxtLink v-else to="/conta/entrar" class="link account-link">Entrar</NuxtLink>

        <!-- Tema -->
        <button class="iconbtn" @click="toggleTheme" :aria-label="isDark ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.6" y1="4.6" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.4" y2="4.6"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
        </button>

        <a :href="whatsapp" target="_blank" rel="noopener" class="btn btn--gold hdr__cta">Orçamento <span class="arrow">→</span></a>

        <button class="burger" :class="{ open: mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>

    <!-- Mobile overlay -->
    <div class="mobile" :class="{ open: mobileOpen }">
      <a href="/#services" @click.prevent="go('#services'); mobileOpen = false"><span>01</span> Serviços</a>
      <NuxtLink to="/catalogo" @click="mobileOpen = false"><span>02</span> Catálogo</NuxtLink>
      <a href="/#about" @click.prevent="go('#about'); mobileOpen = false"><span>03</span> Sobre</a>
      <a href="/#contact" @click.prevent="go('#contact'); mobileOpen = false"><span>04</span> Contato</a>
      <template v-if="auth.isLoggedIn">
        <NuxtLink to="/conta" @click="mobileOpen = false"><span>—</span> Minha Conta</NuxtLink>
      </template>
      <NuxtLink v-else to="/conta/entrar" @click="mobileOpen = false"><span>—</span> Entrar</NuxtLink>
      <a :href="whatsapp" target="_blank" rel="noopener" class="btn btn--gold">Solicitar Orçamento <span class="arrow">→</span></a>
    </div>
  </header>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const { isDark, toggleTheme } = useTheme()
const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const whatsapp = 'https://wa.me/5541999802662'
const scrolled = ref(false)
const mobileOpen = ref(false)
const dropdown = ref(false)

async function logout() {
  dropdown.value = false; mobileOpen.value = false
  await auth.logout(); router.push('/')
}

function go(hash) {
  const el = document.querySelector(hash)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' })
  else router.push('/' + hash)
}

function onScroll() { scrolled.value = window.scrollY > 50 }
watch(mobileOpen, (v) => { if (process.client) document.body.style.overflow = v ? 'hidden' : '' })
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.hdr {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  border-bottom: 1px solid transparent;
  transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s;
}
.hdr.scrolled {
  background: color-mix(in srgb, var(--c-bg) 80%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  border-color: var(--c-border);
}
.hdr__in {
  max-width: var(--max); margin: 0 auto; padding: 0 32px;
  height: 76px; display: flex; align-items: center; justify-content: space-between;
  transition: height 0.4s;
}
.hdr.scrolled .hdr__in { height: 64px; }
@media (max-width: 640px){ .hdr__in { padding: 0 20px; } }

.brand { display: flex; align-items: center; }
.brand__logo { height: 38px; width: auto; transition: height 0.4s; }
.hdr.scrolled .brand__logo { height: 32px; }
.brand__logo--light { display: none; }
:global(:root:not(.dark)) .brand__logo--dark { display: none; }
:global(:root:not(.dark)) .brand__logo--light { display: block; }

.nav { display: none; align-items: center; gap: 30px; }
@media (min-width: 940px){ .nav { display: flex; } }
.link {
  position: relative; font-family: var(--font-mono);
  font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-muted);
  transition: color 0.25s;
}
.link::after { content: ''; position: absolute; left: 0; bottom: -6px; width: 0; height: 1px; background: var(--c-accent); transition: width 0.3s var(--ease-out); }
.link:hover { color: var(--c-text); }
.link:hover::after { width: 100%; }

.hdr__actions { display: flex; align-items: center; gap: 12px; }
.iconbtn {
  position: relative;
  width: 38px; height: 38px; display: grid; place-items: center;
  border: 1px solid var(--c-border); color: var(--c-muted);
  transition: border-color 0.25s, color 0.25s;
}
.iconbtn:hover { border-color: var(--c-accent); color: var(--c-accent); }
.cart { color: var(--c-text); }
.cart__badge {
  position: absolute; top: -8px; right: -8px;
  min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9999px;
  background: var(--c-accent); color: #fff; font-family: var(--font-body);
  font-size: 0.6rem; font-weight: 700; display: grid; place-items: center;
}
:global(:root.dark) .cart__badge { color: #0B0B0C; }

.account { position: relative; display: none; }
@media (min-width: 940px){ .account, .account-link { display: flex; } }
.account-link { display: none; }
.account__avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--c-accent); color: #fff; font-weight: 700; font-size: 14px; display: grid; place-items: center; }
:global(:root.dark) .account__avatar { color: #0B0B0C; }
.account__menu { position: absolute; top: 100%; right: 0; min-width: 168px; background: var(--c-surface); border: 1px solid var(--c-border); z-index: 10; }
.account__item { display: block; width: 100%; text-align: left; padding: 11px 16px; font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-muted); transition: background 0.2s, color 0.2s; }
.account__item:hover { background: var(--c-surface2); color: var(--c-text); }
.account__item--danger:hover { color: #ef4444; }

.hdr__cta { display: none; }
@media (min-width: 940px){ .hdr__cta { display: inline-flex; } }

.burger { display: grid; gap: 5px; width: 38px; height: 38px; place-content: center; }
@media (min-width: 940px){ .burger { display: none; } }
.burger span { display: block; width: 22px; height: 1.5px; background: var(--c-text); transition: 0.3s; }
.burger span:nth-child(2){ width: 14px; background: var(--c-accent); }
.burger.open span:nth-child(1){ transform: translateY(6.5px) rotate(45deg); }
.burger.open span:nth-child(2){ opacity: 0; }
.burger.open span:nth-child(3){ transform: translateY(-6.5px) rotate(-45deg); width: 22px; }

.mobile {
  position: fixed; inset: 0; z-index: -1;
  background: var(--c-bg);
  padding: 100px 32px 40px;
  display: flex; flex-direction: column; gap: 4px;
  transform: translateY(-100%); opacity: 0;
  transition: transform 0.5s var(--ease-out), opacity 0.3s;
}
.mobile.open { transform: translateY(0); opacity: 1; z-index: 190; }
.mobile a { font-family: var(--font-display); font-size: 2.6rem; letter-spacing: 0.04em; padding: 10px 0; border-bottom: 1px solid var(--c-border); display: flex; align-items: baseline; gap: 16px; }
.mobile a span { font-family: var(--font-mono); font-size: 0.7rem; color: var(--c-accent); }
.mobile .btn { margin-top: 24px; align-self: flex-start; font-size: 0.8rem; }
@media (max-width: 480px){ .mobile a { font-size: 2.1rem; } }
</style>
