export function useAdminFetch() {
  const config = useRuntimeConfig()
  const base = (config.public.apiUrl as string || '').replace(/\/$/, '')

  async function adminFetch(path: string, options: RequestInit = {}) {
    const adminKey = import.meta.client ? (sessionStorage.getItem('admin-key') ?? '') : ''
    return fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        ...(options.headers ?? {}),
      },
    })
  }

  return { adminFetch }
}
