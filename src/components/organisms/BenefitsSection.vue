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
  <section class="border-y border-hairline py-16 sm:py-20 md:py-24 bg-canvas-soft">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-3 sm:mb-4">
          Tudo para fortalecer suas sinapses.
        </h2>
        <p class="text-base sm:text-lg text-ink-body max-w-2xl mx-auto">
          Ferramentas completas para mapear, conectar e fortalecer seus conhecimentos
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(benefit, idx) in benefits"
          :key="idx"
          class="p-8 rounded-lg border-0 bg-canvas shadow-card hover:shadow-card-lg transition-all duration-300"
        >
          <div class="mb-4">
            <BenefitIcon :icon="benefit.icon" :size="56" />
          </div>
          <h3 class="text-lg font-semibold text-ink mb-2">
            {{ benefit.title }}
          </h3>
          <p class="text-ink-body leading-relaxed">
            {{ benefit.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
