<script setup lang="ts">
import { useDailyLogStore } from '@/stores/dailyLog'
import { useProgressStore } from '@/stores/progress'
import ProgressDashboard from '@/components/organisms/ProgressDashboard.vue'

const progressStore = useProgressStore()
const dailyLogStore = useDailyLogStore()
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      <h1 class="text-3xl font-bold text-ink">Dashboard de Progresso</h1>

      <!-- Progress Overview -->
      <ProgressDashboard
        :snapshot="progressStore.snapshotInterpretacao"
        :logs="dailyLogStore.logs"
      />
    </div>

  </div>
</template>
