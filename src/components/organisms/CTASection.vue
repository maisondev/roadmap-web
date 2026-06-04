<script setup lang="ts">
import AuthActions from '@/components/molecules/AuthActions.vue'

const emit = defineEmits<{
  register: []
  login: []
}>()
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 text-center bg-ink text-on-primary rounded-3xl">
    <div class="space-y-6 sm:space-y-8">
      <div class="space-y-3 sm:space-y-4">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold">
          Comece a conectar seus conhecimentos.
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-ink-body max-w-2xl mx-auto">
          Crie seu primeiro roadmap e fortaleça suas sinapses de aprendizado
        </p>
      </div>
      <AuthActions variant="landing" @register="emit('register')" @login="emit('login')" />
    </div>
  </section>
</template>
