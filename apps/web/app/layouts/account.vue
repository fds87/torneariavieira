<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="page-wrap">
    <AppHeader />
    <main class="container account-page">
      <div class="account-layout">
        <aside class="account-sidebar">
          <div class="sidebar-user">
            <div class="user-avatar">{{ auth.user?.name?.[0]?.toUpperCase() }}</div>
            <div>
              <p class="user-name">{{ auth.user?.name }}</p>
              <p class="user-email">{{ auth.user?.email }}</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <NuxtLink to="/conta" class="nav-item" exact-active-class="nav-item--active">
              Visão Geral
            </NuxtLink>
            <NuxtLink to="/conta/pedidos" class="nav-item" active-class="nav-item--active">
              Meus Pedidos
            </NuxtLink>
            <NuxtLink to="/conta/enderecos" class="nav-item" active-class="nav-item--active">
              Meus Endereços
            </NuxtLink>
            <NuxtLink to="/conta/dados" class="nav-item" active-class="nav-item--active">
              Meus Dados
            </NuxtLink>
          </nav>

          <button class="logout-btn" @click="handleLogout">Sair</button>
        </aside>

        <section class="account-content">
          <slot />
        </section>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.page-wrap { width: 100%; overflow-x: hidden; }

.account-page { padding: 6rem 1.5rem 4rem; }

.account-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  align-items: start;
}

.account-sidebar {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  position: sticky;
  top: 96px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.25rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0c0a09;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-name { font-weight: 600; color: var(--c-stone-100); font-size: 0.9rem; margin: 0; line-height: 1.3; }
.user-email { font-size: 0.75rem; color: var(--text-muted); margin: 0; line-height: 1.3; }

.sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem; }

.nav-item {
  display: block;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--c-stone-400);
  text-decoration: none;
  transition: all 0.15s;
}

.nav-item:hover, .nav-item--active {
  background: rgba(202, 138, 4, 0.08);
  color: var(--accent);
}

.logout-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--c-stone-500);
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.logout-btn:hover { border-color: #ef4444; color: #ef4444; }

.account-content { min-height: 400px; }

@media (max-width: 768px) {
  .account-layout { grid-template-columns: 1fr; }
  .account-sidebar { position: static; }
}
</style>
