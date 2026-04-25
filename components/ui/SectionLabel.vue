<template>
  <div class="flex items-center gap-3 mb-2">
    <span class="font-mono text-accent text-xs tracking-widest">//</span>
    <span class="font-mono text-xs tracking-[0.2em] uppercase" :class="dark ? 'text-muted' : 'text-accent'">
      {{ number }} — {{ label }}
    </span>
    <div class="flex-1 h-px" :class="dark ? 'bg-border' : 'bg-accent/20'"></div>
  </div>
</template>

<script setup>
defineProps({
  number: String,
  label: String,
  dark: Boolean,
})
</script>
