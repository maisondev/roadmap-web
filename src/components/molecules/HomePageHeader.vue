<script setup lang="ts">
import PageHeader from '@/components/organisms/PageHeader.vue'
import AppButton from '@/components/atoms/AppButton.vue'

defineEmits<{
  openSearch: []
}>()
</script>

<template>
  <PageHeader
    title="Meus Roadmaps"
    description="Crie e acompanhe múltiplos roadmaps de estudo"
  >
    <AppButton
      variant="secondary"
      size="sm"
      @click="$emit('openSearch')"
    >
      Buscar roadmaps
    </AppButton>
  </PageHeader>
</template>
