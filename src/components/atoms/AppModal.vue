<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'

defineOptions({ inheritAttrs: false })

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
      <div class="bg-canvas rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-in">
        <h2 class="text-lg sm:text-xl font-bold text-ink mb-4">{{ title }}</h2>

        <div class="mb-6">
          <slot />
        </div>

        <div v-if="showFooter" class="flex gap-2 sm:gap-3 justify-end sticky bottom-0 bg-canvas -m-4 sm:-m-6 mt-6 px-4 sm:px-6 py-3 sm:py-4 flex-col-reverse sm:flex-row">
          <slot name="footer">
            <AppButton variant="ghost" size="sm" @click="$emit('cancel')">
              {{ cancelLabel }}
            </AppButton>
            <AppButton v-if="submitLabel" :variant="props.submitVariant" size="sm" @click="$emit('submit')">
              {{ submitLabel }}
            </AppButton>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
