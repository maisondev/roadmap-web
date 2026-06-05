<script setup lang="ts">
import type { DailyLogEntry } from '@/types'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppTag from '@/components/atoms/AppTag.vue'
import { StarIcon } from '@heroicons/vue/24/outline'

interface Props {
  entry: DailyLogEntry
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false
})

const moodColors = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-blue-500',
  5: 'text-green-500'
}

const moodLabels = {
  1: 'Ruim',
  2: 'Difícil',
  3: 'Normal',
  4: 'Bom',
  5: 'Excelente'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div
    v-if="compact"
    class="p-3 border border-hairline rounded-lg bg-canvas-soft flex items-center justify-between"
  >
    <div class="flex items-center gap-3">
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center', moodColors[entry.mood]]">
        <StarIcon class="w-5 h-5" />
      </div>
      <div>
        <p class="font-medium text-ink">{{ formatDate(entry.date) }}</p>
        <p class="text-sm text-ink-body">{{ entry.minutosEstudados }}min • {{ entry.questoesFeitas }} Q</p>
      </div>
    </div>
  </div>
  <div v-else class="p-4 border border-hairline rounded-lg bg-canvas">
    <div class="flex items-center justify-between mb-3">
      <p class="font-semibold text-ink">{{ formatDate(entry.date) }}</p>
      <div class="flex items-center gap-2">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center', moodColors[entry.mood]]">
          <StarIcon class="w-5 h-5 text-white" />
        </div>
        <span class="text-sm font-medium text-ink-body">{{ moodLabels[entry.mood] }}</span>
      </div>
    </div>

    <div class="space-y-2 mb-3">
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fiz</p>
        <p class="text-ink">{{ entry.fiz || '—' }}</p>
      </div>
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Farei Amanhã</p>
        <p class="text-ink">{{ entry.fareiAmanha || '—' }}</p>
      </div>
    </div>

    <div class="flex gap-2 flex-wrap">
      <AppTag :label="`${entry.minutosEstudados} min`" color="blue" />
      <AppTag :label="`${entry.questoesFeitas} questões`" color="green" />
    </div>
  </div>
</template>
