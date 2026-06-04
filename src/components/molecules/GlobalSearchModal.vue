<script setup lang="ts">
import { ref, computed } from 'vue'
import AppModal from '@/components/atoms/AppModal.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

interface Props {
  open: boolean
  roadmaps?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  navigate: [result: any]
}>()

const searchQuery = ref('')
const results = ref<any[]>([])

const hasSearched = computed(() => searchQuery.value.trim().length > 0)

function performSearch() {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }

  const query = searchQuery.value.toLowerCase().trim()
  const searchResults: any[] = []

  Object.values(props.roadmaps || {}).forEach((roadmap: any) => {
    // Search in roadmap title and description
    if (roadmap.title.toLowerCase().includes(query) || roadmap.description.toLowerCase().includes(query)) {
      searchResults.push({
        type: 'roadmap',
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        roadmapTitle: roadmap.title,
        category: roadmap.category,
        tags: roadmap.tags
      })
    }

    // Search in blocks
    roadmap.blocks.forEach((block: any) => {
      if (block.title.toLowerCase().includes(query)) {
        searchResults.push({
          type: 'block',
          id: block.id,
          title: block.title,
          description: '',
          roadmapTitle: roadmap.title,
          roadmapId: roadmap.id,
          category: roadmap.category,
          tags: roadmap.tags
        })
      }

      // Search in topics
      block.topics.forEach((topic: any) => {
        if (
          topic.title.toLowerCase().includes(query) ||
          (topic.description && topic.description.toLowerCase().includes(query))
        ) {
          searchResults.push({
            type: 'topic',
            id: topic.id,
            title: topic.title,
            description: topic.description || '',
            roadmapTitle: roadmap.title,
            roadmapId: roadmap.id,
            blockId: block.id,
            blockTitle: block.title,
            category: roadmap.category,
            tags: roadmap.tags
          })
        }

        // Search in resources
        topic.resources.forEach((resource: any) => {
          if (resource.title.toLowerCase().includes(query) || resource.url.toLowerCase().includes(query)) {
            searchResults.push({
              type: 'resource',
              id: resource.id,
              title: resource.title,
              description: resource.url,
              roadmapTitle: roadmap.title,
              roadmapId: roadmap.id,
              blockId: block.id,
              blockTitle: block.title,
              topicId: topic.id,
              topicTitle: topic.title,
              category: roadmap.category,
              tags: roadmap.tags
            })
          }
        })
      })
    })
  })

  results.value = searchResults
}

function handleNavigate(result: any) {
  emit('navigate', result)
  searchQuery.value = ''
  results.value = []
}

function handleCancel() {
  searchQuery.value = ''
  results.value = []
  emit('cancel')
}
</script>

<template>
  <AppModal
    :open="open"
    title="Busca Global"
    submit-label="Buscar"
    cancel-label="Fechar"
    @submit="performSearch"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-ink-body mb-2">
          Buscar em todos os roadmaps
        </label>
        <input
          v-model="searchQuery"
          type="text"
          class="w-full px-4 py-3 border border-hairline rounded-lg bg-canvas-soft text-ink text-base"
          placeholder="Digite para buscar roadmaps, módulos, tópicos ou recursos..."
          @keyup.enter="performSearch"
        />
      </div>

      <!-- Search Results -->
      <div v-if="results.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
        <div class="text-sm font-medium text-ink-body">
          Resultados encontrados ({{ results.length }})
        </div>

        <div
          v-for="result in results"
          :key="`${result.type}-${result.id}`"
          @click="handleNavigate(result)"
          class="p-3 border border-hairline rounded-lg bg-canvas hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs px-2 py-1 rounded"
                  :class="{
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300': result.type === 'roadmap',
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': result.type === 'block',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': result.type === 'topic',
                    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300': result.type === 'resource'
                  }"
                >
                  {{
                    result.type === 'roadmap'
                      ? 'Roadmap'
                      : result.type === 'block'
                        ? 'Módulo'
                        : result.type === 'topic'
                          ? 'Tópico'
                          : 'Recurso'
                  }}
                </span>
                <h4 class="font-semibold text-ink truncate">
                  {{ result.title }}
                </h4>
              </div>
              <p v-if="result.description" class="text-sm text-ink-body truncate">
                {{ result.description }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ result.roadmapTitle }}
                </span>
                <span
                  v-if="result.category"
                  class="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  {{ result.category }}
                </span>
              </div>
              <div v-if="result.tags && result.tags.length > 0" class="flex gap-1 mt-1">
                <span
                  v-for="tag in result.tags.slice(0, 3)"
                  :key="tag"
                  class="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  {{ tag }}
                </span>
                <span v-if="result.tags.length > 3" class="text-xs text-gray-500 dark:text-gray-400">
                  +{{ result.tags.length - 3 }}
                </span>
              </div>
            </div>
            <AppIcon name="chevron-right" size="sm" class="text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-else-if="hasSearched && results.length === 0" class="text-center py-6">
        <p class="text-ink-body">
          Nenhum resultado encontrado para "{{ searchQuery }}"
        </p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!hasSearched" class="text-center py-6">
        <p class="text-ink-body">
          Digite algo para buscar em todos os seus roadmaps
        </p>
      </div>
    </div>
  </AppModal>
</template>
