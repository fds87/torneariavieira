<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const whatsapp = 'https://wa.me/5541999802662'

onMounted(() => { auth.refreshToken() })
</script>

<template>
  <div class="page-wrap">
    <!-- chrome global -->
    <div class="scroll-progress"></div>
    <div class="reticle"><i></i></div>

    <AppHeader />
    <slot />
    <AppFooter />

    <a :href="whatsapp" target="_blank" rel="noopener" class="wa" aria-label="WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3zM12 2a10 10 0 00-8.6 15l-1.3 4.7L7 20.4A10 10 0 1012 2z"/></svg>
    </a>
  </div>
</template>

<style>
.page-wrap { width: 100%; overflow-x: hidden; }
</style>
