<script setup lang="ts">
import BenefitIcon from '@/components/atoms/BenefitIcon.vue'

interface Benefit {
  icon: string
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    icon: 'layers',
    title: 'Roadmaps como Redes',
    description: 'Crie roadmaps estruturados em blocos e tópicos para mapear suas conexões de conhecimento'
  },
  {
    icon: 'chart',
    title: 'Visualize seu Progresso',
    description: 'Acompanhe em tempo real o fortalecimento de suas sinapses de aprendizado'
  },
  {
    icon: 'notebook',
    title: 'Registros Diários',
    description: 'Consolide seu aprendizado com registros diários e acompanhe sua dedicação'
  },
  {
    icon: 'star',
    title: 'Mapeie suas Fontes',
    description: 'Crie rankings de professores para identificar suas melhores fontes de conhecimento'
  },
  {
    icon: 'cloud',
    title: 'Estude sem Limites',
    description: 'Funciona offline — suas mudanças sincronizam automaticamente quando conectado'
  },
  {
    icon: 'shield',
    title: 'Adequado à LGPD',
    description: 'Seus dados protegidos por lei. Consentimento explícito, exportação de dados, exclusão de conta e Política de Privacidade completa — tudo conforme a Lei nº 13.709/2018.'
  }
]
</script>

<template>
  <section class="border-y border-slate-200 dark:border-slate-800 py-16 sm:py-20 md:py-24 bg-gradient-to-b from-blue-50 via-purple-50/50 to-cyan-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-cyan-950/20">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
          Tudo para fortalecer suas sinapses
        </h2>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Ferramentas completas para mapear, conectar e fortalecer seus conhecimentos
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(benefit, idx) in benefits"
          :key="idx"
          class="p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div class="mb-4">
            <BenefitIcon :icon="benefit.icon" :size="56" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {{ benefit.title }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ benefit.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
