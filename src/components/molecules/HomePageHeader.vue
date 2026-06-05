<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

defineEmits<{
  openSearch: []
}>()
</script>

<template>
  <div class="py-6 border-b border-hairline">
    <h1 class="text-4xl font-bold text-ink mb-2">
      Meus Roadmaps
    </h1>
    <p class="text-base text-ink-body">
      Crie e acompanhe múltiplos roadmaps de estudo
    </p>
  </div>
</template>
