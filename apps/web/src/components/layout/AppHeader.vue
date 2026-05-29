<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const showDropdown = ref(false)
const mobileMenuOpen = ref(false)

async function handleLogout() {
  showDropdown.value = false
  mobileMenuOpen.value = false
  await auth.logout()
  router.push('/')
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <!-- Left: craft tagline -->
      <div class="header__left">
        <span class="header__pulse" aria-hidden="true" />
        <span class="header__tagline">Feito à mão, uma peça por vez</span>
      </div>

      <!-- Center: wordmark + tagline -->
      <RouterLink to="/" class="header__logo" @click="closeMobileMenu">
        <div class="logo__mark">
          <span class="logo__word">BRASA</span>
          <svg class="logo__flame" width="21" height="29" viewBox="38 18 72 124" aria-hidden="true">
            <defs>
              <linearGradient id="hfo" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stop-color="#7c2a0a"/>
                <stop offset="35%"  stop-color="#d96417"/>
                <stop offset="72%"  stop-color="#f08a3f"/>
                <stop offset="100%" stop-color="#fde68a"/>
              </linearGradient>
              <linearGradient id="hfi" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stop-color="#d96417"/>
                <stop offset="60%"  stop-color="#fde68a"/>
                <stop offset="100%" stop-color="#ffffff"/>
              </linearGradient>
              <radialGradient id="hfg" cx="50%" cy="85%" r="50%">
                <stop offset="0%"   stop-color="#d96417" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="#d96417" stop-opacity="0"/>
              </radialGradient>
              <filter id="hfb" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3"/>
              </filter>
            </defs>
            <ellipse cx="74" cy="138" rx="36" ry="14" fill="url(#hfg)" filter="url(#hfb)"/>
            <path d="M 74 20 C 82 36 96 50 98 68 C 100 82 96 92 92 100 C 104 90 108 76 104 60 C 112 74 110 94 100 108 C 108 100 112 86 108 72 C 116 90 112 110 102 122 C 94 132 82 138 74 140 C 66 138 54 132 46 122 C 36 110 32 90 40 72 C 36 86 40 100 48 108 C 38 94 36 74 44 60 C 40 76 44 90 56 100 C 52 92 48 82 50 68 C 52 50 66 36 74 20 Z" fill="url(#hfo)"/>
            <path d="M 74 44 C 79 56 87 66 88 80 C 89 90 85 98 80 106 C 86 98 88 88 86 78 C 91 88 89 100 82 110 C 78 118 74 122 74 122 C 74 122 70 118 66 110 C 59 100 57 88 62 78 C 60 88 62 98 68 106 C 63 98 59 90 60 80 C 61 66 69 56 74 44 Z" fill="url(#hfi)" opacity="0.85"/>
            <ellipse cx="74" cy="118" rx="6" ry="5" fill="#fef3c7" opacity="0.9"/>
          </svg>
          <span class="logo__word">PREMIUM</span>
        </div>
        <span class="logo__tagline">Do aço inox ao ritual</span>
      </RouterLink>

      <!-- Right: nav -->
      <nav class="header__nav">
        <RouterLink to="/#produtos" class="nav__link">Loja</RouterLink>
        <RouterLink to="/#sob-medida" class="nav__link">Sob medida</RouterLink>
        <RouterLink to="/#processo" class="nav__link">Atelier</RouterLink>
        <RouterLink to="/carrinho" class="nav__link nav__link--cart">
          Sacola
          <span v-if="cart.totalItems > 0" class="nav__badge">{{ cart.totalItems }}</span>
        </RouterLink>

        <RouterLink v-if="!auth.isLoggedIn" to="/conta/entrar" class="nav__link">Entrar</RouterLink>
        <div v-else class="nav__account" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <button class="account-avatar">{{ auth.user?.name?.[0]?.toUpperCase() }}</button>
          <div v-show="showDropdown" class="account-dropdown">
            <RouterLink to="/conta" class="dropdown-item" @click="showDropdown = false">Minha Conta</RouterLink>
            <RouterLink to="/conta/pedidos" class="dropdown-item" @click="showDropdown = false">Meus Pedidos</RouterLink>
            <button class="dropdown-item dropdown-item--danger" @click="handleLogout">Sair</button>
          </div>
        </div>
      </nav>

      <!-- Mobile hamburger -->
      <button class="hamburger" :class="{ open: mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
        <span /><span /><span />
      </button>
    </div>

    <!-- Mobile drawer -->
    <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
      <nav class="mobile-nav">
        <RouterLink to="/#produtos" class="mobile-nav__link" @click="closeMobileMenu">Loja</RouterLink>
        <RouterLink to="/#sob-medida" class="mobile-nav__link" @click="closeMobileMenu">Sob medida</RouterLink>
        <RouterLink to="/#processo" class="mobile-nav__link" @click="closeMobileMenu">Atelier</RouterLink>
        <RouterLink to="/carrinho" class="mobile-nav__link" @click="closeMobileMenu">
          Sacola <span v-if="cart.totalItems > 0" class="nav__badge">{{ cart.totalItems }}</span>
        </RouterLink>
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/conta/entrar" class="mobile-nav__link" @click="closeMobileMenu">Entrar</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/conta" class="mobile-nav__link" @click="closeMobileMenu">Minha Conta</RouterLink>
          <RouterLink to="/conta/pedidos" class="mobile-nav__link" @click="closeMobileMenu">Meus Pedidos</RouterLink>
          <button class="mobile-nav__link mobile-nav__link--danger" @click="handleLogout">Sair</button>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--c-hair);
  background: rgba(11, 10, 8, 0.85);
  backdrop-filter: blur(20px);
}

