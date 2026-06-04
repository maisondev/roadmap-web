<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

defineEmits<{
  openSearch: []
}>()
</script>

<template>
  <div class="text-center py-8">
    <h1 class="text-5xl font-bold text-ink mb-3">
      Meus Roadmaps
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-300 mb-4">
      Crie e acompanhe múltiplos roadmaps de estudo
    </p>
    <AppButton
      variant="secondary"
      size="md"
      @click="$emit('openSearch')"
      class="flex items-center gap-2"
    >
      <AppIcon name="search" size="sm" />
      Busca Global
    </AppButton>
  </div>
</template>
