<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
defineSlots<{
  default(): any
}>()
</script>

<template>
  <div class="py-6 border-b border-hairline">
    <h1 class="text-4xl font-bold text-ink mb-2">
      {{ title }}
    </h1>
    <p v-if="description" class="text-base text-ink-body mb-4">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
