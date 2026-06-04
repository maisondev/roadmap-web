<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'

interface Props {
  open: boolean
  title: string
  message: string
  requirePassword?: boolean
  submitLabel?: string
  cancelLabel?: string
}

interface Emits {
  submit: [password?: string]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  requirePassword: false,
  submitLabel: 'Confirmar',
  cancelLabel: 'Cancelar'
})

const emit = defineEmits<Emits>()

const password = ref('')

watch(
  () => props.open,
  (newVal) => {
    if (!newVal) {
      password.value = ''
    }
  }
)

const handleSubmit = () => {
  emit('submit', password.value)
}

const handleCancel = () => {
  password.value = ''
  emit('cancel')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    handleCancel()
    return
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSubmit()
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
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-canvas rounded-lg shadow-lg max-w-sm w-full mx-4 p-6 space-y-4">
        <h2 class="text-xl font-bold text-ink">
          {{ title }}
        </h2>

        <p class="text-ink-body">
          {{ message }}
        </p>

        <div v-if="requirePassword" class="space-y-2">
          <label class="block text-sm font-medium text-ink-body">
            Digite sua senha para confirmar
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Sua senha"
            class="w-full px-3 py-2 border border-hairline rounded-lg bg-canvas-soft text-ink"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div class="flex gap-3 justify-end pt-4 border-t border-hairline">
          <AppButton variant="ghost" size="sm" @click="handleCancel">
            {{ cancelLabel }}
          </AppButton>
          <AppButton variant="danger" size="sm" @click="handleSubmit">
            {{ submitLabel }}
          </AppButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
