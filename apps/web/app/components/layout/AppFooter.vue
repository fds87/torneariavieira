<template>
  <footer class="footer">
    <div class="shell">
      <div class="footer__top">
        <div class="footer__brand">
          <NuxtLink to="/" class="brand" aria-label="Tornearia Vieira">
            <img v-show="isDark" class="brand__logo" src="/logo-dark.png" alt="Tornearia Vieira" />
            <img v-show="!isDark" class="brand__logo" src="/logo.png" alt="" aria-hidden="true" />
          </NuxtLink>
          <p>Precisão em usinagem e fabricação de peças industriais sob desenho. {{ site.location }}.</p>
        </div>
        <div class="footer__col">
          <h4>Navegação</h4>
          <a href="/#services">Serviços</a>
          <NuxtLink to="/catalogo">Catálogo</NuxtLink>
          <a href="/#about">Sobre</a>
          <a href="/#contact">Contato</a>
        </div>
        <div class="footer__col">
          <h4>Contato</h4>
          <p>{{ site.phoneFormatted }}</p>
          <a :href="`mailto:${site.email}`">E-mail</a>
          <a :href="site.facebook" target="_blank" rel="noopener">Facebook</a>
          <p>{{ site.location }}</p>
        </div>
      </div>
    </div>
    <div class="footer__bigtv font-display">TORNEARIA VIEIRA</div>
    <div class="shell">
      <div class="footer__bottom">
        <span>© {{ year }} Tornearia Vieira — Todos os direitos reservados</span>
        <span>Usinagem · CNC · Sob desenho</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { site } from '~/data/content.js'
const { isDark } = useTheme()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer { background: var(--c-bg2); border-top: 1px solid var(--c-border); padding: 80px 0 0; position: relative; overflow: hidden; }
.brand { display: flex; align-items: center; margin-bottom: 22px; }
.brand__logo { height: 42px; width: auto; }
.footer__top { display: grid; grid-template-columns: 1fr; gap: 48px; padding-bottom: 56px; border-bottom: 1px solid var(--c-border); }
@media (min-width: 860px){ .footer__top { grid-template-columns: 1.6fr 1fr 1fr; } }
.footer__brand p { color: var(--c-muted); max-width: 320px; font-size: 0.95rem; }
.footer__col h4 { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-muted); margin-bottom: 20px; }
.footer__col a, .footer__col p { display: block; color: var(--c-text); font-size: 0.92rem; margin-bottom: 12px; transition: color 0.25s; }
.footer__col a:hover { color: var(--c-accent); }
.footer__bigtv { font-size: clamp(4rem, 18vw, 16rem); line-height: 0.8; letter-spacing: 0.02em; color: var(--c-text); opacity: 0.04; text-align: center; padding: 30px 0 10px; user-select: none; white-space: nowrap; }
.footer__bottom { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; padding: 24px 0 30px; }
.footer__bottom span { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--c-faint); text-transform: uppercase; }
@media (max-width: 760px){ .footer { padding: 64px 0 0; } .footer__top { gap: 38px; padding-bottom: 44px; } }
@media (max-width: 480px){ .footer__bottom { flex-direction: column; align-items: flex-start; gap: 8px; } }
</style>
