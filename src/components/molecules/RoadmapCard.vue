<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Roadmap, RoadmapColor, RoadmapStatus } from '@/types'
import { PencilIcon, ChevronUpIcon, ChevronDownIcon, StarIcon, TrashIcon, CheckIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppProgressBar from '@/components/atoms/AppProgressBar.vue'
import AppModal from '@/components/atoms/AppModal.vue'
import AppConfirmModal from '@/components/atoms/AppConfirmModal.vue'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  roadmap: Roadmap
  roadmapId: string
  stats: {
    blocks: number
    topics: number
    resources: number
    percent: number
  }
  canMoveUp?: boolean
  canMoveDown?: boolean
  isEditing?: boolean
}

interface Emits {
  navigate: []
  moveUp: []
  moveDown: []
  edit: []
  updateRating: [rating: number]
  updateColor: [color: RoadmapColor]
  'update-roadmap': [updates: { title: string; description: string; rating: number; status: RoadmapStatus }]
  delete: [password?: string]
  'mark-complete': []
  'mark-incomplete': []
  'export': []
}

const props = withDefaults(defineProps<Props>(), {
  canMoveUp: false,
  canMoveDown: false,
  isEditing: false
})

const emit = defineEmits<Emits>()
const settingsStore = useSettingsStore()

// Add complete functionality
const isCompleted = computed(() => {
  return props.stats.percent === 100
})

const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editRating = ref(0)
const editColor = ref<RoadmapColor>('blue')
const editStatus = ref<RoadmapStatus>('ativo')

const DESCRIPTION_MAX = 240

const hasDeletePassword = computed(() => Boolean(settingsStore.settings.deletePassword?.trim()))

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 1 ? 'Agora' : `Há ${diffMinutes} min`
    }
    return diffHours === 1 ? 'Há 1 hora' : `Há ${diffHours} horas`
  } else if (diffDays === 1) {
    return 'Ontem'
  } else if (diffDays < 7) {
    return `Há ${diffDays} dias`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? 'Há 1 semana' : `Há ${weeks} semanas`
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }
}

// Design System Vercel Colors + Accents
const colors: { color: RoadmapColor; label: string; class: string; hex: string; gradient?: string }[] = [
  { color: 'blue', label: 'Develop', class: 'bg-blue-500', hex: '#007cf0', gradient: 'from-blue-500 to-cyan-400' },
  { color: 'purple', label: 'Preview', class: 'bg-purple-500', hex: '#7928ca', gradient: 'from-purple-600 to-pink-500' },
  { color: 'red', label: 'Ship', class: 'bg-red-500', hex: '#ff4d4d', gradient: 'from-red-500 to-amber-400' },
  { color: 'green', label: 'Sage', class: 'bg-green-500', hex: '#10b981', gradient: 'from-green-500 to-teal-400' },
  { color: 'pink', label: 'Highlight', class: 'bg-pink-500', hex: '#ff0080', gradient: 'from-pink-500 to-rose-400' },
  { color: 'yellow', label: 'Amber', class: 'bg-amber-500', hex: '#f9cb28', gradient: 'from-amber-400 to-orange-500' },
  { color: 'orange', label: 'Coral', class: 'bg-orange-500', hex: '#ff6b35', gradient: 'from-orange-500 to-red-400' },
  { color: 'gray', label: 'Neutral', class: 'bg-gray-500', hex: '#6b7280', gradient: 'from-gray-500 to-gray-600' }
]

const getColorClass = (color?: RoadmapColor) => {
  const colorObj = colors.find(c => c.color === color)
  return colorObj?.class || colors[0].class
}

const colorHex = computed(() => {
  const map: Record<RoadmapColor, string> = {
    blue: '#007cf0',
    red: '#ff4d4d',
    green: '#10b981',
    yellow: '#f9cb28',
    purple: '#7928ca',
    pink: '#ff0080',
    orange: '#ff6b35',
    gray: '#6b7280'
  }
  return map[props.roadmap.color || 'blue']
})

const colorGradient = computed(() => {
  const colorObj = colors.find(c => c.color === (props.roadmap.color || 'blue'))
  return colorObj?.gradient || 'from-blue-500 to-cyan-400'
})

const openEditModal = () => {
  editTitle.value = props.roadmap.title
  editDescription.value = props.roadmap.description
  editRating.value = props.roadmap.rating || 0
  editColor.value = props.roadmap.color || 'blue'
  editStatus.value = (props.roadmap.status || 'ativo') as RoadmapStatus
  showEditModal.value = true
}

