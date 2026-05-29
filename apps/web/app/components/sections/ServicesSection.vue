<template>
  <section id="services" class="services">
    <TechBg />

    <div class="services__inner">

      <div class="svc-head">
        <div class="svc-head__label">
          <span class="label-tech" style="color:var(--c-accent)">//</span>
          <span class="label-tech" style="color:var(--c-muted); font-size:0.65rem">01 — Nossos Serviços</span>
          <div class="svc-head__line"></div>
        </div>
        <div class="svc-head__row">
          <h2 class="svc-title font-display">
            FABRICAÇÃO<br/>
            <span style="color:var(--c-steel)">SOB MEDIDA</span>
          </h2>
          <p class="svc-desc">
            Cada peça produzida segue especificação técnica rigorosa.<br/>
            Matérias-primas certificadas, controle dimensional em todas as etapas.
          </p>
        </div>
      </div>

      <div class="svc-list">
        <div
          v-for="(s, i) in services"
          :key="s.id"
          class="svc-item"
          :class="{ 'svc-item--rev': i % 2 === 1 }"
        >
          <div class="svc-img-panel">
            <svg class="svc-img-svg" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="24" x2="10" y2="95%" stroke="currentColor" stroke-width="0.7" stroke-dasharray="4 3"/>
              <line x1="5"  y1="24" x2="15" y2="24" stroke="currentColor" stroke-width="0.8"/>
              <line x1="5"  y1="95%" x2="15" y2="95%" stroke="currentColor" stroke-width="0.8"/>
              <line x1="10%"  y1="92%" x2="92%"  y2="92%" stroke="currentColor" stroke-width="0.7" stroke-dasharray="4 3"/>
              <line x1="10%"  y1="88%" x2="10%"  y2="96%" stroke="currentColor" stroke-width="0.8"/>
              <line x1="92%"  y1="88%" x2="92%"  y2="96%" stroke="currentColor" stroke-width="0.8"/>
              <circle cx="88%" cy="12%" r="20" fill="none" stroke="currentColor" stroke-width="0.7"/>
              <circle cx="88%" cy="12%" r="5"  fill="none" stroke="currentColor" stroke-width="0.7"/>
              <line x1="76%" y1="12%" x2="100%" y2="12%" stroke="currentColor" stroke-width="0.5"/>
              <line x1="88%" y1="0%"  x2="88%"  y2="26%" stroke="currentColor" stroke-width="0.5"/>
            </svg>

            <img :src="s.image" :alt="s.title" class="svc-img" />
            <div class="svc-img-tint"></div>
            <div class="svc-img-num font-display">{{ s.id }}</div>
            <div class="svc-img-badge label-tech">{{ s.material }}</div>
          </div>

          <div class="svc-text-panel">
            <div class="svc-text-panel__inner">
              <div class="svc-text-meta">
                <span class="label-tech" style="font-size:0.65rem">{{ s.id }}</span>
                <div class="svc-text-meta__line"></div>
              </div>
              <h3 class="svc-item-title font-display">{{ s.title }}</h3>
              <p class="svc-item-desc">{{ s.description }}</p>

              <div class="svc-tags">
                <span v-for="tag in s.tags" :key="tag" class="svc-tag label-tech">{{ tag }}</span>
              </div>

              <a :href="whatsapp" target="_blank" class="svc-cta btn-outline-gold">
                Solicitar este serviço
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { services } from '~/data/content.js'
const whatsapp = 'https://wa.me/5541999802662'
</script>

<style scoped>
.services {
  position: relative;
  background: var(--c-surface);
  padding: 96px 0 0;
  overflow: hidden;
}
.services__inner {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
.svc-head { margin-bottom: 64px; }
.svc-head__label { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
.svc-head__line { flex:1; height:1px; background:var(--c-border); }
.svc-head__row { display: flex; flex-direction: column; gap: 20px; }
@media (min-width:1024px) {
  .svc-head__row { flex-direction:row; align-items:flex-end; justify-content:space-between; }
}
.svc-title {
  font-size: clamp(2.4rem, 5.5vw, 5rem);
  line-height: 0.9;
  color: var(--c-text);
  letter-spacing: 0.02em;
}
.svc-desc {
  max-width: 380px;
  color: var(--c-muted);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.7;
}
.svc-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--c-border);
}
.svc-item {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 520px;
  border-bottom: 1px solid var(--c-border);
}
@media (min-width: 900px) {
  .svc-item       { grid-template-columns: 3fr 2fr; }
  .svc-item--rev  { grid-template-columns: 2fr 3fr; }
  .svc-item--rev .svc-img-panel  { order: 2; }
  .svc-item--rev .svc-text-panel { order: 1; }
}
.svc-img-panel {
  position: relative;
  overflow: hidden;
  background: var(--c-bg);
  min-height: 380px;
}
@media (min-width: 900px) { .svc-img-panel { min-height: unset; } }
.svc-img-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  color: var(--c-accent);
  opacity: 0.35;
  pointer-events: none;
  z-index: 2;
}
:global(:root.dark) .svc-img-svg { opacity: 0.25; }
.svc-img {
  width: 100%; height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  padding: 40px;
  transition: transform 0.6s ease;
  position: relative; z-index: 1;
}
.svc-item:hover .svc-img { transform: scale(1.04); }
.svc-img-tint {
  position: absolute; inset: 0; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 40%, var(--c-surface) 100%);
  pointer-events: none;
}
.svc-img-num {
  position: absolute;
  bottom: 12px; left: 20px;
  font-size: 8rem;
  line-height: 1;
  color: var(--c-accent);
  opacity: 0.08;
  z-index: 3;
  pointer-events: none;
}
.svc-img-badge {
  position: absolute;
  top: 20px; left: 20px;
  background: var(--c-accent);
  color: #fff;
  font-size: 0.58rem;
  padding: 5px 12px;
  z-index: 4;
  letter-spacing: 0.15em;
}
:global(:root.dark) .svc-img-badge { color: #0A0A0A; }
.svc-text-panel {
  display: flex;
  align-items: center;
  border-left: 1px solid var(--c-border);
  background: var(--c-surface);
}
.svc-item--rev .svc-text-panel { border-left: none; border-right: 1px solid var(--c-border); }
.svc-text-panel__inner { padding: 48px 40px; }
.svc-text-meta {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.svc-text-meta__line { width: 40px; height: 1px; background: var(--c-accent); }
.svc-item-title {
  font-size: clamp(1.8rem, 3.5vw, 3rem);
  line-height: 0.95;
  color: var(--c-text);
  letter-spacing: 0.03em;
  margin-bottom: 16px;
  transition: color 0.3s;
}
.svc-item:hover .svc-item-title { color: var(--c-accent); }
.svc-item-desc {
  color: var(--c-muted);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.7;
  margin-bottom: 24px;
}
.svc-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:32px; }
.svc-tag {
  font-size: 0.58rem;
  color: var(--c-muted);
  padding: 4px 10px;
  border: 1px solid var(--c-border);
  transition: all 0.2s;
}
.svc-item:hover .svc-tag { border-color: rgba(200,169,110,0.4); }
.svc-cta { display: inline-block; font-size: 0.65rem; }
</style>
