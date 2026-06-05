<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/atoms/AppModal.vue'
import { getColor } from '@/utils/colorSystem'
import type { Block } from '@/types'

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

const title = ref('')
const description = ref('')
const category = ref('')
const tags = ref('')
const visibility = ref<'public' | 'private'>('private')

function handleSubmit() {
  if (!title.value.trim()) {
    alert('Digite um título para o roadmap')
    return
  }

  const tagArray = tags.value.trim()
    ? tags.value.split(',').map(t => t.trim()).filter(t => t)
    : []

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value.trim() || '',
    tags: tagArray,
    visibility: visibility.value,
    blocks: []
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
}
</script>

<template>
  <AppModal
    :open="open"
    title="Criar Novo Roadmap"
    submit-label="Criar"
    cancel-label="Cancelar"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <!-- Color accent bar -->
    <div class="h-1 -mx-6 -mt-6 mb-6" :style="{ background: getColor('develop').start }" />

    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: getColor('develop').start }">
          Título do Roadmap
        </label>
        <input
          v-model="title"
          type="text"
          placeholder="Ex: Gramática, Redação, Análise Combinatória"
          class="w-full px-4 py-3 border border-hairline rounded-lg bg-canvas-soft text-ink text-base"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: getColor('preview').start }">
          Descrição
        </label>
        <textarea
          v-model="description"
          placeholder="Descreva o foco deste roadmap..."
          rows="3"
          class="w-full px-4 py-3 border rounded-lg bg-canvas-soft text-ink text-base"
          :style="{ borderColor: getColor('preview').start + '40' }"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: getColor('ship').start }">
          Categoria
        </label>
        <input
          v-model="category"
          type="text"
          placeholder="Ex: programação, direito, dados"
          class="w-full px-4 py-3 border rounded-lg bg-canvas-soft text-ink text-base"
          :style="{ borderColor: getColor('ship').start + '40' }"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: getColor('warning').start }">
          Tags (separadas por vírgula)
        </label>
        <input
          v-model="tags"
          type="text"
          placeholder="Ex: concursos, estudo, preparação"
          class="w-full px-4 py-3 border rounded-lg bg-canvas-soft text-ink text-base"
          :style="{ borderColor: getColor('warning').start + '40' }"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-ink-body mb-2">
          Visibilidade
        </label>
        <div class="flex gap-4">
          <label class="flex items-center">
            <input
              v-model="visibility"
              type="radio"
              value="private"
              class="mr-2"
            />
            <span class="text-sm text-ink-body">Privado</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="visibility"
              type="radio"
              value="public"
              class="mr-2"
            />
            <span class="text-sm text-ink-body">Público</span>
          </label>
        </div>
      </div>
    </div>
  </AppModal>
</template>
