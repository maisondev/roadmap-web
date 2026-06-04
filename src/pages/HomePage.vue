<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoadmapStore } from '@/stores/roadmap'
import { useDailyLogStore } from '@/stores/dailyLog'
import { useRoadmapActions } from '@/composables/useRoadmapActions'
import LandingPage from '@/pages/LandingPage.vue'
import RoadmapCard from '@/components/molecules/RoadmapCard.vue'
import HomePageHeader from '@/components/molecules/HomePageHeader.vue'
import RoadmapFilters from '@/components/molecules/RoadmapFilters.vue'
import RoadmapExampleSection from '@/components/molecules/RoadmapExampleSection.vue'
import RecentActivitySection from '@/components/molecules/RecentActivitySection.vue'
import CreateRoadmapModal from '@/components/molecules/CreateRoadmapModal.vue'
import GenerateRoadmapModal from '@/components/molecules/GenerateRoadmapModal.vue'
import ImportRoadmapModal from '@/components/molecules/ImportRoadmapModal.vue'
import GlobalSearchModal from '@/components/molecules/GlobalSearchModal.vue'
import { roadmapInterpretacaoTextos } from '@/data/roadmaps/interpretacao-textos'

const authStore = useAuthStore()
const roadmapStore = useRoadmapStore()
const dailyLogStore = useDailyLogStore()

const {
  filterName,
  filterStatus,
  filteredRoadmapIds,
  getRoadmapStats,
  createRoadmap,
  deleteRoadmap,
  editRoadmap,
  moveRoadmapUp,
  moveRoadmapDown,
  updateRoadmapColor,
  markRoadmapComplete,
  markRoadmapIncomplete,
  useExampleRoadmap,
  exportRoadmap,
  importRoadmap,
  performGlobalSearch,
  navigateToRoadmap,
  navigateToSearchResult
} = useRoadmapActions()

dailyLogStore.initLogs()

const showAddRoadmapModal = ref(false)
const showGenerateRoadmapModal = ref(false)
const showImportModal = ref(false)
const showGlobalSearch = ref(false)

const filterModel = ref({ name: filterName.value, status: filterStatus.value })

async function handleCreateRoadmap(data: {
  title: string
  description: string
  category: string
  tags: string[]
  visibility: 'public' | 'private'
  blocks?: any[]
}) {
  const id = await createRoadmap(data)
  if (id) {
    showAddRoadmapModal.value = false
  }
}

function handleImportRoadmap(data: string) {
  const id = importRoadmap(data)
  if (id) {
    showImportModal.value = false
  }
}
</script>

<template>
  <LandingPage v-if="!authStore.isLoggedIn" />

  <div v-else class="min-h-screen bg-canvas-soft">
    <div class="max-w-6xl mx-auto p-4 space-y-8">
      <HomePageHeader @openSearch="showGlobalSearch = true" />

      <RoadmapFilters
        v-model="filterModel"
        @update:modelValue="(v) => { filterName = v.name; filterStatus = v.status }"
        @create="showAddRoadmapModal = true"
        @generate="showGenerateRoadmapModal = true"
        @import="showImportModal = true"
      />

      <RoadmapExampleSection
        v-if="filteredRoadmapIds.length === 0"
        :roadmap="roadmapInterpretacaoTextos"
        @useTemplate="useExampleRoadmap"
      />

      <div v-if="filterName || filterStatus !== 'all'" class="text-sm text-ink-body">
        {{ filteredRoadmapIds.length }} {{ filteredRoadmapIds.length === 1 ? 'roadmap encontrado' : 'roadmaps encontrados' }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RoadmapCard
          v-for="(id, idx) in filteredRoadmapIds"
          :key="id"
          :roadmap="roadmapStore.roadmaps[id]"
          :roadmap-id="id"
          :stats="getRoadmapStats(id)"
          :can-move-up="idx > 0"
          :can-move-down="idx < filteredRoadmapIds.length - 1"
          @navigate="navigateToRoadmap(id)"
          @move-up="moveRoadmapUp(id)"
          @move-down="moveRoadmapDown(id)"
          @edit="editRoadmap(id, $event)"
          @delete="(password) => deleteRoadmap(id, password)"
          @update-color="(color) => updateRoadmapColor(id, color)"
          @update-roadmap="(updates) => editRoadmap(id, updates)"
          @mark-complete="markRoadmapComplete(id)"
          @mark-incomplete="markRoadmapIncomplete(id)"
          @export="exportRoadmap(id)"
        />
      </div>

      <div v-if="filteredRoadmapIds.length === 0 && (filterName || filterStatus !== 'all')" class="text-center py-12">
        <p class="text-ink-body">
          Nenhum roadmap encontrado para os filtros selecionados.
        </p>
      </div>

      <RecentActivitySection :logs="dailyLogStore.last7Days" />

      <CreateRoadmapModal
        :open="showAddRoadmapModal"
        @submit="handleCreateRoadmap"
        @cancel="showAddRoadmapModal = false"
      />

      <GenerateRoadmapModal
        :open="showGenerateRoadmapModal"
        @submit="handleCreateRoadmap"
        @cancel="showGenerateRoadmapModal = false"
        @close="showGenerateRoadmapModal = false"
      />

      <ImportRoadmapModal
        :open="showImportModal"
        @submit="handleImportRoadmap"
        @cancel="showImportModal = false"
      />

      <GlobalSearchModal
        :open="showGlobalSearch"
        :roadmaps="roadmapStore.roadmaps"
        @navigate="navigateToSearchResult"
        @cancel="showGlobalSearch = false"
      />
    </div>
  </div>
</template>
