<script setup lang="ts">
interface SciencePoint {
  number: number
  title: string
  description: string
}

const points: SciencePoint[] = [
  {
    number: 1,
    title: 'Estrutura = Trilhas Neurais',
    description: 'Roadmaps organizam seu aprendizado em sequências lógicas, criando padrões neurais mais eficientes'
  },
  {
    number: 2,
    title: 'Repetição = Consolidação',
    description: 'Registros diários reforçam suas sinapses, transformando aprendizado temporário em memória duradoura'
  },
  {
    number: 3,
    title: 'Feedback = Plasticidade',
    description: 'Visualizar progresso ativa recompensa cerebral, fortalecendo as conexões que você está construindo'
  }
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 py-16 sm:py-20 md:py-24">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
      <!-- Left: Text -->
      <div class="space-y-4 sm:space-y-6">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Baseado em neurociência
          </h2>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            "Neurons that fire together, wire together" — Lei de Hebb
            <span class="block text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400 italic">
              "Neurônios que disparam juntos, se conectam"
            </span>
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="point in points"
            :key="point.number"
            class="flex gap-4"
          >
            <div class="flex-shrink-0">
              <div
                :class="[
                  'flex items-center justify-center h-10 w-10 rounded-lg font-bold',
                  point.number === 1 && 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
                  point.number === 2 && 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
                  point.number === 3 && 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400'
                ]"
              >
                {{ point.number }}
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ point.title }}</h3>
              <p class="text-slate-600 dark:text-slate-400">{{ point.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Visual -->
      <div class="hidden md:block">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl blur-3xl opacity-30"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div class="space-y-6">
              <div class="text-center">
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Seu cérebro aprendendo</p>
              </div>

              <!-- Neural visualization -->
              <div class="flex justify-center items-center gap-4 py-8">
                <!-- Neuron 1 -->
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center mx-auto mb-2">
                    <span class="text-white text-xs font-bold">T1</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">Tópico 1</p>
                </div>

                <!-- Connection -->
                <div class="flex-1 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full"></div>

                <!-- Neuron 2 -->
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full bg-purple-500 dark:bg-purple-400 flex items-center justify-center mx-auto mb-2">
                    <span class="text-white text-xs font-bold">T2</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">Tópico 2</p>
                </div>

                <!-- Connection -->
                <div class="flex-1 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-full"></div>

                <!-- Neuron 3 -->
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full bg-cyan-500 dark:bg-cyan-400 flex items-center justify-center mx-auto mb-2">
                    <span class="text-white text-xs font-bold">T3</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">Tópico 3</p>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  <span class="font-semibold">Quanto mais forte a conexão</span>, mais fácil lembrar e aplicar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
