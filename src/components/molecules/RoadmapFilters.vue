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
  <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div class="relative flex-1 sm:flex-initial">
        <input
          v-model="filterName"
          type="text"
          placeholder="Buscar roadmaps..."
          class="w-full sm:w-64 px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        <AppIcon name="search" size="sm" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <select
        v-model="filterStatus"
        class="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
      >
        <option value="all">Todos os status</option>
        <option value="ativo">Ativos</option>
        <option value="pausado">Pausados</option>
        <option value="concluido">Concluídos</option>
      </select>
    </div>

    <!-- Buttons -->
    <div class="flex items-center gap-3">
      <AppButton
        variant="primary"
        size="md"
        @click="emit('create')"
        class="flex items-center gap-2 flex-shrink-0"
      >
        <AppIcon name="plus" size="sm" />
        Novo Roadmap
      </AppButton>
      <AppButton
        variant="secondary"
        size="md"
        @click="emit('generate')"
        class="flex items-center gap-2 flex-shrink-0"
      >
        <AppIcon name="sparkles" size="sm" />
        Gerar com IA
      </AppButton>
      <AppButton
        variant="ghost"
        size="sm"
        @click="emit('import')"
        class="flex items-center gap-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Importar um roadmap"
      >
        <AppIcon name="upload" size="sm" />
        <span class="hidden sm:inline">Importar</span>
      </AppButton>
    </div>
  </div>
</template>
