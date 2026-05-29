<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <div class="footer__logo">
          <span class="footer__word">BRASA</span>
          <svg width="38" height="52" viewBox="38 18 72 124" aria-hidden="true" class="footer__flame">
            <defs>
              <linearGradient id="ffo" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stop-color="#7c2a0a"/>
                <stop offset="35%"  stop-color="#d96417"/>
                <stop offset="72%"  stop-color="#f08a3f"/>
                <stop offset="100%" stop-color="#fde68a"/>
              </linearGradient>
              <linearGradient id="ffi" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stop-color="#d96417"/>
                <stop offset="60%"  stop-color="#fde68a"/>
                <stop offset="100%" stop-color="#ffffff"/>
              </linearGradient>
              <radialGradient id="ffg" cx="50%" cy="85%" r="50%">
                <stop offset="0%"   stop-color="#d96417" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="#d96417" stop-opacity="0"/>
              </radialGradient>
              <filter id="ffb" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3"/>
              </filter>
            </defs>
            <ellipse cx="74" cy="138" rx="36" ry="14" fill="url(#ffg)" filter="url(#ffb)"/>
            <path d="M 74 20 C 82 36 96 50 98 68 C 100 82 96 92 92 100 C 104 90 108 76 104 60 C 112 74 110 94 100 108 C 108 100 112 86 108 72 C 116 90 112 110 102 122 C 94 132 82 138 74 140 C 66 138 54 132 46 122 C 36 110 32 90 40 72 C 36 86 40 100 48 108 C 38 94 36 74 44 60 C 40 76 44 90 56 100 C 52 92 48 82 50 68 C 52 50 66 36 74 20 Z" fill="url(#ffo)">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="2.4s" repeatCount="indefinite"/>
            </path>
            <path d="M 74 44 C 79 56 87 66 88 80 C 89 90 85 98 80 106 C 86 98 88 88 86 78 C 91 88 89 100 82 110 C 78 118 74 122 74 122 C 74 122 70 118 66 110 C 59 100 57 88 62 78 C 60 88 62 98 68 106 C 63 98 59 90 60 80 C 61 66 69 56 74 44 Z" fill="url(#ffi)" opacity="0.85"/>
            <ellipse cx="74" cy="118" rx="6" ry="5" fill="#fef3c7" opacity="0.9"/>
          </svg>
          <span class="footer__word">PREMIUM</span>
        </div>
        <div class="footer__sub">Do aço inox ao ritual</div>
        <p class="footer__tagline">
          Proteção que você sente no toque.<br />Qualidade que dura no tempo.
        </p>
      </div>

      <div class="footer__col">
        <div class="footer__col-title">Loja</div>
        <a class="footer__item" href="#produtos">Churrasqueiras</a>
        <a class="footer__item" href="#produtos">Grelhas</a>
        <a class="footer__item" href="#produtos">Espetos</a>
        <a class="footer__item" href="#produtos">Acabamentos</a>
        <a class="footer__item" href="#produtos">Kits</a>
      </div>

      <div class="footer__col">
        <div class="footer__col-title">Atelier</div>
        <a class="footer__item" href="#sob-medida">Sob medida</a>
        <a class="footer__item" href="#processo">Processo</a>
        <a class="footer__item" href="#materiais">Materiais</a>
        <a class="footer__item" href="#">Garantia 5 anos</a>
      </div>

      <div class="footer__col">
        <div class="footer__col-title">Contato</div>
        <a class="footer__item" href="https://wa.me/5500000000000" target="_blank" rel="noopener">WhatsApp</a>
        <a class="footer__item" href="#" target="_blank" rel="noopener">Instagram</a>
        <a class="footer__item" href="mailto:contato@brasapremium.com.br">E-mail</a>
        <a class="footer__item" href="#">Agendar visita</a>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© 2026 Brasa Premium</span>
      <span>Todas as peças assinadas e numeradas</span>
      <span>Feito à mão</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--c-hair);
  padding: 56px 70px 0;
  background: var(--c-ink);
}

.footer__inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  align-items: start;
  max-width: 1600px;
  margin: 0 auto;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 0;
}

.footer__word {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--c-ivory);
  line-height: 1;
}

.footer__flame {
  margin: 0 16px 6px;
  flex-shrink: 0;
  width: 32px;
  height: 42px;
}

.footer__sub {
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
}

.footer__tagline {
  margin-top: 16px;
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 19px;
  color: var(--c-ivory-dim);
  line-height: 1.6;
  max-width: 320px;
}

.footer__col-title {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory);
  margin-bottom: 16px;
}

.footer__item {
  display: block;
  font-size: 17.5px;
  color: var(--c-ivory-dim);
  padding: 4px 0;
  text-decoration: none;
  transition: color 150ms;
}

.footer__item:hover { color: var(--c-ember); }

.footer__bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  padding: 24px 0;
  border-top: 1px solid var(--c-hair);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-ivory-mute);
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 900px) {
  .footer {
    padding: 40px 24px 0;
  }

  .footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer__brand {
    grid-column: 1 / -1;
  }

  .footer__bottom {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 500px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
