<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import { useSettingsStore } from '@/stores/settings'
import { selectLocalPath } from '@/composables/useFileSystem'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppModal from '@/components/atoms/AppModal.vue'
import ResourceCard from '@/components/molecules/ResourceCard.vue'

interface Props {
  roadmapId: string
  blockId: string
  topicId: string
}

const props = defineProps<Props>()
const router = useRouter()
const roadmapStore = useRoadmapStore()
const settingsStore = useSettingsStore()

roadmapStore.setActiveRoadmap(props.roadmapId)

const block = computed(() => roadmapStore.blockById(props.blockId))
const topic = computed(() => roadmapStore.topicById(props.blockId, props.topicId))


const resourceLabel = ref('')
const resourceUrl = ref('')
const resourceType = ref<'youtube' | 'drive' | 'document' | 'link' | 'local'>('youtube')
const isSelectingLocalPath = ref(false)
const showAddResourceModal = ref(false)
const documentIsLocal = ref(false)

const filterType = ref<'all' | 'youtube' | 'drive' | 'document' | 'link' | 'local'>('all')
const onlyUnviewed = ref(false)
const sortBy = ref<'added_desc' | 'added_asc' | 'rating_desc'>('added_desc')

const filteredResources = computed(() => {
  const resources = topic.value?.resources ?? []

  let list = resources

  if (filterType.value !== 'all') {
    list = list.filter(r => r.type === filterType.value)
  }

  if (onlyUnviewed.value) {
    list = list.filter(r => !r.viewed)
  }

  const sorted = [...list]
  if (sortBy.value === 'rating_desc') {
    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  } else if (sortBy.value === 'added_asc') {
    sorted.sort((a, b) => (a.addedAt || '').localeCompare(b.addedAt || ''))
  } else {
    sorted.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''))
  }
  return sorted
})

function maybeMarkViewed(resourceId: string) {
  if (!topic.value) return
  if (!settingsStore.settings.markViewedOnOpen) return
  const r = topic.value.resources.find(x => x.id === resourceId)
  if (!r || r.viewed) return
  roadmapStore.toggleResourceViewed(props.blockId, topic.value.id, resourceId)
}

const topicNotesStatus = ref<'idle' | 'saving' | 'saved'>('idle')
let topicNotesTimer: number | null = null

function updateTopicNotes(value: string) {
  if (!topic.value || !block.value) return
  topicNotesStatus.value = 'saving'
  roadmapStore.updateTopicNotes(block.value.id, topic.value.id, value)
  if (topicNotesTimer) window.clearTimeout(topicNotesTimer)
  topicNotesTimer = window.setTimeout(() => {
    topicNotesStatus.value = 'saved'
  }, 350)
}

watch(
  () => topic.value?.id,
  () => {
    topicNotesStatus.value = 'idle'
    if (topicNotesTimer) window.clearTimeout(topicNotesTimer)
    topicNotesTimer = null
  }
)

watch(
  () => resourceType.value,
  (t) => {
    // resetar ao trocar tipo
    documentIsLocal.value = false
    if (t === 'youtube') return
  }
)

function addResource() {
  if (!topic.value || !resourceLabel.value.trim()) {
    alert('Preencha o título do recurso')
    return
  }

  const needsPath = resourceType.value === 'local' || (resourceType.value === 'document' && documentIsLocal.value)
  const needsUrl = !needsPath

  if (needsUrl && !resourceUrl.value.trim()) {
    alert('Preencha a URL')
    return
  }

  if (needsPath && !resourceUrl.value.trim()) {
    alert('Selecione o caminho no computador')
    return
  }

  roadmapStore.addResource(props.blockId, topic.value.id, {
    id: Math.random().toString(36).slice(2, 11),
    type: resourceType.value,
    label: resourceLabel.value.trim(),
    ...(needsPath ? { localPath: resourceUrl.value.trim(), url: undefined } : { url: resourceUrl.value.trim(), localPath: undefined }),
    notes: '',
    addedAt: new Date().toISOString(),
    viewed: false,
    rating: 0
  })

  resourceLabel.value = ''
  resourceUrl.value = ''
  resourceType.value = 'youtube'
  documentIsLocal.value = false
  showAddResourceModal.value = false
}

async function selectLocalFolder() {
  isSelectingLocalPath.value = true
  const path = await selectLocalPath()
  if (path) {
    resourceUrl.value = path
  }
  isSelectingLocalPath.value = false
}

function removeResource(resourceId: string) {
  if (!topic.value) return
  roadmapStore.removeResource(props.blockId, topic.value.id, resourceId)
}

function toggleResourceViewed(resourceId: string) {
  if (!topic.value) return
  roadmapStore.toggleResourceViewed(props.blockId, topic.value.id, resourceId)
}

function moveResourceUp(resourceId: string) {
  if (!topic.value) return
  roadmapStore.moveResourceUp(props.blockId, topic.value.id, resourceId)
}

function moveResourceDown(resourceId: string) {
  if (!topic.value) return
  roadmapStore.moveResourceDown(props.blockId, topic.value.id, resourceId)
}

function updateResourceRating(resourceId: string, rating: number) {
  if (!topic.value) return
  roadmapStore.updateResourceRating(props.blockId, topic.value.id, resourceId, rating)
}

function updateResource(resourceId: string, updates: { [key: string]: unknown }) {
  if (!topic.value) return
  roadmapStore.updateResource(props.blockId, topic.value.id, resourceId, updates)
}

