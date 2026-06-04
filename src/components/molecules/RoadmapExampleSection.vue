<script setup lang="ts">
interface Roadmap {
  title: string
  description: string
  blocks?: Array<{ title?: string }>
}

interface Props {
  roadmap: Roadmap
}

defineProps<Props>()

defineEmits<{
  useTemplate: []
}>()
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-ink">Roadmaps de Exemplo</h2>
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-ink">
            {{ roadmap.title }}
          </h3>
          <p class="text-sm text-ink-body">
            {{ roadmap.description }}
          </p>
          <div class="flex gap-2 pt-2">
            <span class="text-xs bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
              {{ roadmap.blocks?.length || 0 }} módulos
            </span>
            <span class="text-xs bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-1 rounded">
              Concursos
            </span>
          </div>
        </div>
        <button
          @click="$emit('useTemplate')"
          class="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Usar como Template
        </button>
      </div>
    </div>
  </div>
</template>
