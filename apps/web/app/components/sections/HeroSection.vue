<template>
  <section id="hero" class="hero">
    <div ref="grid" class="grid-layer hero__grid"></div>
    <div class="hero__glow"></div>
    <div class="hero__bigtv font-display">TV</div>

    <svg ref="schematic" class="hero__schematic" viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">
      <g class="spin">
        <circle cx="200" cy="200" r="150" stroke-width="0.6" stroke-dasharray="3 5"/>
        <circle cx="200" cy="200" r="120" stroke-width="0.5"/>
        <g stroke-width="0.8">
          <line x1="200" y1="20" x2="200" y2="50"/><line x1="200" y1="350" x2="200" y2="380"/>
          <line x1="20" y1="200" x2="50" y2="200"/><line x1="350" y1="200" x2="380" y2="200"/>
          <line x1="73" y1="73" x2="94" y2="94"/><line x1="306" y1="306" x2="327" y2="327"/>
          <line x1="327" y1="73" x2="306" y2="94"/><line x1="94" y1="306" x2="73" y2="327"/>
        </g>
      </g>
      <g class="spin-r">
        <circle cx="200" cy="200" r="78" stroke-width="0.8"/>
        <circle cx="200" cy="200" r="40" stroke-width="0.6" stroke-dasharray="2 4"/>
      </g>
      <circle cx="200" cy="200" r="12" stroke-width="1"/>
      <line x1="0" y1="200" x2="400" y2="200" stroke-width="0.4" opacity="0.5"/>
      <line x1="200" y1="0" x2="200" y2="400" stroke-width="0.4" opacity="0.5"/>
      <g stroke-width="0.6" opacity="0.7">
        <line x1="50" y1="370" x2="350" y2="370"/>
        <line x1="50" y1="364" x2="50" y2="376"/><line x1="350" y1="364" x2="350" y2="376"/>
      </g>
    </svg>

    <div class="hero__in shell">
      <div class="hero__loc">
        <span class="hero__dot"></span>
        <span class="mono hero__loc-txt">São José dos Pinhais · PR · Brasil</span>
      </div>

      <h1 class="hero__title">
        <span class="ln"><span>USINAGEM</span></span>
        <span class="ln"><span>DE PRECISÃO</span></span>
      </h1>

      <p class="hero__sub">Fabricação de peças industriais sob desenho. Do eixo ao conjunto mecânico — tolerâncias micrométricas, entrega precisa.</p>

      <div class="hero__row">
        <a href="#services" class="btn btn--gold" data-magnetic @click.prevent="scrollTo('#services')">Ver Serviços <span class="arrow">→</span></a>
        <a :href="whatsapp" target="_blank" rel="noopener" class="btn btn--ghost" data-magnetic>WhatsApp</a>
      </div>

      <div class="hero__stats">
        <div class="stat"><div class="stat__v"><span v-count="20" data-suffix="+">0</span></div><div class="stat__l">Anos de ofício</div></div>
        <div class="stat"><div class="stat__v">µm</div><div class="stat__l">Tolerância</div></div>
        <div class="stat"><div class="stat__v"><span v-count="100" data-suffix="%">0</span></div><div class="stat__l">Controle dim.</div></div>
        <div class="stat"><div class="stat__v"><span v-count="24" data-suffix="h">0</span></div><div class="stat__l">Orçamento</div></div>
      </div>
    </div>

    <div class="hero__scroll"><span>SCROLL</span><i></i></div>
  </section>

  <!-- Ticker -->
  <div class="ticker">
    <div class="ticker__track">
      <div v-for="n in 2" :key="n" class="ticker__item" :aria-hidden="n === 2 ? 'true' : undefined">
        <template v-for="(s, i) in specialties" :key="i">
          <span>{{ s }}</span><span class="ticker__star">✦</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const whatsapp = 'https://wa.me/5541999802662'
const specialties = ['Eixos sob medida', 'Conjuntos mecânicos', 'Nacionalização de importados', 'Cabeçotes angulares', 'Molas usinadas', 'Bicos de injetora']

const grid = ref(null)
const schematic = ref(null)
let raf, tx = 0, ty = 0, rx = 0, ry = 0

function onMove(e) {
  tx = (e.clientX / window.innerWidth - 0.5) * 26
  ty = (e.clientY / window.innerHeight - 0.5) * 26
}
function loop() {
  rx += (tx - rx) * 0.06; ry += (ty - ry) * 0.06
  if (grid.value) grid.value.style.transform = `translate(${rx}px, ${ry}px)`
  if (schematic.value) schematic.value.style.transform = `translate(${-rx * 1.4}px, calc(-50% + ${-ry * 1.4}px))`
  raf = requestAnimationFrame(loop)
}
function scrollTo(hash) {
  const el = document.querySelector(hash)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' })
}
onMounted(() => { window.addEventListener('mousemove', onMove); loop() })
onUnmounted(() => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) })
</script>

