<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import { useProgressStore } from '@/stores/progress'
import AppProgressBar from '@/components/atoms/AppProgressBar.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppModal from '@/components/atoms/AppModal.vue'
import AppConfirmModal from '@/components/atoms/AppConfirmModal.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'
import { PencilIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const roadmapStore = useRoadmapStore()
const progressStore = useProgressStore()

const props = defineProps<{
  roadmapId: string
}>()

roadmapStore.setActiveRoadmap(props.roadmapId)


const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const newBlockTitle = ref('')
const newBlockPriority = ref<'normal' | 'alta' | 'maxima'>('normal')
const editingBlockId = ref<string | null>(null)
const editBlockTitle = ref('')
const editBlockPriority = ref<'normal' | 'alta' | 'maxima'>('normal')

// Filter state
const filterModuleStatus = ref<'all' | 'notStarted' | 'inProgress' | 'completed'>('all')

// Computed property for filtered blocks
const filteredBlocks = computed(() => {
  let blocks = roadmapStore.activeRoadmap.blocks

  // Filter by status
  if (filterModuleStatus.value !== 'all') {
    blocks = blocks.filter(block => {
      const progress = progressStore.blockProgressPercent(block.id)
      if (filterModuleStatus.value === 'notStarted') return progress === 0
      if (filterModuleStatus.value === 'inProgress') return progress > 0 && progress < 100
      if (filterModuleStatus.value === 'completed') return progress === 100
      return true
    })
  }

  return blocks
})

function addNewBlock() {
  if (!newBlockTitle.value.trim()) {
    alert('Digite um título para o módulo')
    return
  }

  roadmapStore.addBlock(newBlockTitle.value.trim(), newBlockPriority.value)
  newBlockTitle.value = ''
  newBlockPriority.value = 'normal'
  showAddModal.value = false
}

const priorityLabels = {
  normal: 'Normal',
  alta: 'Alta',
  maxima: 'Máxima'
}

const priorityColors = {
  normal: 'gray',
  alta: 'yellow',
  maxima: 'purple'
} as const

const priorityHex = {
  normal: '#10b981',
  alta: '#f59e0b',
  maxima: '#7928ca'
} as const

function navigateToBlock(blockId: string) {
  router.push({
    name: 'block-detail',
    params: {
      roadmapId: props.roadmapId,
      blockId
    }
  })
}

function moveBlockUp(blockId: string) {
  roadmapStore.moveBlockUp(blockId)
}

function moveBlockDown(blockId: string) {
  roadmapStore.moveBlockDown(blockId)
}

function toggleBlockCompletion(blockId: string) {
  const progress = progressStore.blockProgressPercent(blockId)
  if (progress === 100) {
    roadmapStore.markBlockIncomplete(blockId)
  } else {
    roadmapStore.markBlockComplete(blockId)
  }
}

function openEditModal(blockId: string) {
  const block = roadmapStore.blockById(blockId)
  if (block) {
    editingBlockId.value = blockId
    editBlockTitle.value = block.title
    editBlockPriority.value = block.priority
    showEditModal.value = true
  }
}

function saveBlockEdit() {
  if (editingBlockId.value && editBlockTitle.value.trim()) {
    roadmapStore.updateBlock(editingBlockId.value, editBlockTitle.value.trim(), editBlockPriority.value)
    showEditModal.value = false
    editingBlockId.value = null
  }
}

function confirmDeleteBlock(blockId: string) {
  editingBlockId.value = blockId
  showDeleteConfirm.value = true
}

function deleteBlock() {
  if (editingBlockId.value) {
    roadmapStore.removeBlock(editingBlockId.value)
    showDeleteConfirm.value = false
    editingBlockId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
      <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Header -->
      <PageHeader
        :title="roadmapStore.activeRoadmap.title"
        :description="roadmapStore.activeRoadmap.description"
      />

      <!-- Overall Progress -->
      <div class="p-3 sm:p-4 border border-hairline rounded-lg bg-canvas-soft">
        <p class="text-xs sm:text-sm font-medium text-ink-body mb-3">Progresso Geral do Roadmap</p>
        <AppProgressBar :value="progressStore.roadmapProgressPercent(activeRoadmapId)" show-label />
        <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-hairline">
          <AppButton variant="primary" size="sm" class="w-full sm:w-auto" @click="showAddModal = true">
            + Adicionar Módulo
          </AppButton>
        </div>
      </div>

      <!-- Filters -->
      <div class="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
        <select
          v-model="filterModuleStatus"
          class="px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
        >
          <option value="all">Todos os status</option>
          <option value="notStarted">Não iniciados</option>
          <option value="inProgress">Em andamento</option>
          <option value="completed">Concluídos</option>
        </select>
      </div>

      <!-- Results count -->
      <div v-if="filterModuleStatus !== 'all'" class="text-sm text-ink-body">
        {{ filteredBlocks.length }} {{ filteredBlocks.length === 1 ? 'módulo encontrado' : 'módulos encontrados' }}
      </div>

      <!-- Blocks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[2560px]:grid-cols-5 min-[3840px]:grid-cols-6 gap-4 min-[2560px]:gap-5 min-[3840px]:gap-6">
        <div
          v-for="(block, idx) in filteredBlocks"
          :key="block.id"
          class="group border border-hairline rounded-xl bg-canvas hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:border-hairline-strong flex flex-col overflow-hidden cursor-pointer"
          @click="navigateToBlock(block.id)"
        >
          <!-- Priority accent bar -->
          <div
            class="h-[3px]"
            :style="{ background: `linear-gradient(90deg, ${priorityHex[block.priority]}, ${priorityHex[block.priority]}66)` }"
          />

          <!-- Tinted header -->
          <div
            class="px-5 pt-4 pb-3"
            :style="{ background: `${priorityHex[block.priority]}0d` }"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-start gap-2.5 flex-1 min-w-0">
                <span
                  class="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  :style="{ background: priorityHex[block.priority] }"
                >
                  {{ block.order }}
                </span>
                <h3 class="text-base font-semibold text-ink leading-snug tracking-tight break-words">
                  {{ block.title }}
                </h3>
              </div>
            </div>
            <div class="flex items-center gap-2 pl-7">
              <AppBadge :color="priorityColors[block.priority]" size="sm">
                {{ priorityLabels[block.priority] }}
              </AppBadge>
            </div>
          </div>

          <!-- Main content -->
          <div class="px-5 py-3 flex-1">
            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-0 border border-hairline rounded-lg overflow-hidden">
              <div class="text-center py-2.5 px-1">
                <div class="text-base font-bold text-ink tracking-tight">{{ block.topics.length }}</div>
                <div class="text-xs text-ink-mute leading-none mt-0.5">tópicos</div>
              </div>
              <div class="text-center py-2.5 px-1 border-x border-hairline">
                <div class="text-base font-bold text-ink tracking-tight">
                  {{ block.topics.filter(t => t.status === 'concluido').length }}
                </div>
                <div class="text-xs text-ink-mute leading-none mt-0.5">concluídos</div>
              </div>
              <div class="text-center py-2.5 px-1">
                <div
                  class="text-base font-bold tracking-tight"
                  :style="{ color: priorityHex[block.priority] }"
                >
                  {{ progressStore.blockProgressPercent(block.id) }}%
                </div>
                <div class="text-xs text-ink-mute leading-none mt-0.5">progresso</div>
              </div>
            </div>
          </div>

          <!-- Bottom: progress + actions -->
          <div class="px-5 pb-4 pt-1 border-t border-hairline space-y-3">
            <div class="pt-3">
              <AppProgressBar
                :value="progressStore.blockProgressPercent(block.id)"
                :color="block.priority === 'maxima' ? 'blue' : block.priority === 'alta' ? 'yellow' : 'green'"
              />
            </div>

            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-0.5">
                <AppButton
                  :variant="progressStore.blockProgressPercent(block.id) === 100 ? 'secondary' : 'ghost'"
                  size="sm"
                  @click="(e) => { e.stopPropagation(); toggleBlockCompletion(block.id) }"
                  :title="progressStore.blockProgressPercent(block.id) === 100 ? 'Desmarcar como concluído' : 'Marcar como concluído'"
                >
                  <AppIcon :name="progressStore.blockProgressPercent(block.id) === 100 ? 'check-circle' : 'check'" size="sm" />
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  @click="(e) => { e.stopPropagation(); openEditModal(block.id) }"
                  title="Editar módulo"
                >
                  <PencilIcon class="w-4 h-4" />
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  @click="(e) => { e.stopPropagation(); confirmDeleteBlock(block.id) }"
                  title="Deletar módulo"
                >
                  <AppIcon name="trash" size="sm" class="text-ds-error" />
                </AppButton>
              </div>

              <div class="flex items-center gap-0.5">
                <AppButton
                  v-if="roadmapStore.activeRoadmap.blocks.findIndex(b => b.id === block.id) > 0"
                  variant="ghost"
                  size="sm"
                  @click="(e) => { e.stopPropagation(); moveBlockUp(block.id) }"
                  title="Mover módulo para cima"
                >
                  <AppIcon name="chevron-up" size="sm" />
                </AppButton>
                <AppButton
                  v-if="roadmapStore.activeRoadmap.blocks.findIndex(b => b.id === block.id) < roadmapStore.activeRoadmap.blocks.length - 1"
                  variant="ghost"
                  size="sm"
                  @click="(e) => { e.stopPropagation(); moveBlockDown(block.id) }"
                  title="Mover módulo para baixo"
                >
                  <AppIcon name="chevron-down" size="sm" />
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No results message -->
      <div v-if="filteredBlocks.length === 0" class="text-center py-12">
        <p class="text-ink-body">
          Nenhum módulo encontrado para os filtros selecionados.
        </p>
        <AppButton
          variant="ghost"
          size="sm"
          @click="() => { filterModuleName = ''; filterModuleStatus = 'all' }"
          class="mt-3"
        >
          Limpar filtros
        </AppButton>
      </div>

      <!-- Modal para adicionar novo módulo -->
      <AppModal
        :open="showAddModal"
        title="Adicionar Novo Módulo"
        submit-label="Criar"
        cancel-label="Cancelar"
        @submit="addNewBlock"
        @cancel="showAddModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink-body mb-1">
              Título do Módulo
            </label>
            <input
              v-model="newBlockTitle"
              type="text"
              placeholder="Ex: Módulo 17 - Novo Tópico"
              class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
              @keyup.enter="addNewBlock"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-body mb-1">
              Prioridade
            </label>
            <select
              v-model="newBlockPriority"
              class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
            >
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="maxima">Máxima</option>
            </select>
          </div>
        </div>
      </AppModal>

      <!-- Modal para editar módulo -->
      <AppModal
        :open="showEditModal"
        title="Editar Módulo"
        submit-label="Salvar"
        cancel-label="Cancelar"
        @submit="saveBlockEdit"
        @cancel="showEditModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink-body mb-1">
              Título do Módulo
            </label>
            <input
              v-model="editBlockTitle"
              type="text"
              class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
              @keyup.enter="saveBlockEdit"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-body mb-1">
              Prioridade
            </label>
            <select
              v-model="editBlockPriority"
              class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
            >
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="maxima">Máxima</option>
            </select>
          </div>
        </div>
      </AppModal>

      <!-- Modal para confirmar exclusão -->
      <AppConfirmModal
        :open="showDeleteConfirm"
        title="Deletar Módulo"
        message="Tem certeza que deseja deletar este módulo? Todos os tópicos e recursos serão removidos."
        submit-label="Deletar"
        cancel-label="Cancelar"
        @submit="deleteBlock"
        @cancel="showDeleteConfirm = false"
      />
    </div>
  </div>
</template>
