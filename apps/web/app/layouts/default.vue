<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
onMounted(() => { auth.refreshToken() })
</script>

<template>
  <div class="page-wrap">
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>

<style>
.page-wrap {
  width: 100%;
  overflow-x: hidden;
}
</style>
