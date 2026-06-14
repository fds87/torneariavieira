<template>
  <section id="services" class="section section--alt">
    <div class="shell">
      <div class="section__head svc-head" v-reveal>
        <div>
          <span class="eyebrow"><b>//</b> 02 — Nossos Serviços <span class="ln"></span></span>
          <h2 class="section__title">FABRICAÇÃO<br /><span class="steel">SOB MEDIDA</span></h2>
        </div>
        <p>Cada peça produzida segue especificação técnica rigorosa. Matérias-primas certificadas, controle dimensional em todas as etapas.</p>
      </div>

      <div class="svc-list">
        <article
          v-for="(s, i) in services"
          :key="s.id"
          class="svc"
          :class="{ 'svc--rev': i % 2 === 1 }"
          v-reveal
        >
          <div class="svc__idx">{{ s.id }}</div>
          <div class="svc__media">
            <DimOverlay />
            <div class="svc__scan"></div>
            <span class="svc__badge">{{ s.material }}</span>
            <img
              v-if="s.image && !failed.has(s.id)"
              :src="s.image"
              :alt="s.title"
              loading="lazy"
              @error="failed.add(s.id)"
            />
            <div v-else class="svc__ph" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
                <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
                <line x1="12" y1="1.5" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22.5" y2="12" />
              </svg>
            </div>
            <span class="svc__bignum font-display">{{ s.id }}</span>
          </div>
          <div class="svc__body">
            <div class="svc__meta"><span class="ln"></span><span>{{ s.id }} / 03</span></div>
            <h3 class="svc__title font-display">{{ s.title }}</h3>
            <p class="svc__desc">{{ s.description }}</p>
            <div class="svc__tags"><span v-for="t in s.tags" :key="t" class="tag">{{ t }}</span></div>
            <a :href="quoteLink(s.title)" target="_blank" rel="noopener" class="svc__link">Solicitar este serviço <span class="arrow">→</span></a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { services } from '~/data/content.js'

const failed = reactive(new Set())

const quoteLink = (title) => `https://wa.me/5541998035540?text=${encodeURIComponent('Olá! Tenho interesse em: ' + title)}`
</script>

<style scoped>
.svc-head { display: flex; flex-direction: column; gap: 22px; }
@media (min-width: 1024px){ .svc-head { flex-direction: row; align-items: flex-end; justify-content: space-between; } }
.svc-head p { max-width: 380px; color: var(--c-muted); }

.svc-list { border-top: 1px solid var(--c-border); }
.svc { position: relative; display: grid; grid-template-columns: 1fr; border-bottom: 1px solid var(--c-border); transition: background 0.4s; }
.svc:hover { background: var(--c-surface2); }
@media (min-width: 920px){
  .svc { grid-template-columns: 80px 1.1fr 1.4fr; min-height: 320px; }
  .svc--rev .svc__media { order: 3; }
  .svc--rev .svc__body { order: 2; }
  .svc--rev .svc__idx { order: 1; }
}
.svc__idx { display: flex; align-items: flex-start; justify-content: center; padding-top: 40px; font-family: var(--font-display); font-size: 1.5rem; color: var(--c-faint); border-right: 1px solid var(--c-border); }
@media (max-width: 919px){ .svc__idx { display: none; } }
.svc__media { position: relative; overflow: hidden; background: var(--c-bg2); min-height: 280px; border-right: 1px solid var(--c-border); }
.svc--rev .svc__media { border-right: none; border-left: 1px solid var(--c-border); }
.svc__media img { width: 100%; height: 100%; object-fit: contain; padding: 38px; transition: transform 0.7s var(--ease-out), filter 0.5s; filter: saturate(0.9); }
.svc:hover .svc__media img { transform: scale(1.07) rotate(-1deg); filter: saturate(1.1); }
.svc__ph { position: absolute; inset: 0; display: grid; place-items: center; color: var(--c-faint); transition: transform 0.7s var(--ease-out); }
.svc:hover .svc__ph { transform: scale(1.07); }
.svc__scan { position: absolute; left: 0; right: 0; height: 2px; top: -2px; background: linear-gradient(90deg, transparent, var(--c-accent), transparent); opacity: 0; }
.svc:hover .svc__scan { opacity: 0.8; animation: scan 2.4s var(--ease) infinite; }
@keyframes scan { 0%{ top: 0%;} 100%{ top: 100%;} }
.svc__badge { position: absolute; top: 18px; left: 18px; z-index: 4; background: var(--c-accent); color: #fff; font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase; padding: 5px 11px; }
:global(:root.dark) .svc__badge { color: #0B0B0C; }
.svc__bignum { position: absolute; right: 14px; bottom: -10px; font-size: 7rem; color: var(--c-accent); opacity: 0.07; z-index: 1; pointer-events: none; }

.svc__body { padding: 42px 40px; display: flex; flex-direction: column; justify-content: center; }
@media (max-width: 640px){ .svc__body { padding: 30px 22px 34px; } }
.svc__meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.svc__meta .ln { width: 38px; height: 1px; background: var(--c-accent); }
.svc__meta span { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; color: var(--c-muted); }
.svc__title { font-size: clamp(1.7rem, 3.4vw, 2.7rem); line-height: 0.98; letter-spacing: 0.03em; margin-bottom: 14px; transition: color 0.3s; }
.svc:hover .svc__title { color: var(--c-accent); }
.svc__desc { color: var(--c-muted); margin-bottom: 22px; max-width: 460px; }
.svc__tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }
.svc__link { display: inline-flex; align-items: center; gap: 10px; align-self: flex-start; font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-accent); }
@media (max-width: 760px){ .svc__media { min-height: 240px; } .svc__title { font-size: clamp(1.7rem, 7vw, 2.3rem); } }
</style>