const saveEdit = () => {
  emit('update-roadmap', {
    title: editTitle.value.trim() || props.roadmap.title,
    description: (editDescription.value || '').slice(0, DESCRIPTION_MAX),
    rating: Math.max(0, Math.min(5, editRating.value || 0)),
    status: editStatus.value
  })
  if (editColor.value !== props.roadmap.color) {
    emit('updateColor', editColor.value)
  }
  showEditModal.value = false
}

const setRating = (rating: number) => {
  editRating.value = rating
}

const displayRating = computed(() => props.roadmap.rating ?? 0)

const statusLabel = computed(() => {
  const map: Record<RoadmapStatus, string> = {
    ativo: 'Ativo',
    pausado: 'Pausado',
    concluido: 'Concluído'
  }
  return map[(props.roadmap.status || 'ativo') as RoadmapStatus]
})

const statusBadgeClasses = computed(() => {
  const map: Record<RoadmapStatus, string> = {
    ativo: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    pausado: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    concluido: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
  }
  return map[(props.roadmap.status || 'ativo') as RoadmapStatus]
})

const isExample = computed(() => {
  return props.roadmap.isTemplate === true
})

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = (password: string) => {
  showDeleteConfirm.value = false
  emit('delete', password)
}
</script>

<template>
  <div
    class="relative rounded-xl bg-canvas group border border-hairline flex flex-col h-full cursor-pointer transition-all duration-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-hairline-strong"
    @click="$emit('navigate')"
  >
    <!-- Gradient accent bar -->
    <div class="h-[3px]" :style="{ background: `linear-gradient(90deg, ${colorHex}, ${colorHex}66)` }" />

    <!-- Tinted header -->
    <div class="px-5 pt-4 pb-3" :style="{ background: `${colorHex}0d` }">
      <!-- Title row -->
      <div class="flex items-start justify-between gap-2 mb-2.5">
        <h3 class="text-base font-semibold text-ink leading-snug tracking-tight break-words flex-1">
          {{ roadmap.title }}
        </h3>
        <span
          v-if="isExample"
          class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap bg-canvas-soft-2 text-ink-body border border-hairline font-medium shrink-0"
        >
          Template
        </span>
      </div>

      <!-- Status badge + Rating -->
      <div class="flex items-center justify-between">
        <span class="text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap" :class="statusBadgeClasses">
          {{ statusLabel }}
        </span>
        <div class="flex items-center gap-0.5">
          <StarSolidIcon v-for="i in displayRating" :key="i" class="w-3.5 h-3.5 text-ds-warning" />
          <StarIcon v-for="i in 5 - displayRating" :key="`empty-${i}`" class="w-3.5 h-3.5 text-ink-mute" />
          <span class="text-xs text-ink-mute ml-1">{{ displayRating }}/5</span>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="px-5 py-3 flex flex-col flex-1 space-y-3">
      <!-- Description -->
      <p v-if="roadmap.description" class="text-sm text-ink-body roadmap-desc-clamp leading-relaxed">
        {{ roadmap.description }}
      </p>

      <!-- Category, Tags and Visibility -->
      <div
        v-if="roadmap.category || (roadmap.tags && roadmap.tags.length > 0) || roadmap.visibility === 'public'"
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-if="roadmap.category"
          class="text-xs px-2 py-0.5 rounded-full bg-canvas-soft-2 text-ink-body border border-hairline"
        >
          {{ roadmap.category }}
        </span>
        <span
          v-for="tag in (roadmap.tags || [])"
          :key="tag"
          class="text-xs px-2 py-0.5 rounded-full bg-canvas-soft-2 text-ink-body border border-hairline"
        >
          {{ tag }}
        </span>
        <span
          v-if="roadmap.visibility === 'public'"
          class="text-xs px-2 py-0.5 rounded-full bg-canvas-soft-2 text-ink-body border border-hairline flex items-center gap-1"
        >
          <AppIcon name="eye" size="xs" />
          Público
        </span>
      </div>

      <!-- Stats — 3 columns -->
      <div class="grid grid-cols-3 gap-0 border border-hairline rounded-lg overflow-hidden">
        <div class="text-center py-2.5 px-1">
          <div class="text-base font-bold text-ink tracking-tight">{{ stats.blocks }}</div>
          <div class="text-xs text-ink-mute leading-none mt-0.5">{{ pluralize(stats.blocks, 'módulo', 'módulos') }}</div>
        </div>
        <div class="text-center py-2.5 px-1 border-x border-hairline">
          <div class="text-base font-bold text-ink tracking-tight">{{ stats.topics }}</div>
          <div class="text-xs text-ink-mute leading-none mt-0.5">{{ pluralize(stats.topics, 'tópico', 'tópicos') }}</div>
        </div>
        <div class="text-center py-2.5 px-1">
          <div class="text-base font-bold text-ink tracking-tight">{{ stats.resources }}</div>
          <div class="text-xs text-ink-mute leading-none mt-0.5">{{ pluralize(stats.resources, 'recurso', 'recursos') }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom: progress + actions -->
    <div class="px-5 pb-4 pt-1 space-y-3 border-t border-hairline mt-auto">
      <!-- Progress -->
      <div class="pt-3">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-medium text-ink-body">Progresso</span>
          <span class="text-sm font-bold" :style="{ color: colorHex }">{{ stats.percent }}%</span>
        </div>
        <AppProgressBar :value="stats.percent" />
      </div>

      <!-- Actions + timestamp -->
      <div class="flex items-center justify-between gap-1">
        <div class="flex items-center gap-0.5">
          <AppButton
            variant="ghost"
            size="sm"
            @click="(e) => { e.stopPropagation(); openEditModal() }"
            title="Editar roadmap"
          >
            <PencilIcon class="w-4 h-4" />
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            @click="(e) => { e.stopPropagation(); $emit('export') }"
            title="Exportar roadmap"
          >
            <AppIcon name="download" size="sm" class="text-ink-body" />
          </AppButton>
          <AppButton
            :variant="isCompleted ? 'secondary' : 'ghost'"
            size="sm"
            @click="(e) => { e.stopPropagation(); $emit(isCompleted ? 'mark-incomplete' : 'mark-complete') }"
            :title="isCompleted ? 'Desmarcar como concluído' : 'Marcar como concluído'"
          >
            <CheckCircleIcon v-if="isCompleted" class="w-4 h-4" />
            <CheckIcon v-else class="w-4 h-4" />
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            @click="(e) => { e.stopPropagation(); confirmDelete() }"
            title="Deletar roadmap"
          >
            <TrashIcon class="w-4 h-4 text-ds-error" />
          </AppButton>
        </div>

        <div class="flex items-center gap-1">
          <div v-if="canMoveUp || canMoveDown" class="flex items-center gap-0.5">
            <AppButton
              v-if="canMoveUp"
              variant="ghost"
              size="sm"
              @click="(e) => { e.stopPropagation(); $emit('moveUp') }"
              title="Mover para cima"
            >
              <ChevronUpIcon class="w-3.5 h-3.5" />
            </AppButton>
            <AppButton
              v-if="canMoveDown"
              variant="ghost"
              size="sm"
              @click="(e) => { e.stopPropagation(); $emit('moveDown') }"
              title="Mover para baixo"
            >
              <ChevronDownIcon class="w-3.5 h-3.5" />
            </AppButton>
          </div>
          <span class="text-xs text-ink-mute">{{ formatDate(roadmap.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <AppConfirmModal
      :open="showDeleteConfirm"
      title="Deletar Roadmap"
      message="Tem certeza que deseja deletar este roadmap? Esta ação é irreversível."
      require-password
      submit-label="Deletar"
      cancel-label="Cancelar"
      @submit="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Edit Modal -->
    <AppModal
      :open="showEditModal"
      title="Editar Roadmap"
      submit-label="Salvar"
      cancel-label="Cancelar"
      @submit="saveEdit"
      @cancel="showEditModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Título
          </label>
          <input
            v-model="editTitle"
            type="text"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Descrição
          </label>
          <textarea
            v-model="editDescription"
            rows="3"
            :maxlength="DESCRIPTION_MAX"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          />
          <p class="text-xs text-ink-body mt-1">
            {{ (editDescription?.length || 0) }}/{{ DESCRIPTION_MAX }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Avaliação
          </label>
          <div class="flex gap-2">
            <button
              v-for="i in 5"
              :key="i"
              @click="setRating(i)"
              class="p-1 rounded hover:bg-canvas-soft-2"
            >
              <StarSolidIcon
                v-if="i <= editRating"
                class="w-5 h-5 text-ds-warning"
              />
              <StarIcon
                v-else
                class="w-5 h-5 text-hairline"
              />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Cor
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in colors"
              :key="c.color"
              @click="editColor = c.color"
              :class="[
                c.class,
                'w-8 h-8 rounded-lg border-2 transition-all',
                editColor === c.color ? 'border-ink' : 'border-transparent'
              ]"
              :title="c.label"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-body mb-2">
            Status
          </label>
          <select
            v-model="editStatus"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
          >
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <div class="text-xs text-ink-body">
          Senha para deletar roadmap: <span class="font-semibold">{{ hasDeletePassword ? 'configurada' : 'não configurada' }}</span>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.roadmap-desc-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
