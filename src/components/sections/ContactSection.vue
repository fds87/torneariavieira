<template>
  <section id="contact" class="contact">
    <TechBg />
    <div class="contact__inner">
      <div class="contact__grid">

        <!-- Left: info -->
        <div class="contact__info">
          <div class="section-head__label">
            <span class="label-tech" style="color: var(--c-accent)">//</span>
            <span class="label-tech" style="color: var(--c-muted)">04 — Contato</span>
            <div class="section-head__line"></div>
          </div>
          <h2 class="contact__title font-display">
            FALE COM<br/>
            <span style="color: var(--c-accent)">A GENTE</span>
          </h2>
          <p class="contact__sub">
            Envie o desenho técnico ou descreva sua necessidade. Respondemos com orçamento detalhado em até 24h.
          </p>

          <div class="contact__items">
            <a :href="whatsapp" target="_blank" class="contact__item">
              <div class="contact__item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5a11.05 11.05 0 005 5l1.14-1.724a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="#C8A96E" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <div class="label-tech" style="font-size:0.6rem; color:var(--c-muted); display:block; margin-bottom:4px">WHATSAPP / TELEFONE</div>
                <span class="contact__item-val">(41) 99980-2662</span>
              </div>
            </a>

            <a href="https://www.facebook.com/profile.php?id=100095592520678" target="_blank" class="contact__item">
              <div class="contact__item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="#C8A96E" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <div class="label-tech" style="font-size:0.6rem; color:var(--c-muted); display:block; margin-bottom:4px">FACEBOOK</div>
                <span class="contact__item-val">Tornearia Vieira</span>
              </div>
            </a>

            <div class="contact__item">
              <div class="contact__item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#C8A96E" stroke-width="1.5"/>
                  <circle cx="12" cy="9" r="2.5" stroke="#C8A96E" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <div class="label-tech" style="font-size:0.6rem; color:var(--c-muted); display:block; margin-bottom:4px">LOCALIZAÇÃO</div>
                <span class="contact__item-val">São José dos Pinhais — PR</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: form -->
        <div class="contact__form-wrap card-cut">
          <div class="label-tech" style="font-size:0.65rem; margin-bottom:24px">// Solicitar Orçamento</div>
          <form @submit.prevent="sendWhatsApp" class="contact__form">
            <div class="form-field">
              <label class="form-label label-tech">Nome</label>
              <input v-model="form.name" type="text" placeholder="Seu nome ou empresa" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label label-tech">Empresa <span style="color:var(--c-muted)">(opcional)</span></label>
              <input v-model="form.company" type="text" placeholder="Nome da empresa" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label label-tech">Mensagem / Especificação</label>
              <textarea v-model="form.message" rows="4" placeholder="Descreva a peça ou serviço que precisa..." class="form-input form-textarea"></textarea>
            </div>
            <button type="submit" class="btn-gold" style="width:100%; text-align:center; cursor:pointer; border:none">
              Enviar via WhatsApp →
            </button>
          </form>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import TechBg from '../ui/TechBg.vue'
const whatsapp = 'https://wa.me/5541999802662'
const form = reactive({ name: '', company: '', message: '' })

function sendWhatsApp() {
  const name = form.name || 'Cliente'
  const company = form.company ? ` (${form.company})` : ''
  const msg = form.message || 'Gostaria de solicitar um orçamento.'
  const text = `Olá! Sou ${name}${company}.\n\n${msg}`
  window.open(`https://wa.me/5541999802662?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<style scoped>
.contact {
  position: relative;
  background: var(--c-bg);
  padding: 96px 0;
  overflow: hidden;
}
.contact__inner {
  position: relative; z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
.contact__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
  align-items: start;
}
@media (min-width: 1024px) {
  .contact__grid { grid-template-columns: 1fr 1fr; gap: 80px; }
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
.contact__title {
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 0.92;
  letter-spacing: 0.02em;
  color: var(--c-text);
  margin-bottom: 20px;
}
.contact__sub {
  color: var(--c-muted);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.7;
  max-width: 340px;
  margin-bottom: 40px;
}
.contact__items { display: flex; flex-direction: column; gap: 20px; }
.contact__item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  text-decoration: none;
  transition: color 0.2s;
}
.contact__item-icon {
  width: 40px; height: 40px;
  flex-shrink: 0;
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.contact__item:hover .contact__item-icon { border-color: var(--c-accent); }
.contact__item-val {
  color: var(--c-text);
  font-size: 0.9rem;
  transition: color 0.2s;
}
.contact__item:hover .contact__item-val { color: var(--c-accent); }

/* Form */
.contact__form-wrap {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  padding: 40px;
}
.contact__form { display: flex; flex-direction: column; gap: 20px; }
.form-field { display: flex; flex-direction: column; gap: 8px; }
.form-label {
  font-size: 0.6rem;
  color: var(--c-muted);
}
.form-input {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  padding: 12px 16px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input::placeholder { color: rgba(102,102,102,0.4); }
.form-input:focus { border-color: var(--c-accent); }
.form-textarea { resize: none; }
</style>