.header__inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 18px 70px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Left tagline */
.header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-dim);
}

.header__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-ember);
  box-shadow: 0 0 10px var(--c-ember);
  flex-shrink: 0;
  animation: hdr-pulse 2.4s ease-in-out infinite;
}

@keyframes hdr-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50%       { opacity: 1; transform: scale(1.3); }
}

.header__tagline {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
  white-space: nowrap;
}

/* Center logo */
.header__logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  justify-self: center;
}

.logo__mark {
  display: flex;
  align-items: center;
  line-height: 1;
}

.logo__word {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--c-ivory);
  line-height: 1;
}

.logo__flame {
  margin: 0 10px 2px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(217,100,23,0.45));
}

.logo__tagline {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
  white-space: nowrap;
}

/* Right nav */
.header__nav {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-end;
}

.nav__link {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: color 150ms;
}

.nav__link:hover { color: var(--c-ember); }

.nav__badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--c-ember);
  color: var(--c-ivory);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
}

.nav__account {
  position: relative;
  padding-bottom: 10px;
  margin-bottom: -10px;
}

.account-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-ember);
  border: none;
  color: var(--c-ivory);
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(11, 10, 8, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid var(--c-hair-bold);
  min-width: 160px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-dim);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 120ms, color 120ms;
}

.dropdown-item:hover { background: rgba(217, 100, 23, 0.08); color: var(--c-ivory); }
.dropdown-item--danger:hover { background: rgba(220, 38, 38, 0.08); color: #ef4444; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 34px;
  height: 34px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  justify-self: end;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 1px;
  background: var(--c-ivory);
  transition: transform 0.25s, opacity 0.2s;
  transform-origin: center;
}

.hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile drawer */
.mobile-menu {
  display: none;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s, opacity 0.25s;
  background: rgba(11, 10, 8, 0.97);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--c-hair);
}

.mobile-menu.open { max-height: 400px; opacity: 1; }

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 16px 24px 24px;
  gap: 4px;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-dim);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: color 120ms;
}

.mobile-nav__link:hover { color: var(--c-ivory); }
.mobile-nav__link--danger { color: #f87171; }

@media (max-width: 900px) {
  .header__inner {
    grid-template-columns: auto 1fr auto;
    padding: 14px 24px;
  }
  .header__logo { justify-self: center; }
  .header__nav { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: block; }
}

@media (max-width: 720px) {
  .header__left { display: none; }
}
</style>
