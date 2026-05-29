<template>
  <header class="header" :class="{ 'header--scrolled': scrolled }">
    <div class="header__inner">

      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <img
          src="https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/LOGO-png-2.png"
          alt="Tornearia Vieira"
          class="logo__img"
          :class="{ 'logo--invert': !isDark }"
        />
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="nav-desktop">
        <a href="/#services" @click.prevent="scrollOrNavigate('#services')" class="nav-link">Serviços</a>
        <NuxtLink to="/catalogo" class="nav-link">Catálogo</NuxtLink>
        <a href="/#about" @click.prevent="scrollOrNavigate('#about')" class="nav-link">Sobre</a>
        <a href="/#contact" @click.prevent="scrollOrNavigate('#contact')" class="nav-link">Contato</a>

        <!-- Cart -->
        <NuxtLink to="/carrinho" class="nav-link nav-link--cart" title="Carrinho">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
        </NuxtLink>

        <!-- Auth -->
        <div v-if="auth.isLoggedIn" class="nav-account" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <button class="account-avatar">{{ auth.user?.name?.[0]?.toUpperCase() }}</button>
          <div v-show="showDropdown" class="account-dropdown">
            <NuxtLink to="/conta" class="dropdown-item" @click="showDropdown = false">Minha Conta</NuxtLink>
            <NuxtLink to="/conta/pedidos" class="dropdown-item" @click="showDropdown = false">Pedidos</NuxtLink>
            <button class="dropdown-item dropdown-item--danger" @click="handleLogout">Sair</button>
          </div>
        </div>
        <NuxtLink v-else to="/conta/entrar" class="nav-link">Entrar</NuxtLink>

        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <a :href="whatsapp" target="_blank" rel="noopener" class="btn-gold">Orçamento</a>
      </nav>

      <!-- Mobile actions -->
      <div class="header__mobile-actions">
        <NuxtLink to="/carrinho" class="nav-link nav-link--cart">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
        </NuxtLink>

        <button @click="toggleTheme" class="theme-toggle">
          <svg v-if="isDark" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button @click="mobileOpen = !mobileOpen" class="hamburger" aria-label="Menu">
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div v-if="mobileOpen" class="nav-mobile">
        <a href="/#services" @click.prevent="scrollOrNavigate('#services'); mobileOpen = false" class="nav-mobile__link">Serviços</a>
        <NuxtLink to="/catalogo" class="nav-mobile__link" @click="mobileOpen = false">Catálogo</NuxtLink>
        <a href="/#about" @click.prevent="scrollOrNavigate('#about'); mobileOpen = false" class="nav-mobile__link">Sobre</a>
        <a href="/#contact" @click.prevent="scrollOrNavigate('#contact'); mobileOpen = false" class="nav-mobile__link">Contato</a>
        <template v-if="auth.isLoggedIn">
          <NuxtLink to="/conta" class="nav-mobile__link" @click="mobileOpen = false">Minha Conta</NuxtLink>
          <NuxtLink to="/conta/pedidos" class="nav-mobile__link" @click="mobileOpen = false">Pedidos</NuxtLink>
          <button class="nav-mobile__link nav-mobile__link--danger" @click="handleLogout">Sair</button>
        </template>
        <NuxtLink v-else to="/conta/entrar" class="nav-mobile__link" @click="mobileOpen = false">Entrar</NuxtLink>
        <a :href="whatsapp" target="_blank" rel="noopener" class="btn-gold" style="text-align:center; margin-top: 8px">
          Solicitar Orçamento
        </a>
      </div>
    </Transition>
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
const showDropdown = ref(false)

async function handleLogout() {
  showDropdown.value = false
  mobileOpen.value = false
  await auth.logout()
  router.push('/')
}

function scrollOrNavigate(hash) {
  const el = document.querySelector(hash)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    router.push('/' + hash)
  }
}

function onScroll() { scrolled.value = window.scrollY > 60 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s;
  border-bottom: 1px solid transparent;
}
.header--scrolled {
  background: rgba(245,245,243,0.94);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--c-border);
}
:global(:root.dark) .header--scrolled {
  background: rgba(10,10,10,0.94);
}

.header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo { display: flex; align-items: center; text-decoration: none; }
.logo__img {
  height: 44px;
  width: auto;
  object-fit: contain;
  transition: filter 0.35s;
}
.logo--invert { filter: invert(1) brightness(0.15); }
:global(:root.dark) .logo__img { filter: none; }

.nav-desktop {
  display: none;
  align-items: center;
  gap: 24px;
}
@media (min-width: 900px) { .nav-desktop { display: flex; } }

.nav-link {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}
.nav-link:hover { color: var(--c-accent); }
.nav-link--cart { color: var(--c-text); }

.cart-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--c-accent);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
:global(:root.dark) .cart-badge { color: #0A0A0A; }

.nav-account {
  position: relative;
  padding-bottom: 10px;
  margin-bottom: -10px;
}
.account-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-accent);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
:global(:root.dark) .account-avatar { color: #0A0A0A; }
.account-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  min-width: 160px;
  overflow: hidden;
  z-index: 200;
  box-shadow: var(--shadow-md);
}
.dropdown-item {
  display: block;
  padding: 10px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.dropdown-item:hover { background: var(--c-surface2); color: var(--c-text); }
.dropdown-item--danger:hover { color: #ef4444; background: rgba(239,68,68,0.06); }

.theme-toggle {
  width: 34px; height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.theme-toggle:hover { border-color: var(--c-accent); color: var(--c-accent); }

.header__mobile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (min-width: 900px) { .header__mobile-actions { display: none; } }

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
}
.hamburger span {
  display: block;
  height: 1px;
  background: var(--c-text);
  transition: all 0.3s;
}
.hamburger span:nth-child(1) { width: 22px; }
.hamburger span:nth-child(2) { width: 14px; background: var(--c-accent); }
.hamburger span:nth-child(3) { width: 22px; }
.hamburger span.open:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
.hamburger span.open:nth-child(2) { opacity: 0; }
.hamburger span.open:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

.nav-mobile {
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.nav-mobile__link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: color 0.2s;
}
.nav-mobile__link:hover { color: var(--c-accent); }
.nav-mobile__link--danger { color: #ef4444; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
