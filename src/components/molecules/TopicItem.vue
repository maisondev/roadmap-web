<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Topic } from '@/types'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AppCheckbox from '@/components/atoms/AppCheckbox.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppTag from '@/components/atoms/AppTag.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppModal from '@/components/atoms/AppModal.vue'
import AppConfirmModal from '@/components/atoms/AppConfirmModal.vue'

interface Props {
  topic: Topic
  blockId: string
  index?: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  total: 0
})

const emit = defineEmits<{
  'update:status': [value: string]
  'update:title': [title: string]
  'delete': []
  open: []
  'move-up': []
  'move-down': []
}>()

const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editTitle = ref(props.topic.title)

const statusMap: Record<string, { color: 'gray' | 'yellow' | 'green', label: string }> = {
  nao_iniciado: { color: 'gray', label: 'Não iniciado' },
  not_started: { color: 'gray', label: 'Não iniciado' },
  em_andamento: { color: 'yellow', label: 'Em andamento' },
  in_progress: { color: 'yellow', label: 'Em andamento' },
  concluido: { color: 'green', label: 'Concluído' },
  completed: { color: 'green', label: 'Concluído' }
}

const resourceCounts = computed<Record<'youtube' | 'drive' | 'document' | 'link' | 'local', number>>(() => {
  return props.topic.resources.reduce(
    (acc, r) => {
      acc[r.type] += 1
      return acc
    },
    { youtube: 0, drive: 0, document: 0, link: 0, local: 0 }
  )
})

function typeLabel(type: keyof typeof resourceCounts.value): string {
  const map: Record<string, string> = {
    youtube: 'YouTube',
    drive: 'Drive',
    document: 'Doc',
    link: 'Link',
    local: 'Local'
  }
  return map[type as string] ?? String(type)
}

function typeColor(type: keyof typeof resourceCounts.value): 'blue' | 'purple' | 'yellow' | 'gray' | 'red' {
  if (type === 'youtube') return 'red'
  if (type === 'drive') return 'yellow'
  if (type === 'document') return 'purple'
  if (type === 'local') return 'gray'
  return 'blue'
}

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < (props.total ?? 0) - 1)

const statusHex = computed(() => {
  const map: Record<string, string> = {
    nao_iniciado: '#6b7280',
    not_started: '#6b7280',
    em_andamento: '#f59e0b',
    in_progress: '#f59e0b',
    concluido: '#10b981',
    completed: '#10b981'
  }
  return map[props.topic.status] ?? '#6b7280'
})

const statusBadgeClasses = computed(() => {
  const s = props.topic.status
  if (s === 'concluido' || s === 'completed')
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
  if (s === 'em_andamento' || s === 'in_progress')
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
  return 'bg-canvas-soft-2 text-ink-body'
})

const visibleResourceTypes = computed(() =>
  (Object.keys(resourceCounts.value) as Array<keyof typeof resourceCounts.value>)
    .filter(type => resourceCounts.value[type] > 0)
)

const resourceDotColor: Record<string, string> = {
  youtube: 'bg-red-500',
  drive:   'bg-amber-500',
  document:'bg-violet-500',
  link:    'bg-blue-500',
  local:   'bg-gray-500'
}

function handleStatusChange(newStatus: boolean | 'indeterminate') {
  let status = 'not_started'
  if (newStatus === true) {
    status = 'completed'
  } else if (newStatus === 'indeterminate') {
    status = 'in_progress'
  }
  emit('update:status', status)
}

function openEditModal() {
  editTitle.value = props.topic.title
  showEditModal.value = true
}

