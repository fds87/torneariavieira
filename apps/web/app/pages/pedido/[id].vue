<script setup lang="ts">
const route = useRoute()
await navigateTo(`/pagamento/sucesso?external_reference=${route.params.id}`, { replace: true })
</script>
<template><div></div></template>
