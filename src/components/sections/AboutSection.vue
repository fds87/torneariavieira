<template>
  <section id="about" class="about">
    <TechBg />

    <div class="about__inner">
      <div class="about__grid">

        <!-- Text -->
        <div class="about__text">
          <div class="about__label">
            <span class="label-tech" style="color:var(--c-accent)">//</span>
            <span class="label-tech" style="color:var(--c-muted); font-size:0.65rem">02 — Sobre</span>
            <div class="about__label-line"></div>
          </div>

          <h2 class="about__title font-display">
            SOLUÇÕES DE<br/>
            <span style="color:var(--c-accent)">USINAGEM</span><br/>
            COM PRECISÃO
          </h2>

          <div class="about__body">
            <p>A Tornearia Vieira atua na fabricação de peças industriais sob desenho, com foco em usinagem de alta precisão, recuperação de componentes e fabricação de ferramentas especiais.</p>
            <p>Localizada em São José dos Pinhais, PR, atendemos indústrias de diferentes segmentos que exigem tolerâncias rigorosas e confiabilidade em cada componente produzido.</p>
            <p>Da análise do desenho técnico à entrega final, cada etapa é monitorada para garantir que a peça atenda exatamente ao que foi especificado.</p>
          </div>

          <div class="about__specs">
            <div v-for="(sp,i) in specs" :key="i" class="about__spec">
              <span class="about__spec-val font-display">{{ sp.value }}</span>
              <span class="label-tech about__spec-lbl">{{ sp.label }}</span>
            </div>
          </div>
        </div>

        <!-- Image -->
        <div class="about__img-col">
          <!-- Technical overlay -->
          <svg class="about__svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="6 4" opacity="0.3"/>
            <circle cx="50%" cy="50%" r="25%" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
            <!-- corner dims -->
            <line x1="4%" y1="4%" x2="4%" y2="30%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
            <line x1="4%" y1="4%" x2="30%" y2="4%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
            <line x1="96%" y1="4%" x2="96%" y2="30%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
            <line x1="70%" y1="4%" x2="96%" y2="4%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
            <line x1="4%" y1="96%" x2="4%" y2="70%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
            <line x1="4%" y1="96%" x2="30%" y2="96%" stroke="currentColor" stroke-width="0.7" opacity="0.25"/>
          </svg>

          <div class="about__img-frame">
            <img
              src="https://torneariavieiraoficial.com.br/wp-content/uploads/2025/11/ChatGPT-Image-9-de-nov.-de-2025-18_57_22-1024x683.png"
              alt="Tornearia Vieira — oficina"
              class="about__img"
            />
            <div class="about__img-tint"></div>
          </div>

          <div class="about__deco1"></div>
          <div class="about__deco2"></div>
          <div class="about__badge label-tech">SÃO JOSÉ DOS PINHAIS · PR</div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import TechBg from '../ui/TechBg.vue'
const specs = [
  { value: 'CNC',  label: 'Usinagem controlada' },
  { value: 'µm',   label: 'Tolerâncias micrométricas' },
  { value: '100%', label: 'Controle dimensional' },
  { value: '24h',  label: 'Resposta orçamento' },
]
</script>

<style scoped>
.about {
  position: relative;
  background: var(--c-bg);
  padding: 96px 0;
  overflow: hidden;
}
.about__inner {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
.about__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px; align-items: center;
}
@media (min-width:1024px) { .about__grid { grid-template-columns: 1fr 1fr; gap: 88px; } }

.about__label { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
.about__label-line { flex:1; height:1px; background:var(--c-border); }

.about__title {
  font-size: clamp(2.2rem, 5vw, 4.2rem);
  line-height: 0.92;
  color: var(--c-text);
  letter-spacing: 0.02em;
  margin-bottom: 28px;
}
.about__body {
  display: flex; flex-direction: column; gap: 14px;
  max-width: 440px;
  color: var(--c-muted);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.75;
  margin-bottom: 40px;
}
.about__specs {
  display: grid; grid-template-columns: repeat(2,1fr);
  border: 1px solid var(--c-border);
}
.about__spec {
  padding: 16px 20px;
  border-right: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
}
.about__spec:nth-child(2n)  { border-right: none; }
.about__spec:nth-child(3), .about__spec:nth-child(4) { border-bottom: none; }
.about__spec-val {
  display: block;
  font-size: 1.9rem;
  color: var(--c-accent);
  line-height: 1.1;
  margin-bottom: 4px;
}
.about__spec-lbl { font-size: 0.58rem; color: var(--c-muted); }

/* Image column */
.about__img-col { position: relative; }

.about__svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  color: var(--c-accent);
  pointer-events: none;
  z-index: 2;
}

.about__img-frame {
  position: relative;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%);
}
.about__img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}
.about__img-col:hover .about__img { transform: scale(1.03); }
.about__img-tint {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(245,245,243,0.3) 0%, transparent 60%);
}
:global(:root.dark) .about__img-tint {
  background: linear-gradient(135deg, rgba(10,10,10,0.4) 0%, transparent 60%);
}

.about__deco1 {
  position: absolute; bottom:-14px; right:-14px;
  width: 72px; height: 72px;
  border: 1px solid var(--c-accent);
  opacity: 0.25; pointer-events: none;
}
.about__deco2 {
  position: absolute; top:-10px; left:-10px;
  width: 48px; height: 48px;
  border: 1px solid var(--c-steel);
  opacity: 0.25; pointer-events: none;
}
.about__badge {
  display: none;
  position: absolute; top: 24px; left: -4px;
  background: var(--c-accent);
  color: #fff;
  font-size: 0.58rem;
  padding: 8px 14px;
  line-height: 1.5;
  z-index: 4;
}
:global(:root.dark) .about__badge { color: #0A0A0A; }
@media (min-width:1024px) { .about__badge { display: block; } }
</style>
