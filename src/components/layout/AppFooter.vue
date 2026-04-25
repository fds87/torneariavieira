<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__grid">

        <!-- Brand -->
        <div class="footer__brand">
          <img
            src="https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/LOGO-png-2.png"
            alt="Tornearia Vieira"
            class="footer__logo"
          />
          <p class="footer__tagline">
            Precisão em usinagem e fabricação de peças industriais sob desenho.<br/>
            São José dos Pinhais — PR
          </p>
        </div>

        <!-- Nav -->
        <div>
          <div class="label-tech" style="font-size:0.6rem; color:var(--c-muted); margin-bottom:16px">Navegação</div>
          <nav class="footer__nav">
            <a v-for="item in navItems" :key="item.href" :href="item.href" class="footer__link">{{ item.label }}</a>
          </nav>
        </div>

        <!-- Contact -->
        <div>
          <div class="label-tech" style="font-size:0.6rem; color:var(--c-muted); margin-bottom:16px">Contato</div>
          <div class="footer__contacts">
            <a :href="whatsapp" target="_blank" class="footer__contact">
              <span class="label-tech" style="font-size:0.6rem">TEL</span>
              <span>(41) 99980-2662</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=100095592520678" target="_blank" class="footer__contact">
              <span class="label-tech" style="font-size:0.6rem">FB</span>
              <span>Facebook</span>
            </a>
          </div>
        </div>

      </div>

      <!-- Bottom -->
      <div class="footer__bottom">
        <span class="label-tech" style="font-size:0.6rem; color:var(--c-muted)">
          © {{ year }} TORNEARIA VIEIRA — TODOS OS DIREITOS RESERVADOS
        </span>
        <span class="label-tech" style="font-size:0.6rem; color: #222">
          SÃO JOSÉ DOS PINHAIS · PR · BRASIL
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
const whatsapp = 'https://wa.me/5541999802662'
const navItems = [
  { label: 'Serviços',    href: '#services' },
  { label: 'Sobre',       href: '#about' },
  { label: 'Por que nós', href: '#whyus' },
  { label: 'Contato',     href: '#contact' },
]
</script>

<style scoped>
.footer {
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
}
.footer__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 24px 32px;
}
.footer__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 48px;
}
@media (min-width: 768px) {
  .footer__grid { grid-template-columns: 2fr 1fr 1fr; gap: 60px; }
}
.footer__logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin-bottom: 16px;
  display: block;
}
.footer__tagline {
  color: var(--c-muted);
  font-size: 0.8rem;
  line-height: 1.65;
  max-width: 280px;
}
.footer__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer__link {
  color: var(--c-muted);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s;
}
.footer__link:hover { color: var(--c-accent); }
.footer__contacts { display: flex; flex-direction: column; gap: 12px; }
.footer__contact {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--c-muted);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s;
}
.footer__contact:hover { color: var(--c-accent); }
.footer__contact .label-tech { color: var(--c-accent); }
.footer__bottom {
  padding-top: 24px;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
}
@media (min-width: 768px) {
  .footer__bottom { flex-direction: row; align-items: center; }
}
</style>
