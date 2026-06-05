<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/components/atoms/AppIcon.vue'

interface Crumb {
  label: string
  action?: () => void
}

interface Props {
  crumbs: Crumb[]
}

defineProps<Props>()
const router = useRouter()

function handleClick(crumb: Crumb) {
  if (crumb.action) {
    crumb.action()
  }
}
</script>

<template>
  <nav class="flex items-center gap-0 text-xs sm:text-sm text-ink-body overflow-x-auto pb-2" aria-label="breadcrumbs">
    <button
      @click="handleClick(crumbs[0])"
      class="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
    >
      <AppIcon name="home" size="sm" class="flex-shrink-0" />
      <span class="hidden sm:inline font-medium">{{ crumbs[0].label }}</span>
    </button>

    <template v-for="(crumb, idx) in crumbs.slice(1)" :key="idx">
      <span class="flex-shrink-0 text-gray-400 dark:text-gray-600 mx-0.5">/</span>
      <button
        v-if="crumb.action"
        @click="handleClick(crumb)"
        class="inline-flex items-center px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-ink dark:hover:text-ink transition-colors whitespace-nowrap"
      >
        {{ crumb.label }}
      </button>
      <span v-else class="inline-flex items-center px-2 py-1.5 font-semibold text-ink dark:text-ink-light whitespace-nowrap">
        {{ crumb.label }}
      </span>
    </template>
  </nav>
</template>