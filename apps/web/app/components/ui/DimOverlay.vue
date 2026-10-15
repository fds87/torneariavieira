<template>
  <svg class="dim" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
    <line x1="6" y1="14" x2="6" y2="86" stroke-width="0.4" />
    <line x1="3" y1="14" x2="9" y2="14" stroke-width="0.5" /><line x1="3" y1="86" x2="9" y2="86" stroke-width="0.5" />
    <line x1="14" y1="93" x2="86" y2="93" stroke-width="0.4" />
    <line x1="14" y1="90" x2="14" y2="96" stroke-width="0.5" /><line x1="86" y1="90" x2="86" y2="96" stroke-width="0.5" />
    <circle cx="85" cy="14" r="7" stroke-width="0.4" /><circle cx="85" cy="14" r="1.6" stroke-width="0.5" />
    <line x1="76" y1="14" x2="94" y2="14" stroke-width="0.3" /><line x1="85" y1="5" x2="85" y2="23" stroke-width="0.3" />
  </svg>
</template>

<style scoped>
.dim { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--c-accent); opacity: 0.28; pointer-events: none; z-index: 2; }
</style>
