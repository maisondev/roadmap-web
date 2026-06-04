<script setup lang="ts">
const emit = defineEmits<{
  register: []
  login: []
}>()
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
      <!-- Left side - Content -->
      <div class="space-y-6 sm:space-y-8">
        <div class="space-y-4">
          <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ink leading-tight">
            Conecte seus conhecimentos em sinapses.
          </h1>
          <p class="text-lg sm:text-xl text-ink-body">
            Crie roadmaps de aprendizado, mapeie suas fontes e fortaleça suas conexões de conhecimento
          </p>
        </div>

        <!-- Trust badges -->
        <div class="flex flex-col gap-3 text-ink-body">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-canvas-soft-2">
              <span class="text-ink text-xs font-bold">✓</span>
            </span>
            Grátis para começar, sem cartão de crédito
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-canvas-soft-2">
              <span class="text-ink text-xs font-bold">✓</span>
            </span>
            Funciona offline, sincroniza automaticamente
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-canvas-soft-2">
              <span class="text-ink text-xs font-bold">✓</span>
            </span>
            Acesso ao seu progresso em qualquer dispositivo
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            @click="emit('register')"
            class="px-8 py-3.5 bg-ink text-on-primary hover:opacity-90 font-semibold rounded-pill transition-all"
          >
            Começar agora
          </button>
          <button
            @click="emit('login')"
            class="px-8 py-3.5 border border-hairline bg-canvas text-ink hover:bg-canvas-soft-2 font-semibold rounded-pill transition-colors"
          >
            Já tenho conta
          </button>
        </div>
      </div>

      <!-- Right side - Visual: Roadmap Preview -->
      <div class="hidden md:block">
        <div class="relative">
          <div class="absolute -inset-8 bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 rounded-2xl blur-2xl opacity-40"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <!-- Roadmap Header -->
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 px-6 py-4">
              <h3 class="font-bold text-slate-900 dark:text-white text-lg">Português</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Sua rede de aprendizado</p>
            </div>

            <!-- Roadmap Content -->
            <div class="p-6 space-y-4">
              <!-- Block 1 -->
              <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p class="font-semibold text-blue-900 dark:text-blue-300 text-sm">Gramática</p>
                </div>
                <div class="p-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
                    <span class="text-sm text-slate-700 dark:text-slate-300">Verbos e conjugação</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                    <span class="text-sm text-slate-700 dark:text-slate-300">Pontuação</span>
                  </div>
                </div>
              </div>

              <!-- Block 2 -->
              <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div class="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p class="font-semibold text-purple-900 dark:text-purple-300 text-sm">Literatura</p>
                </div>
                <div class="p-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                    <span class="text-sm text-slate-700 dark:text-slate-300">Romantismo brasileiro</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                    <span class="text-sm text-slate-700 dark:text-slate-300">Modernismo</span>
                  </div>
                </div>
              </div>

              <!-- Progress indicator -->
              <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs mb-2">
                  <span class="font-medium text-slate-700 dark:text-slate-300">Progresso</span>
                  <span class="text-blue-600 dark:text-blue-400 font-semibold">40%</span>
                </div>
                <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full w-2/5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
