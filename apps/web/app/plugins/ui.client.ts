// plugins/ui.client.ts
// Diretivas (v-reveal, v-count) + efeitos globais (progress, reticle, magnetic, WhatsApp).
// Carregado só no client (sufixo .client).

export default defineNuxtPlugin((nuxtApp) => {
  const hasIO = typeof IntersectionObserver !== 'undefined'

  /* v-reveal — anima ao entrar na viewport */
  const io = hasIO
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
    : null

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      el.classList.add('reveal')
      if (io) io.observe(el); else el.classList.add('in')
    },
  })

  /* v-count="120" data-suffix="%" — contador animado */
  nuxtApp.vueApp.directive('count', {
    mounted(el: HTMLElement, binding) {
      const target = Number(binding.value) || 0
      const suffix = el.dataset.suffix || ''
      if (!hasIO) { el.textContent = target + suffix; return }
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          cio.disconnect()
          const dur = 1400, t0 = performance.now()
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / dur)
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      }, { threshold: 0.5 })
      cio.observe(el)
    },
  })

  /* Efeitos globais — após montagem da app */
  nuxtApp.hook('app:mounted', () => {
    const prog = document.querySelector<HTMLElement>('.scroll-progress')
    const wa = document.querySelector<HTMLElement>('.wa')
    const reticle = document.querySelector<HTMLElement>('.reticle')

    const onScroll = () => {
      const y = window.scrollY
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%'
      if (wa) wa.classList.toggle('show', y > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    /* Reticle (mira) — só desktop com ponteiro fino */
    if (reticle && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const dot = reticle.querySelector('i') as HTMLElement
      window.addEventListener('mousemove', (e) => {
        reticle.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        reticle.classList.add('on')
        const grow = (e.target as HTMLElement).closest('a, button, [data-magnetic], .svc, .pcard')
        if (dot) dot.style.inset = grow ? '7px' : '12px'
      })
      document.addEventListener('mouseleave', () => reticle.classList.remove('on'))
    }

    /* Botões magnéticos */
    document.addEventListener('mousemove', (e) => {
      const m = (e.target as HTMLElement).closest('[data-magnetic]') as HTMLElement | null
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => { if (b !== m) b.style.transform = '' })
      if (m) {
        const r = m.getBoundingClientRect()
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`
      }
    })
  })
})
