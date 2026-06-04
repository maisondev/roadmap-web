<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'

interface Props {
  variant?: 'landing' | 'navbar'
}

withDefaults(defineProps<Props>(), { variant: 'landing' })

const emit = defineEmits<{
  register: []
  login: []
}>()
</script>

<template>
  <div v-if="variant === 'landing'" class="flex flex-col sm:flex-row gap-4 justify-center">
    <AppButton size="lg" variant="primary" @click="emit('register')">
      Começar agora →
    </AppButton>
    <AppButton size="lg" variant="secondary" @click="emit('login')">
      Já tenho conta
    </AppButton>
  </div>

  <div v-else-if="variant === 'navbar'" class="flex items-center gap-3">
    <button
      @click="emit('login')"
      class="px-4 py-2 text-ink-body hover:bg-canvas-soft-2 font-medium rounded-lg transition-colors"
    >
      Entrar
    </button>
    <button
      @click="emit('register')"
      class="px-4 py-2 bg-ink text-on-primary hover:opacity-90 font-medium rounded-lg transition-all"
    >
      Criar conta
    </button>
  </div>
</template>
