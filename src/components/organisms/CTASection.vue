<script setup lang="ts">
import AuthActions from '@/components/molecules/AuthActions.vue'

defineEmits<{
  register: []
  login: []
}>()
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 text-center bg-gradient-to-b from-transparent via-blue-50/30 to-purple-50/30 dark:via-blue-950/10 dark:to-purple-950/10 rounded-3xl">
    <div class="space-y-6 sm:space-y-8">
      <div class="space-y-3 sm:space-y-4">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
          Comece a conectar seus conhecimentos
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Crie seu primeiro roadmap e fortaleça suas sinapses de aprendizado
        </p>
      </div>
      <AuthActions variant="landing" @register="emit('register')" @login="emit('login')" />
    </div>
  </section>
</template>
