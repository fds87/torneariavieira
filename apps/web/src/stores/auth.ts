import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types/user'

const BASE = () => (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const useAuthStore = defineStore('auth', () => {
  // Access token lives ONLY in memory — never persisted to localStorage
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  function setAuth(data: AuthResponse) {
    accessToken.value = data.accessToken
    user.value = data.user
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* não-JSON */ }
      if (!res.ok) {
        error.value = (data.error as string) ?? 'Erro ao fazer login'
        return false
      }
      setAuth(data as AuthResponse)
      return true
    } catch (e) {
      console.error('[auth] login error:', e)
      error.value = 'Erro de conexão'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* não-JSON */ }
      if (!res.ok) {
        error.value = (data.error as string) ?? 'Erro ao criar conta'
        return false
      }
      setAuth(data as AuthResponse)
      return true
    } catch {
      error.value = 'Erro de conexão'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch(`${BASE()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // silently ignore
    } finally {
      clearAuth()
    }
  }

  async function refreshToken(): Promise<boolean> {
    const alreadyLoggedIn = !!accessToken.value
    try {
      const res = await fetch(`${BASE()}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        if (!alreadyLoggedIn) clearAuth()
        return false
      }
      const data = await res.json()
      setAuth(data as AuthResponse)
      return true
    } catch {
      if (!alreadyLoggedIn) clearAuth()
      return false
    }
  }

  async function fetchMe(): Promise<void> {
    if (!accessToken.value) return
    try {
      const res = await fetch(`${BASE()}/api/account/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
        credentials: 'include',
      })
      if (res.ok) {
        user.value = await res.json()
      }
    } catch {
      // silently ignore
    }
  }

  return {
    accessToken,
    user,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
    refreshToken,
    fetchMe,
    clearAuth,
    setAuth,
  }
})
