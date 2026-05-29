export default defineNuxtRouteMiddleware(async () => {
  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()

  if (!auth.isLoggedIn) {
    const ok = await auth.refreshToken()
    if (!ok) {
      const route = useRoute()
      return navigateTo({ path: '/conta/entrar', query: { redirect: route.fullPath } })
    }
  }
})
