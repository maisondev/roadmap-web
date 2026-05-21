<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/atoms/AppModal.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Block, Resource, ResourceType, Topic } from '@/types'

interface Props {
  open: boolean
}

type AiResource = {
  type: string
  title: string
  url: string
}

type AiTopic = {
  title: string
  notes: string
  resources: AiResource[]
}

type AiBlock = {
  title: string
  topics: AiTopic[]
}

type AiRoadmapPreview = {
  title: string
  description: string
  category: string
  tags: string[]
  blocks: AiBlock[]
}

defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  submit: [data: { title: string; description: string; category: string; tags: string[]; visibility: 'public' | 'private'; blocks: Block[] }]
}>()

const authStore = useAuthStore()

const title = ref('')
const description = ref('')
const category = ref('')
const tags = ref('')
const visibility = ref<'public' | 'private'>('private')
const aiTopic = ref('')
const aiLanguage = ref<'pt' | 'en'>('pt')
const aiLevel = ref<'beginner' | 'intermediate' | 'advanced'>('beginner')
const aiBlocks = ref<Block[]>([])
const isGenerating = ref(false)
const aiError = ref('')
const generatedSummary = ref('')

function mapResourceType(type: string, url: string): ResourceType {
  const normalized = type.toLowerCase()
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (normalized === 'video') return 'link'
  return 'link'
}

function mapAiPreviewToBlocks(blocks: AiBlock[]): Block[] {
  const seed = Date.now()
  return blocks.map((block, blockIndex) => ({
    id: `ai-block-${seed}-${blockIndex}`,
    order: blockIndex,
    title: block.title,
    priority: 'normal',
    topics: block.topics.map((topic, topicIndex): Topic => ({
      id: `ai-topic-${seed}-${blockIndex}-${topicIndex}`,
      order: topicIndex,
      title: topic.title,
      description: topic.notes,
      notes: topic.notes,
      status: 'nao_iniciado',
      questoesSolvidas: 0,
      acertoPercent: 0,
      resources: topic.resources.map((resource, resourceIndex): Resource => ({
        id: `ai-resource-${seed}-${blockIndex}-${topicIndex}-${resourceIndex}`,
        type: mapResourceType(resource.type, resource.url),
        title: resource.title,
        label: resource.title,
        url: resource.url,
        addedAt: new Date().toISOString(),
        viewed: false,
        rating: 0
      }))
    }))
  }))
}

async function handleGenerateAi() {
  const promptTopic = aiTopic.value.trim()
  if (!promptTopic) {
    aiError.value = 'Informe um tema para gerar o roadmap.'
    return
  }

  if (!authStore.isLoggedIn) {
    aiError.value = 'Faça login para usar a geração com IA.'
    return
  }

  isGenerating.value = true
  aiError.value = ''
  generatedSummary.value = ''

  try {
    const preview = await api.post('/api/roadmaps/generate-preview', {
      topic: promptTopic,
      language: aiLanguage.value,
      level: aiLevel.value
    }) as AiRoadmapPreview

    title.value = preview.title || promptTopic
    description.value = preview.description || ''
    category.value = preview.category || ''
    tags.value = (preview.tags || []).join(', ')
    aiBlocks.value = mapAiPreviewToBlocks(preview.blocks || [])
    generatedSummary.value = `${aiBlocks.value.length} bloco(s) e ${aiBlocks.value.reduce((acc, block) => acc + block.topics.length, 0)} tópico(s) gerados.`
  } catch (error) {
    aiError.value = error instanceof Error ? error.message : 'Erro ao gerar roadmap com IA.'
  } finally {
    isGenerating.value = false
  }
}

function handleSubmit() {
  if (!title.value.trim()) {
    aiError.value = 'Gere um roadmap antes de salvar.'
    return
  }

  const tagArray = tags.value.trim()
    ? tags.value.split(',').map(tag => tag.trim()).filter(Boolean)
    : []

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value.trim(),
    tags: tagArray,
    visibility: visibility.value,
    blocks: aiBlocks.value
  })

  resetForm()
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

function resetForm() {
  title.value = ''
  description.value = ''
  category.value = ''
  tags.value = ''
  visibility.value = 'private'
  aiTopic.value = ''
  aiLanguage.value = 'pt'
  aiLevel.value = 'beginner'
  aiBlocks.value = []
  isGenerating.value = false
  aiError.value = ''
  generatedSummary.value = ''
}
</script>

<template>
  <AppModal
    :open="open"
    title="Gerar Roadmap com IA"
    submit-label="Criar Roadmap"
    cancel-label="Cancelar"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="space-y-5">
      <section class="space-y-4 rounded-lg border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div class="grid gap-3 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tema</label>
            <input
              v-model="aiTopic"
              type="text"
              placeholder="Ex: React, Direito Constitucional, Python para dados"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</label>
            <select v-model="aiLanguage" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nível</label>
            <select v-model="aiLevel" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ isGenerating ? 'Gerando estrutura...' : generatedSummary || 'A IA vai preencher o roadmap e você ainda poderá revisar antes de salvar.' }}
          </div>
          <button
            type="button"
            :disabled="isGenerating || !authStore.isLoggedIn"
            class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleGenerateAi"
          >
            {{ isGenerating ? 'Gerando...' : 'Gerar com IA' }}
          </button>
        </div>

        <p v-if="aiError" class="text-sm text-red-600 dark:text-red-400">{{ aiError }}</p>
      </section>

      <div class="grid gap-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
          <input v-model="title" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <textarea v-model="description" rows="3" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <input v-model="category" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Visibilidade</label>
            <select v-model="visibility" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="private">Privado</option>
              <option value="public">Público</option>
            </select>
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
          <input v-model="tags" type="text" placeholder="react, frontend, hooks" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
      </div>
    </div>
  </AppModal>
</template>
