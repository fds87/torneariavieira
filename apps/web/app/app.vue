<script setup lang="ts">
import { useJsonLd } from '@/composables/useJsonLd'
import { organizationSchema, websiteSchema } from '@/lib/business'

// Dados estruturados globais — presentes em todas as páginas para
// descoberta por motores de busca e agentes de IA.
useJsonLd([organizationSchema(), websiteSchema()])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
