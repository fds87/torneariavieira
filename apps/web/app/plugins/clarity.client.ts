export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const clarityId = config.public.clarityProjectId as string

  if (!clarityId) return

  // Validar formato do ID para evitar injeção via variável de ambiente comprometida
  if (!/^[a-zA-Z0-9]{8,15}$/.test(clarityId)) {
    console.warn('[Clarity] Project ID inválido, ignorando')
    return
  }

  useHead({
    script: [
      {
        innerHTML: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`,
        type: 'text/javascript',
      },
    ],
  })
})
