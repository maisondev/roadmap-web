<script setup lang="ts">
import DailyLogEntry from '@/components/molecules/DailyLogEntry.vue'

interface DailyLog {
  id: string
  date: string
  [key: string]: any
}

interface Props {
  logs: DailyLog[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="logs.length > 0" class="space-y-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Atividade Recente</h2>
    <div class="space-y-2">
      <DailyLogEntry
        v-for="log in logs.slice(0, 3)"
        :key="log.id"
        :entry="log"
        :compact="true"
      />
    </div>
  </div>
</template>
