<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

interface Props {
  open: boolean
  title: string
  submitLabel?: string
  cancelLabel?: string
  submitVariant?: 'primary' | 'danger'
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Salvar',
  cancelLabel: 'Cancelar',
  submitVariant: 'primary',
  showFooter: true
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('cancel')
    return
  }

  if (e.key === 'Enter') {
    const target = e.target as HTMLElement | null
    const tag = (target?.tagName || '').toLowerCase()
    // não salvar ao digitar em textarea (Enter = nova linha)
    if (tag === 'textarea') return
    // permite Shift+Enter sem salvar (se quiser usar pra quebrar linha em alguns inputs)
    if (e.shiftKey) return
    e.preventDefault()
    emit('submit')
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-in">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">{{ title }}</h2>

        <div class="mb-6">
          <slot />
        </div>

        <div v-if="showFooter" class="flex gap-2 sm:gap-3 justify-end sticky bottom-0 bg-white dark:bg-gray-800 -m-4 sm:-m-6 mt-6 px-4 sm:px-6 py-3 sm:py-4 flex-col-reverse sm:flex-row">
          <slot name="footer">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
            >
              {{ cancelLabel }}
            </button>
            <button
              v-if="submitLabel"
              @click="$emit('submit')"
              :class="[
                'px-4 py-2.5 sm:py-3 rounded-lg text-white transition-colors font-medium text-sm sm:text-base',
                props.submitVariant === 'danger'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              ]"
            >
              {{ submitLabel }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
