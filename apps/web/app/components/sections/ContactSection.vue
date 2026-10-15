<template>
  <section id="contact" class="section section--alt">
    <div class="shell">
      <div class="contact__grid">
        <div v-reveal>
          <span class="eyebrow"><b>//</b> 05 — Contato <span class="ln"></span></span>
          <h2 class="section__title">FALE COM<br /><span class="gold">A GENTE</span></h2>
          <p class="contact__sub">Envie o desenho técnico ou descreva sua necessidade. Respondemos com orçamento detalhado em até 24h.</p>

          <div class="contact__items">
            <a :href="whatsapp" target="_blank" rel="noopener" class="citem">
              <span class="citem__ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2L8.5 10.5a11 11 0 005 5l1.1-1.7a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.7.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z"/></svg></span>
              <span><small>WhatsApp / Telefone</small><b>{{ site.phoneFormatted }}</b></span>
            </a>
            <a :href="`mailto:${site.email}`" class="citem">
              <span class="citem__ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="1"/><polyline points="3,7 12,13 21,7"/></svg></span>
              <span><small>E-mail</small><b>{{ site.email }}</b></span>
            </a>
            <a :href="site.facebook" target="_blank" rel="noopener" class="citem">
              <span class="citem__ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></span>
              <span><small>Facebook</small><b>Tornearia Vieira</b></span>
            </a>
            <div class="citem">
              <span class="citem__ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg></span>
              <span><small>Localização</small><b>{{ site.location }}</b></span>
            </div>
          </div>
        </div>

        <div class="form" v-reveal data-d="1">
          <span class="form__label">// Solicitar Orçamento</span>
          <form @submit.prevent="send">
            <div class="field"><label>Nome</label><input v-model="form.name" type="text" placeholder="Seu nome ou empresa" /></div>
            <div class="field"><label>Empresa (opcional)</label><input v-model="form.company" type="text" placeholder="Nome da empresa" /></div>
            <div class="field"><label>Mensagem / Especificação</label><textarea v-model="form.message" rows="4" placeholder="Descreva a peça ou serviço que precisa..."></textarea></div>
            <button type="submit" class="btn btn--gold">Enviar via WhatsApp <span class="arrow">→</span></button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { site } from '~/data/content.js'

const whatsapp = site.whatsapp
const form = reactive({ name: '', company: '', message: '' })

function send() {
  const name = form.name || 'Cliente'
  const company = form.company ? ` (${form.company})` : ''
  const msg = form.message || 'Gostaria de solicitar um orçamento.'
  const text = `Olá! Sou ${name}${company}.\n\n${msg}`
  window.open(`${whatsapp}?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<style scoped>
.contact__grid { display: grid; grid-template-columns: 1fr; gap: 60px; align-items: start; }
@media (min-width: 1024px){ .contact__grid { grid-template-columns: 1fr 1fr; gap: 80px; } }
.contact__sub { color: var(--c-muted); max-width: 380px; margin: 18px 0 40px; }
.contact__items { display: flex; flex-direction: column; gap: 4px; }
.citem { display: flex; align-items: center; gap: 18px; padding: 18px 0; border-bottom: 1px solid var(--c-border); transition: padding-left 0.3s; }
.citem:hover { padding-left: 10px; }
.citem__ic { width: 44px; height: 44px; flex-shrink: 0; border: 1px solid var(--c-border-2); display: grid; place-items: center; color: var(--c-accent); transition: border-color 0.3s; }
.citem:hover .citem__ic { border-color: var(--c-accent); }
.citem small { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-muted); display: block; margin-bottom: 4px; }
.citem b { font-weight: 500; font-size: 1rem; transition: color 0.25s; word-break: break-word; }
.citem:hover b { color: var(--c-accent); }

.form { border: 1px solid var(--c-border); background: var(--c-bg); padding: 40px; clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px)); }
.form__label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c-accent); margin-bottom: 24px; display: block; }
.field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.field label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--c-muted); }
.field input, .field textarea { background: var(--c-surface); border: 1px solid var(--c-border); color: var(--c-text); font-family: var(--font-body); font-size: 0.95rem; padding: 13px 16px; width: 100%; transition: border-color 0.25s, box-shadow 0.25s; outline: none; resize: none; }
.field input:focus, .field textarea:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 14%, transparent); }
.field input::placeholder, .field textarea::placeholder { color: var(--c-faint); }
.form .btn { width: 100%; justify-content: center; margin-top: 6px; }
@media (max-width: 760px){ .contact__grid { gap: 44px; } .form { padding: 28px 22px; } }
</style>
