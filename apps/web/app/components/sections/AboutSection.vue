<template>
  <section id="about" class="section">
    <div class="grid-layer" style="opacity:0.6"></div>
    <div class="shell">
      <div class="about__grid">
        <div v-reveal>
          <span class="eyebrow"><b>//</b> 03 — Sobre <span class="ln"></span></span>
          <h2 class="section__title" style="margin-bottom:8px">SOLUÇÕES DE<br /><span class="gold">USINAGEM</span><br />COM PRECISÃO</h2>
          <div class="about__body">
            <p>A Tornearia Vieira atua na fabricação de peças industriais sob desenho, com foco em usinagem de alta precisão, recuperação de componentes e fabricação de ferramentas especiais.</p>
            <p>Localizada em São José dos Pinhais, PR, atendemos indústrias de diferentes segmentos que exigem tolerâncias rigorosas e confiabilidade em cada componente produzido.</p>
            <p>Da análise do desenho técnico à entrega final, cada etapa é monitorada para garantir que a peça atenda exatamente ao que foi especificado.</p>
          </div>
          <div class="about__specs">
            <div class="about__spec"><b class="font-display">CNC</b><small>Usinagem controlada</small></div>
            <div class="about__spec"><b class="font-display">µm</b><small>Tolerâncias micrométricas</small></div>
            <div class="about__spec"><b class="font-display"><span v-count="100" data-suffix="%">0</span></b><small>Controle dimensional</small></div>
            <div class="about__spec"><b class="font-display"><span v-count="24" data-suffix="h">0</span></b><small>Resposta orçamento</small></div>
          </div>
        </div>

        <div class="about__media" v-reveal data-d="1">
          <svg class="about__ring" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
            <g class="spin">
              <circle cx="50" cy="50" r="48" stroke-width="0.3" stroke-dasharray="2 3" opacity="0.5" />
              <circle cx="50" cy="50" r="40" stroke-width="0.2" opacity="0.4" />
            </g>
          </svg>
          <div class="about__chip mono">SÃO JOSÉ DOS PINHAIS · PR</div>
          <div class="about__frame">
            <div class="about__ph" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.7">
                <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
                <line x1="12" y1="1.5" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22.5" y2="12" />
              </svg>
              <span class="mono">SÃO JOSÉ DOS PINHAIS · PR</span>
            </div>
          </div>
          <div class="about__deco"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.about__grid { display: grid; grid-template-columns: 1fr; gap: 60px; align-items: center; }
@media (min-width: 1024px){ .about__grid { grid-template-columns: 1.05fr 1fr; gap: 80px; } }
.about__body { display: flex; flex-direction: column; gap: 16px; max-width: 480px; color: var(--c-muted); margin: 26px 0 38px; }
.about__specs { display: grid; grid-template-columns: repeat(2,1fr); border: 1px solid var(--c-border); }
.about__spec { padding: 20px 22px; border-right: 1px solid var(--c-border); border-bottom: 1px solid var(--c-border); }
.about__spec:nth-child(2n){ border-right: none; }
.about__spec:nth-child(3),.about__spec:nth-child(4){ border-bottom: none; }
.about__spec b { display: block; font-size: 2rem; color: var(--c-accent); line-height: 1; }
.about__spec small { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.13em; text-transform: uppercase; color: var(--c-muted); display: block; margin-top: 8px; }

.about__media { position: relative; }
.about__frame { position: relative; overflow: hidden; clip-path: polygon(0 0, 100% 0, 100% 86%, 86% 100%, 0 100%); border: 1px solid var(--c-border); }
.about__frame img { width: 100%; height: 520px; object-fit: cover; transition: transform 0.9s var(--ease-out); }
.about__media:hover .about__frame img { transform: scale(1.05); }
.about__ph { width: 100%; height: 520px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; background: var(--c-bg2); color: var(--c-faint); }
.about__ph .mono { font-size: 0.6rem; letter-spacing: 0.16em; color: var(--c-muted); }
.about__ring { position: absolute; inset: -4%; color: var(--c-accent); pointer-events: none; }
.about__ring .spin { transform-origin: center; animation: spin 80s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.about__chip { position: absolute; top: 24px; left: -6px; z-index: 4; background: var(--c-accent); color: #fff; font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase; padding: 9px 14px; }
:global(:root.dark) .about__chip { color: #0B0B0C; }
.about__deco { position: absolute; bottom: -14px; right: -14px; width: 76px; height: 76px; border: 1px solid var(--c-accent); opacity: 0.3; }

@media (max-width: 760px){
  .about__grid { gap: 44px; }
  .about__frame img, .about__ph { height: 380px; }
  .about__chip { left: 0; font-size: 0.5rem; }
}
</style>
