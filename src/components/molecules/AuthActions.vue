<script setup lang="ts">
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
    <button
      @click="emit('register')"
      class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
    >
      Começar agora →
    </button>
    <button
      @click="emit('login')"
      class="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-lg transition-colors duration-200"
    >
      Já tenho conta
    </button>
  </div>

  <div v-else-if="variant === 'navbar'" class="flex items-center gap-3">
    <button
      @click="emit('login')"
      class="px-4 py-2 text-ink-body hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
    >
      Entrar
    </button>
    <button
      @click="emit('register')"
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
    >
      Criar conta
    </button>
  </div>
</template>