<style scoped>
.hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 130px 0 60px; overflow: hidden; background: var(--c-bg); }
.hero__glow { position: absolute; z-index: 0; pointer-events: none; width: 70vw; height: 70vw; max-width: 900px; max-height: 900px; right: -10%; top: -20%; background: radial-gradient(circle, color-mix(in srgb, var(--c-accent) 16%, transparent), transparent 62%); filter: blur(20px); }
.hero__schematic { position: absolute; z-index: 0; pointer-events: none; right: -6%; top: 50%; transform: translateY(-50%); width: min(58vw, 760px); aspect-ratio: 1; color: var(--c-accent); opacity: 0.5; }
.hero__schematic .spin { transform-origin: center; animation: spin 60s linear infinite; }
.hero__schematic .spin-r { transform-origin: center; animation: spin 90s linear infinite reverse; }
@keyframes spin { to { transform: rotate(360deg); } }
.hero__bigtv { position: absolute; right: -2%; bottom: -14%; z-index: 0; font-size: 40vw; line-height: 0.8; color: var(--c-text); opacity: 0.025; pointer-events: none; user-select: none; }

.hero__in { position: relative; z-index: 2; width: 100%; }
.hero__loc { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
.hero__loc-txt { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--c-muted); }
.hero__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c-accent); animation: pulse 2.4s infinite; }
@keyframes pulse { 0%,100%{ box-shadow: 0 0 0 0 color-mix(in srgb, var(--c-accent) 55%, transparent);} 70%{ box-shadow: 0 0 0 11px transparent;} }

.hero__title { line-height: 0.86; letter-spacing: 0.01em; margin-bottom: 30px; }
.hero__title .ln { display: block; overflow: hidden; }
.hero__title .ln > span { display: block; font-family: var(--font-display); font-size: clamp(3.6rem, 13vw, 12rem); animation: rise 0.9s var(--ease-out) forwards; }
.hero__title .ln:nth-child(2) > span { animation-delay: 0.1s; color: var(--c-accent); }
@keyframes rise { from { transform: translateY(110%); } to { transform: translateY(0); } }

.hero__sub { max-width: 540px; color: var(--c-muted); font-size: 1.15rem; line-height: 1.7; margin-bottom: 38px; }
.hero__row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-bottom: 50px; }

.hero__stats { display: grid; grid-template-columns: repeat(4, auto); border: 1px solid var(--c-border); width: fit-content; max-width: 100%; }
.stat { padding: 16px 30px; border-right: 1px solid var(--c-border); }
.stat:last-child { border-right: none; }
.stat__v { font-family: var(--font-display); font-size: 2.2rem; color: var(--c-accent); line-height: 1; letter-spacing: 0.03em; }
.stat__l { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-muted); margin-top: 7px; }

.hero__scroll { position: absolute; left: 32px; bottom: 38px; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 12px; }
@media (max-width: 940px){ .hero__scroll { display: none; } }
.hero__scroll span { writing-mode: vertical-rl; font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.3em; color: var(--c-faint); }
.hero__scroll i { width: 1px; height: 60px; background: linear-gradient(var(--c-accent), transparent); position: relative; overflow: hidden; }
.hero__scroll i::after { content:''; position:absolute; top:0; left:0; width:100%; height:30%; background: var(--c-text); animation: drop 1.8s var(--ease) infinite; }
@keyframes drop { 0%{ transform: translateY(-100%);} 100%{ transform: translateY(330%);} }

/* Ticker */
.ticker { position: relative; z-index: 2; border-top: 1px solid var(--c-border); border-bottom: 1px solid var(--c-border); background: var(--c-bg2); overflow: hidden; padding: 14px 0; }
.ticker__track { display: flex; gap: 48px; width: max-content; animation: marq 34s linear infinite; }
.ticker:hover .ticker__track { animation-play-state: paused; }
.ticker__item { display: flex; align-items: center; gap: 48px; font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-muted); white-space: nowrap; }
.ticker__star { color: var(--c-accent); }
@keyframes marq { to { transform: translateX(-50%); } }

@media (max-width: 900px){
  .hero { padding: 116px 0 56px; min-height: 100svh; }
  .hero__schematic { opacity: 0.16; right: -30%; width: 96vw; }
  .hero__glow { right: -30%; }
}
@media (max-width: 760px){
  .hero__sub { font-size: 1.05rem; margin-bottom: 30px; }
  .hero__row .btn { flex: 1 1 auto; justify-content: center; }
  .hero__stats { width: 100%; grid-template-columns: repeat(2, 1fr); }
  .stat { padding: 14px 16px; }
  .stat:nth-child(2n){ border-right: none; }
  .stat:nth-child(-n+2){ border-bottom: 1px solid var(--c-border); }
  .stat__v { font-size: 1.9rem; }
  .ticker__item { font-size: 0.68rem; gap: 34px; }
  .ticker__track { gap: 34px; }
}
@media (max-width: 480px){
  .hero__title .ln > span { font-size: clamp(3rem, 15vw, 4.6rem); }
}
</style>
