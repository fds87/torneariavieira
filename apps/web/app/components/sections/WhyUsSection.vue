<template>
  <section id="whyus" class="section section--alt">
    <div class="shell">
      <div class="section__head" v-reveal>
        <span class="eyebrow"><b>//</b> 03 — Por que nós <span class="ln"></span></span>
        <h2 class="section__title">EXCELÊNCIA<br /><span class="steel">EM CADA PEÇA</span></h2>
      </div>

      <div class="pillars">
        <div v-for="(p, i) in pillars" :key="i" class="pillar" v-reveal :data-d="i">
          <div class="pillar__icon">
            <svg v-if="p.icon === 'precision'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="3" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="21" /><line x1="3" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="21" y2="12" /></svg>
            <svg v-else-if="p.icon === 'craft'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14.5 4L20 9.5L9.5 20H4V14.5L14.5 4Z" stroke-linejoin="round" /><line x1="10" y1="14" x2="14" y2="10" /></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="16" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /><path d="M12 13V17H15" stroke-linecap="round" /></svg>
          </div>
          <div class="pillar__n">0{{ i + 1 }}</div>
          <h3 class="pillar__t font-display">{{ p.title }}</h3>
          <p class="pillar__d">{{ p.description }}</p>
          <div class="pillar__bar"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { pillars } from '~/data/content.js'
</script>

<style scoped>
.pillars { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--c-border); margin-top: 14px; }
@media (min-width: 768px){ .pillars { grid-template-columns: repeat(3,1fr); } }
.pillar { background: var(--c-surface); padding: 40px 34px 44px; transition: background 0.35s; }
.pillar:hover { background: var(--c-surface2); }
.pillar__icon { width: 54px; height: 54px; border: 1px solid var(--c-border-2); display: grid; place-items: center; margin-bottom: 28px; color: var(--c-accent); transition: border-color 0.3s, transform 0.4s var(--spring); }
.pillar:hover .pillar__icon { border-color: var(--c-accent); transform: translateY(-4px); }
.pillar__n { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--c-faint); margin-bottom: 10px; }
.pillar__t { font-size: 1.55rem; letter-spacing: 0.04em; margin-bottom: 12px; transition: color 0.3s; }
.pillar:hover .pillar__t { color: var(--c-accent); }
.pillar__d { color: var(--c-muted); font-size: 0.97rem; }
.pillar__bar { width: 0; height: 2px; background: var(--c-accent); margin-top: 24px; transition: width 0.6s var(--ease-out); }
.pillar:hover .pillar__bar { width: 54px; }
@media (max-width: 760px){ .pillar { padding: 32px 26px 36px; } }
</style>
