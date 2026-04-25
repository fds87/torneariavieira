<template>
  <section id="hero" class="hero">
    <TechBg />

    <div class="hero__vline hero__vline--l"></div>
    <div class="hero__vline hero__vline--r"></div>

    <div class="hero__bg-text font-display">TV</div>

    <div class="hero__content">

      <div class="hero__location">
        <span class="hero__dot"></span>
        <span class="label-tech" style="color:var(--c-muted); font-size:0.65rem">
          São José dos Pinhais · PR · Brasil
        </span>
      </div>

      <h1 class="hero__title font-display">
        <span class="hero__t1">USINAGEM</span>
        <span class="hero__t2">DE PRECISÃO</span>
      </h1>

      <p class="hero__sub">
        Fabricação de peças industriais sob desenho.<br/>
        Do eixo ao conjunto mecânico — tolerâncias micrométricas, entrega precisa.
      </p>

      <div class="hero__specs">
        <div v-for="sp in heroSpecs" :key="sp.label" class="hero__spec">
          <span class="hero__spec-val font-display">{{ sp.val }}</span>
          <span class="label-tech hero__spec-lbl">{{ sp.label }}</span>
        </div>
      </div>

      <div class="hero__tags">
        <span v-for="(s,i) in specialties" :key="i" class="hero__tag label-tech">{{ s }}</span>
      </div>

      <div class="hero__cta">
        <a href="#services" @click.prevent="scrollTo('#services')" class="btn-gold">Ver Serviços</a>
        <a :href="whatsapp" target="_blank" class="btn-outline-gold">WhatsApp</a>
      </div>
    </div>

    <div class="hero__scroll">
      <span class="label-tech" style="font-size:0.55rem; color:var(--c-muted); writing-mode:vertical-rl; letter-spacing:0.25em">SCROLL</span>
      <div class="hero__scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
const whatsapp = 'https://wa.me/5541999802662'
const specialties = ['Eixos sob medida','Conjuntos mecânicos','Nac. de importados','Cabeçotes angulares','Molas usinadas','Bicos injetora']
const heroSpecs = [
  { val: 'CNC',  label: 'Usinagem' },
  { val: 'µm',   label: 'Tolerância' },
  { val: '100%', label: 'Controle' },
  { val: '24h',  label: 'Orçamento' },
]
function scrollTo(hash) { document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }) }
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: var(--c-bg);
}

.hero__vline {
  position: absolute; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--c-border), transparent);
  pointer-events: none;
  z-index: 1;
}
.hero__vline--l { left: 18%; }
.hero__vline--r { right: 18%; }

.hero__bg-text {
  position: absolute;
  right: -1%;
  bottom: -8%;
  font-size: 38vw;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--c-border);
  pointer-events: none;
  user-select: none;
  opacity: 0.6;
  z-index: 0;
}
:global(:root.dark) .hero__bg-text { opacity: 0.12; color: var(--c-text); }

.hero__content {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 80px;
  width: 100%;
}

.hero__location { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
.hero__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--c-accent);
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

.hero__title { line-height: 0.88; margin-bottom: 28px; }
.hero__t1 {
  display: block;
  font-size: clamp(3.5rem, 12vw, 11rem);
  color: var(--c-text);
  letter-spacing: 0.02em;
}
.hero__t2 {
  display: block;
  font-size: clamp(3.5rem, 12vw, 11rem);
  color: var(--c-accent);
  letter-spacing: 0.02em;
}

.hero__sub {
  max-width: 500px;
  color: var(--c-muted);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.7;
  margin-bottom: 36px;
}

.hero__specs {
  display: flex;
  gap: 0;
  border: 1px solid var(--c-border);
  width: fit-content;
  margin-bottom: 36px;
}
.hero__spec {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  border-right: 1px solid var(--c-border);
  gap: 4px;
}
.hero__spec:last-child { border-right: none; }
.hero__spec-val {
  font-size: 1.6rem;
  color: var(--c-accent);
  line-height: 1;
  letter-spacing: 0.04em;
}
.hero__spec-lbl { font-size: 0.55rem; color: var(--c-muted); }

.hero__tags {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 40px;
}
.hero__tag {
  font-size: 0.62rem;
  color: var(--c-muted);
  padding: 5px 12px;
  border: 1px solid var(--c-border);
  transition: border-color 0.2s, color 0.2s;
}
.hero__tag:hover { border-color: var(--c-accent); color: var(--c-accent); }

.hero__cta { display: flex; flex-wrap: wrap; gap: 14px; }

.hero__scroll {
  position: absolute;
  right: 32px; bottom: 40px;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  z-index: 2;
}
.hero__scroll-line {
  width: 1px; height: 56px;
  background: linear-gradient(to bottom, var(--c-accent), transparent);
  animation: blink 2s infinite;
}
</style>