function saveTitle() {
  if (editTitle.value.trim()) {
    emit('update:title', editTitle.value.trim())
    showEditModal.value = false
  }
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function handleDeleteConfirm() {
  showDeleteConfirm.value = false
  emit('delete')
}
</script>

<template>
  <div
    class="group border border-hairline rounded-xl bg-canvas hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:border-hairline-strong flex flex-col overflow-hidden"
  >
    <!-- Status accent bar -->
    <div
      class="h-[3px]"
      :style="{ background: `linear-gradient(90deg, ${statusHex}, ${statusHex}66)` }"
    />

    <!-- Tinted header: checkbox + title + status badge -->
    <div class="px-4 pt-3 pb-2.5" :style="{ background: `${statusHex}0d` }">
      <div class="flex items-start gap-3">
        <div class="pt-0.5 shrink-0" @click.stop>
          <AppCheckbox
            :model-value="topic.status === 'completed' || topic.status === 'concluido' ? true : topic.status === 'in_progress' || topic.status === 'em_andamento' ? 'indeterminate' : false"
            @update:model-value="handleStatusChange"
          />
        </div>
        <div class="flex-1 min-w-0 cursor-pointer" @click="emit('open')">
          <p class="font-semibold text-ink break-words leading-snug tracking-tight">{{ topic.title }}</p>
          <div class="mt-1.5">
            <span class="text-xs px-2.5 py-0.5 rounded-full font-medium" :class="statusBadgeClasses">
              {{ statusMap[topic.status]?.label ?? topic.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resource tags + questions -->
    <div
      v-if="visibleResourceTypes.length > 0 || topic.questoesSolvidas > 0"
      class="px-4 py-2.5 flex flex-wrap gap-1.5 cursor-pointer"
      @click="emit('open')"
    >
      <span
        v-for="type in visibleResourceTypes"
        :key="type"
        class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-canvas-soft-2 text-ink-body border border-hairline"
      >
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="resourceDotColor[type]" />
        {{ resourceCounts[type] }} {{ typeLabel(type) }}
      </span>
      <span
        v-if="topic.questoesSolvidas > 0"
        class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
      >
        {{ topic.questoesSolvidas }} questões
      </span>
    </div>

    <!-- Action bar -->
    <div class="flex items-center gap-0.5 mt-auto px-3 py-2 border-t border-hairline">
      <AppButton
        variant="ghost"
        size="sm"
        @click="(e) => { e.stopPropagation(); openEditModal() }"
        title="Editar título"
      >
        <PencilIcon class="w-4 h-4" />
      </AppButton>
      <AppButton
        v-if="canMoveUp"
        variant="ghost"
        size="sm"
        @click="(e) => { e.stopPropagation(); emit('move-up') }"
        title="Mover tópico para cima"
      >
        <AppIcon name="chevron-up" size="sm" />
      </AppButton>
      <AppButton
        v-if="canMoveDown"
        variant="ghost"
        size="sm"
        @click="(e) => { e.stopPropagation(); emit('move-down') }"
        title="Mover tópico para baixo"
      >
        <AppIcon name="chevron-down" size="sm" />
      </AppButton>
      <AppButton
        variant="ghost"
        size="sm"
        @click="(e) => { e.stopPropagation(); confirmDelete() }"
        title="Deletar tópico"
        class="ml-auto"
      >
        <TrashIcon class="w-4 h-4 text-ds-error" />
      </AppButton>
    </div>
  </div>

  <!-- Edit Title Modal -->
  <AppModal
    :open="showEditModal"
    title="Editar Título do Tópico"
    submit-label="Salvar"
    cancel-label="Cancelar"
    @submit="saveTitle"
    @cancel="showEditModal = false"
  >
    <div>
      <label class="block text-sm font-medium text-ink-body mb-2">
        Título
      </label>
      <input
        v-model="editTitle"
        type="text"
        class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
        @keyup.enter="saveTitle"
      />
    </div>
  </AppModal>

  <!-- Delete Confirm Modal -->
  <AppConfirmModal
    :open="showDeleteConfirm"
    title="Deletar Tópico"
    message="Tem certeza que deseja deletar este tópico? Todos os recursos associados também serão removidos."
    submit-label="Deletar"
    cancel-label="Cancelar"
    @submit="handleDeleteConfirm"
    @cancel="showDeleteConfirm = false"
  />
</template>
