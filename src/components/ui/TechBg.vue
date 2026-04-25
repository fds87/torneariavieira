<template>
  <!-- SVG engineering drawing background — crosshairs, dimension lines, circles, callouts -->
  <svg class="tech-bg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="smallgrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.35"/>
      </pattern>
      <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#smallgrid)"/>
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.45"/>
      </pattern>
    </defs>

    <!-- Base grid -->
    <rect width="100%" height="100%" fill="url(#grid)" />

    <!-- Large crosshair top-right -->
    <g transform="translate(78%, 22%)" opacity="0.25">
      <circle cx="0" cy="0" r="48" fill="none" stroke="currentColor" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4 3"/>
      <circle cx="0" cy="0" r="6"  fill="none" stroke="currentColor" stroke-width="0.8"/>
      <line x1="-72" y1="0" x2="72" y2="0" stroke="currentColor" stroke-width="0.6"/>
      <line x1="0" y1="-72" x2="0" y2="72" stroke="currentColor" stroke-width="0.6"/>
      <!-- tick marks -->
      <line x1="-48" y1="-4" x2="-48" y2="4" stroke="currentColor" stroke-width="0.8"/>
      <line x1="48" y1="-4" x2="48" y2="4" stroke="currentColor" stroke-width="0.8"/>
      <line x1="-4" y1="-48" x2="4" y2="-48" stroke="currentColor" stroke-width="0.8"/>
      <line x1="-4" y1="48" x2="4" y2="48" stroke="currentColor" stroke-width="0.8"/>
    </g>

    <!-- Dimension line top -->
    <g transform="translate(8%, 8%)" opacity="0.2">
      <line x1="0" y1="0" x2="200" y2="0" stroke="currentColor" stroke-width="0.7"/>
      <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" stroke-width="0.7"/>
      <line x1="200" y1="-6" x2="200" y2="6" stroke="currentColor" stroke-width="0.7"/>
      <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3 2"/>
      <line x1="200" y1="0" x2="200" y2="30" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3 2"/>
    </g>

    <!-- Small crosshair bottom-left -->
    <g transform="translate(12%, 78%)" opacity="0.2">
      <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="0" cy="0" r="4"  fill="none" stroke="currentColor" stroke-width="0.8"/>
      <line x1="-44" y1="0" x2="44" y2="0" stroke="currentColor" stroke-width="0.5"/>
      <line x1="0" y1="-44" x2="0" y2="44" stroke="currentColor" stroke-width="0.5"/>
    </g>

    <!-- Callout box -->
    <g transform="translate(60%, 70%)" opacity="0.18">
      <rect x="0" y="0" width="120" height="44" fill="none" stroke="currentColor" stroke-width="0.7"/>
      <line x1="0" y1="16" x2="120" y2="16" stroke="currentColor" stroke-width="0.5"/>
      <line x1="40" y1="0" x2="40" y2="44" stroke="currentColor" stroke-width="0.5"/>
    </g>

    <!-- Angle indicator -->
    <g transform="translate(88%, 55%)" opacity="0.18">
      <path d="M -40 0 A 40 40 0 0 1 0 -40" fill="none" stroke="currentColor" stroke-width="0.7"/>
      <line x1="-40" y1="0" x2="10" y2="0" stroke="currentColor" stroke-width="0.6"/>
      <line x1="0" y1="-40" x2="0" y2="10" stroke="currentColor" stroke-width="0.6"/>
    </g>

    <!-- Centre marks scattered -->
    <g opacity="0.15">
      <line x1="22%" y1="45%" x2="22%" y2="55%" stroke="currentColor" stroke-width="0.6"/>
      <line x1="20%" y1="50%" x2="24%" y2="50%" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="22%" cy="50%" r="3" fill="none" stroke="currentColor" stroke-width="0.6"/>

      <line x1="70%" y1="10%" x2="70%" y2="18%" stroke="currentColor" stroke-width="0.6"/>
      <line x1="68%" y1="14%" x2="72%" y2="14%" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="70%" cy="14%" r="3" fill="none" stroke="currentColor" stroke-width="0.6"/>
    </g>
  </svg>
</template>

<style scoped>
.tech-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: var(--c-accent);
  overflow: hidden;
}
</style>
