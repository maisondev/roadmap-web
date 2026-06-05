<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

interface FilterModel {
  status: 'all' | 'ativo' | 'pausado' | 'concluido'
}

interface Props {
  modelValue: FilterModel
  onSearch?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  onSearch: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel]
  create: []
  generate: []
  import: []
  search: []
}>()

const filterStatus = computed({
  get: () => props.modelValue.status,
  set: (value) => emit('update:modelValue', { ...props.modelValue, status: value })
})
</script>

<template>
  <div class="space-y-3">
    <!-- Row 1: Search + Status -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <!-- Busca Global -->
      <div class="flex-1">
        <AppButton
          variant="secondary"
          size="sm"
          @click="emit('search')"
          class="w-full flex items-center gap-2 justify-center sm:justify-start"
        >
          <AppIcon name="search" size="sm" />
          <span class="hidden sm:inline">Busca Global</span>
          <span class="sm:hidden">Buscar</span>
        </AppButton>
      </div>

      <!-- Status Filter -->
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

    <!-- Row 2: Action Buttons -->
    <div class="flex gap-2 flex-wrap">
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
        class="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
        title="Importar um roadmap"
      >
        <AppIcon name="upload" size="sm" />
        <span>Importar</span>
      </AppButton>
    </div>
  </div>
</template>