const statusMap: Record<string, { color: 'gray' | 'yellow' | 'green', label: string }> = {
  nao_iniciado: { color: 'gray', label: 'Não iniciado' },
  not_started: { color: 'gray', label: 'Não iniciado' },
  em_andamento: { color: 'yellow', label: 'Em andamento' },
  in_progress: { color: 'yellow', label: 'Em andamento' },
  concluido: { color: 'green', label: 'Concluído' },
  completed: { color: 'green', label: 'Concluído' }
}
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div v-if="topic && block" class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(22rem,28rem)] gap-4 sm:gap-6 items-start xl:items-start">
        <section class="space-y-3 sm:space-y-4 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{{ block.title }}</p>
              <h1 class="text-2xl sm:text-3xl font-bold text-ink break-words">{{ topic.title }}</h1>
              <div class="mt-3 flex flex-wrap gap-2">
                <AppBadge :color="statusMap[topic.status].color" size="sm">
                  {{ statusMap[topic.status].label }}
                </AppBadge>
                <AppBadge color="blue" size="sm">
                  {{ topic.resources.length }} recurso{{ topic.resources.length === 1 ? '' : 's' }}
                </AppBadge>
              </div>
            </div>

            <AppButton variant="secondary" size="sm" class="w-full sm:w-auto" @click="showAddResourceModal = true">
              + Novo Recurso
            </AppButton>
          </div>

          <div class="p-3 border border-hairline rounded-lg bg-canvas-soft space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-ink-body mb-1">Tipo</label>
                <select
                  v-model="filterType"
                  class="w-full px-3 py-2 text-sm border border-hairline rounded-lg bg-canvas-soft text-ink"
                >
                  <option value="all">Todos</option>
                  <option value="youtube">YouTube</option>
                  <option value="drive">Google Drive</option>
                  <option value="document">Documento</option>
                  <option value="link">Link</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-ink-body mb-1">Ordenar</label>
                <select
                  v-model="sortBy"
                  class="w-full px-3 py-2 text-sm border border-hairline rounded-lg bg-canvas-soft text-ink"
                >
                <option value="added_desc">Mais recentes</option>
                <option value="added_asc">Mais antigos</option>
                <option value="rating_desc">Melhor rating</option>
              </select>
              </div>
            </div>
            <div class="text-xs text-ink-body">
              {{ filteredResources.length }} resultado{{ filteredResources.length === 1 ? '' : 's' }}
            </div>
          </div>

          <div v-if="filteredResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ResourceCard
              v-for="(resource, index) in filteredResources"
              :key="resource.id"
              :resource="resource"
              :can-move="true"
              :index="index"
              :total="filteredResources.length"
              removable
              @remove="removeResource(resource.id)"
              @toggleViewed="toggleResourceViewed(resource.id)"
              @open="maybeMarkViewed(resource.id)"
              @moveUp="moveResourceUp(resource.id)"
              @moveDown="moveResourceDown(resource.id)"
              @updateRating="(rating) => updateResourceRating(resource.id, rating)"
              @updateResource="(updates) => updateResource(resource.id, updates)"
            />
          </div>

          <div v-else class="p-6 border border-hairline rounded-lg bg-canvas-soft text-center text-ink-body">
            Nenhum recurso encontrado com os filtros atuais.
          </div>
        </section>

        <aside class="p-4 border border-hairline rounded-lg bg-canvas-soft xl:sticky xl:top-4 space-y-3">
          <div>
            <h2 class="text-sm font-semibold text-ink">Anotações do tópico</h2>
            <p class="text-xs text-ink-body mt-1">Este campo fica junto dos recursos do tópico.</p>
          </div>

          <textarea
            :value="topic.notes"
            @input="updateTopicNotes(($event.target as HTMLTextAreaElement).value)"
            rows="12"
            class="w-full px-3 py-2 text-sm border border-hairline rounded-lg bg-canvas-soft text-ink"
            placeholder="Anotações, dúvidas, links de revisão, resumo..."
          />

          <div class="text-xs text-gray-500 dark:text-gray-400">
            <span v-if="topicNotesStatus === 'saving'">Salvando…</span>
            <span v-else-if="topicNotesStatus === 'saved'">Salvo</span>
          </div>
        </aside>
      </div>
    </div>

    <AppModal
      :open="showAddResourceModal"
      title="Adicionar Recurso"
      submit-label="Adicionar"
      cancel-label="Cancelar"
      @submit="addResource"
      @cancel="showAddResourceModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Tipo
          </label>
          <select
            v-model="resourceType"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          >
            <option value="youtube">YouTube</option>
            <option value="drive">Google Drive</option>
            <option value="document">Documento</option>
            <option value="link">Link</option>
            <option value="local">Arquivo Local</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Título
          </label>
          <input
            v-model="resourceLabel"
            type="text"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          />
        </div>

        <div v-if="resourceType !== 'local' && !(resourceType === 'document' && documentIsLocal)">
          <label class="block text-sm font-medium text-ink-body mb-2">
            URL
          </label>
          <input
            v-model="resourceUrl"
            type="url"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          />

          <AppButton
            v-if="resourceType === 'document'"
            variant="secondary"
            size="sm"
            class="w-full mt-2"
            :loading="isSelectingLocalPath"
            @click="async () => { documentIsLocal = true; await selectLocalFolder() }"
          >
            {{ isSelectingLocalPath ? 'Selecionando...' : 'Selecionar no computador' }}
          </AppButton>
        </div>

        <div v-else-if="resourceType === 'local' || (resourceType === 'document' && documentIsLocal)" class="space-y-2">
          <label class="block text-sm font-medium text-ink-body">
            Caminho no computador
          </label>
          <input
            v-model="resourceUrl"
            type="text"
            readonly
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink opacity-70"
          />
          <AppButton
            variant="secondary"
            size="sm"
            class="w-full"
            :loading="isSelectingLocalPath"
            @click="selectLocalFolder"
          >
            {{ isSelectingLocalPath ? 'Selecionando...' : 'Selecionar pasta' }}
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
