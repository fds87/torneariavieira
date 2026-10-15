declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const measurementId = config.public.gaMeasurementId as string

  if (!measurementId) return

  // Inject GA4 script
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
        async: true,
      },
    ],
  })

  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false, // manual via router hook
  })

  // Track page views on navigation
  const router = useRouter()
  router.afterEach((to) => {
    window.gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_title: document.title,
    })
  })
})
