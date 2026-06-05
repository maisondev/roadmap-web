<script setup lang="ts">
import { useDailyLogStore } from '@/stores/dailyLog'
import { useProgressStore } from '@/stores/progress'
import PageHeader from '@/components/organisms/PageHeader.vue'
import ProgressDashboard from '@/components/organisms/ProgressDashboard.vue'

const progressStore = useProgressStore()
const dailyLogStore = useDailyLogStore()
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-4xl mx-auto p-4 space-y-8">
      <PageHeader
        title="Dashboard de Progresso"
        description="Acompanhe seu desempenho e progresso em tempo real"
      />

      <!-- Progress Overview -->
      <ProgressDashboard
        :snapshot="progressStore.snapshotInterpretacao"
        :logs="dailyLogStore.logs"
      />
    </div>

  </div>
</template>
