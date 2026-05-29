export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    const key = sessionStorage.getItem('admin-key')
    if (!key) return navigateTo('/admin')
  }
})
