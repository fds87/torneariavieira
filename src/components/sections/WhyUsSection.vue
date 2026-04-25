<template>
  <section id="whyus" class="whyus">
    <TechBg />
    <div class="whyus__inner">

      <div class="section-head__label">
        <span class="label-tech" style="color: var(--c-accent)">//</span>
        <span class="label-tech" style="color: var(--c-muted)">03 — Por que nós</span>
        <div class="section-head__line"></div>
      </div>

      <h2 class="whyus__title font-display">
        EXCELÊNCIA<br/>
        <span style="color: var(--c-steel)">EM CADA PEÇA</span>
      </h2>

      <div class="whyus__grid">
        <div v-for="(p, i) in pillars" :key="i" class="pillar">
          <!-- Icon box -->
          <div class="pillar__icon-box">
            <!-- Precision -->
            <svg v-if="p.icon === 'precision'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#C8A96E" stroke-width="1"/>
              <circle cx="12" cy="12" r="3" stroke="#C8A96E" stroke-width="1"/>
              <line x1="12" y1="3" x2="12" y2="6" stroke="#C8A96E" stroke-width="1"/>
              <line x1="12" y1="18" x2="12" y2="21" stroke="#C8A96E" stroke-width="1"/>
              <line x1="3" y1="12" x2="6" y2="12" stroke="#C8A96E" stroke-width="1"/>
              <line x1="18" y1="12" x2="21" y2="12" stroke="#C8A96E" stroke-width="1"/>
            </svg>
            <!-- Craft -->
            <svg v-if="p.icon === 'craft'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M14.5 4L20 9.5L9.5 20H4V14.5L14.5 4Z" stroke="#C8A96E" stroke-width="1" stroke-linejoin="round"/>
              <line x1="10" y1="14" x2="14" y2="10" stroke="#C8A96E" stroke-width="1"/>
            </svg>
            <!-- Deadline -->
            <svg v-if="p.icon === 'deadline'" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" stroke="#C8A96E" stroke-width="1"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="#C8A96E" stroke-width="1"/>
              <line x1="8" y1="3" x2="8" y2="7" stroke="#C8A96E" stroke-width="1"/>
              <line x1="16" y1="3" x2="16" y2="7" stroke="#C8A96E" stroke-width="1"/>
              <path d="M12 13V17H15" stroke="#C8A96E" stroke-width="1" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="pillar__index label-tech" style="font-size:0.6rem; color: var(--c-muted); margin-bottom:8px">0{{ i + 1 }}</div>
          <h3 class="pillar__title font-display">{{ p.title }}</h3>
          <p class="pillar__desc">{{ p.description }}</p>
          <div class="pillar__bar"></div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { pillars } from '../../data/content.js'
import TechBg from '../ui/TechBg.vue'
</script>

<style scoped>
.whyus {
  position: relative;
  background: var(--c-surface);
  padding: 96px 0;
  overflow: hidden;
}
.whyus__inner {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
.section-head__label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.section-head__line {
  flex: 1;
  height: 1px;
  background: rgba(200,169,110,0.15);
}
.whyus__title {
  font-size: clamp(2.2rem, 5vw, 4.5rem);
  line-height: 0.92;
  letter-spacing: 0.02em;
  color: var(--c-text);
  margin-bottom: 56px;
}
.whyus__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: var(--c-border);
}
@media (min-width: 768px) {
  .whyus__grid { grid-template-columns: repeat(3, 1fr); }
}
.pillar {
  background: var(--c-surface);
  padding: 36px 32px 40px;
  transition: background 0.3s;
}
.pillar:hover { background: var(--c-surface2); }

.pillar__icon-box {
  width: 48px; height: 48px;
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  transition: border-color 0.3s;
}
.pillar:hover .pillar__icon-box { border-color: rgba(200,169,110,0.4); }

.pillar__title {
  font-size: 1.5rem;
  letter-spacing: 0.04em;
  color: var(--c-text);
  margin-bottom: 12px;
  transition: color 0.3s;
  line-height: 1.1;
}
.pillar:hover .pillar__title { color: var(--c-accent); }
.pillar__desc {
  color: var(--c-muted);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.7;
  margin-bottom: 24px;
}
.pillar__bar {
  width: 0;
  height: 1px;
  background: var(--c-accent);
  transition: width 0.5s;
}
.pillar:hover .pillar__bar { width: 48px; }
</style>
