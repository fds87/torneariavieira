const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${base}${path}`, init)
}

// Authenticated fetch — injects Bearer token and retries once on 401 with token refresh
export async function apiFetchAuth(path: string, init?: RequestInit): Promise<Response> {
  // Lazy import to avoid circular dependencies at module load time
  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()

  const withAuth = (token: string): RequestInit => ({
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (!auth.accessToken) {
    const ok = await auth.refreshToken()
    if (!ok) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
  }

  let res = await fetch(`${base}${path}`, withAuth(auth.accessToken!))

  if (res.status === 401) {
    const ok = await auth.refreshToken()
    if (!ok) return res
    res = await fetch(`${base}${path}`, withAuth(auth.accessToken!))
  }

  return res
}
