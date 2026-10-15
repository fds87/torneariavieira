// Stubs SSR para as directivas v-reveal e v-count (registadas no cliente via ui.client.ts).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', { getSSRProps: () => ({}) })
  nuxtApp.vueApp.directive('count', { getSSRProps: () => ({}) })
})
