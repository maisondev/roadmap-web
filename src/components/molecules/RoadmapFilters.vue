<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

interface FilterModel {
  name: string
  status: 'all' | 'ativo' | 'pausado' | 'concluido'
}

interface Props {
  modelValue: FilterModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel]
  create: []
  generate: []
  import: []
}>()

const filterName = computed({
  get: () => props.modelValue.name,
  set: (value) => emit('update:modelValue', { ...props.modelValue, name: value })
})

const filterStatus = computed({
  get: () => props.modelValue.status,
  set: (value) => emit('update:modelValue', { ...props.modelValue, status: value })
})
</script>

<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 w-full">
      <div class="relative flex-1">
        <input
          v-model="filterName"
          type="text"
          placeholder="Buscar roadmaps..."
          class="w-full px-3 py-2 pl-10 border border-hairline rounded-lg bg-canvas-soft text-ink text-sm"
        />
        <AppIcon name="search" size="sm" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <select
        v-model="filterStatus"
        class="px-4 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink text-sm"
      >
        <option value="all">Todos os status</option>
        <option value="ativo">Ativos</option>
        <option value="pausado">Pausados</option>
        <option value="concluido">Concluídos</option>
      </select>
    </div>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <AppButton
        variant="primary"
        size="sm"
        @click="emit('create')"
        class="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
      >
        <AppIcon name="plus" size="sm" />
        <span>Novo</span>
      </AppButton>
      <AppButton
        variant="secondary"
        size="sm"
        @click="emit('generate')"
        class="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
      >
        <AppIcon name="sparkles" size="sm" />
        <span>IA</span>
      </AppButton>
      <AppButton
        variant="ghost"
        size="sm"
        @click="emit('import')"
        class="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-3 text-ink-body hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Importar um roadmap"
      >
        <AppIcon name="upload" size="sm" />
        <span class="hidden sm:inline">Importar</span>
      </AppButton>
    </div>
  </div>
</template>
