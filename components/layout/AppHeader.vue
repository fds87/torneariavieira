<template>
  <header class="header" :class="{ 'header--scrolled': scrolled }">
    <div class="header__inner">

      <!-- Logo -->
      <a href="#hero" @click.prevent="scrollTo('#hero')" class="logo">
        <img
          src="https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/LOGO-png-2.png"
          alt="Tornearia Vieira"
          class="logo__img"
          :class="{ 'logo--invert': !isDark }"
        />
      </a>

      <!-- Desktop nav -->
      <nav class="nav-desktop">
        <a v-for="item in navItems" :key="item.href" :href="item.href"
          @click.prevent="scrollTo(item.href)" class="nav-link">
          {{ item.label }}
        </a>

        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none">
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
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <a :href="whatsapp" target="_blank" class="btn-gold">Orçamento</a>
      </nav>

      <!-- Mobile: toggle + hamburger -->
      <div class="header__mobile-actions">
        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
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
        <a v-for="item in navItems" :key="item.href" :href="item.href"
          @click.prevent="scrollTo(item.href); mobileOpen = false" class="nav-mobile__link">
          {{ item.label }}
        </a>
        <a :href="whatsapp" target="_blank" class="btn-gold" style="text-align:center; margin-top:8px">
          Solicitar Orçamento
        </a>
      </div>
    </Transition>
  </header>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()
const whatsapp = 'https://wa.me/5541999802662'
const scrolled = ref(false)
const mobileOpen = ref(false)

const navItems = [
  { label: 'Serviços',    href: '#services' },
  { label: 'Sobre',       href: '#about' },
  { label: 'Por que nós', href: '#whyus' },
  { label: 'Contato',     href: '#contact' },
]

function scrollTo(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
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
  gap: 28px;
}
@media (min-width: 768px) { .nav-desktop { display: flex; } }

.nav-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover { color: var(--c-accent); }

.theme-toggle {
  width: 36px; height: 36px;
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
@media (min-width: 768px) { .header__mobile-actions { display: none; } }

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
  gap: 16px;
}
.nav-mobile__link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  color: var(--c-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.nav-mobile__link:hover { color: var(--c-accent); }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
