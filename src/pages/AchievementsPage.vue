<script setup lang="ts">
import { onMounted } from 'vue'
import { TrophyIcon, LockClosedIcon, LightBulbIcon } from '@heroicons/vue/24/outline'
import { useBadgesStore } from '@/stores/badges'

const badgesStore = useBadgesStore()

onMounted(() => {
  badgesStore.fetchBadges()
})

function formatDate(date: string | null): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getHintForBadge(key: string): string {
  const hints: Record<string, string> = {
    PRIMEIRA_AULA: 'Crie seu primeiro roadmap',
    SEMANA_COMPLETA: 'Registre 7 dias consecutivos de estudo',
    BIBLIOFILO: 'Adicione 10 recursos ao total',
    META_MASTER: 'Cumpra sua meta diária 5 vezes seguidas'
  }
  return hints[key] || 'Continue estudando'
}
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-8 sm:mb-12">
        <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <TrophyIcon class="w-6 sm:w-8 h-6 sm:h-8 text-yellow-500" />
          <h1 class="text-2xl sm:text-4xl font-bold text-ink">Conquistas</h1>
        </div>
        <p class="text-xs sm:text-base text-ink-body ml-8 sm:ml-11">
          {{ badgesStore.earnedCount }} de {{ badgesStore.badges.length }} badges conquistados
        </p>
      </div>

      <!-- Loading -->
      <div v-if="badgesStore.loading" class="text-center py-12">
        <p class="text-ink-body">Carregando conquistas...</p>
      </div>

      <!-- Earned Badges -->
      <div v-else-if="badgesStore.earnedBadges.length > 0" class="mb-8 sm:mb-12">
        <div class="flex items-center gap-2 mb-4 sm:mb-6">
          <TrophyIcon class="w-5 h-5 text-yellow-500" />
          <h2 class="text-lg sm:text-xl font-semibold text-ink">
            Badges Conquistados
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="badge in badgesStore.earnedBadges"
            :key="badge.key"
            class="p-3 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl hover:shadow-lg transition-shadow"
          >
            <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 text-center">{{ badge.icon }}</div>
            <h3 class="text-sm sm:text-lg font-bold text-ink text-center mb-1 sm:mb-2">
              {{ badge.title }}
            </h3>
            <p class="text-xs sm:text-sm text-ink-body text-center mb-2 sm:mb-3 line-clamp-2">
              {{ badge.description }}
            </p>
            <p class="text-xs text-yellow-600 dark:text-yellow-400 text-center font-medium">
              Conquistado em {{ formatDate(badge.earnedAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Unearned Badges -->
      <div v-if="badgesStore.unearnedBadges.length > 0">
        <div class="flex items-center gap-2 mb-4 sm:mb-6">
          <LockClosedIcon class="w-5 h-5 text-gray-400" />
          <h2 class="text-lg sm:text-xl font-semibold text-ink">
            Badges Bloqueados
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="badge in badgesStore.unearnedBadges"
            :key="badge.key"
            class="p-3 sm:p-6 bg-gray-100 dark:bg-gray-800 border-2 border-hairline rounded-xl opacity-75"
          >
            <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 text-center opacity-40">{{ badge.icon }}</div>
            <h3 class="text-sm sm:text-lg font-bold text-gray-500 dark:text-gray-400 text-center mb-1 sm:mb-2">
              {{ badge.title }}
            </h3>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-500 text-center mb-2 sm:mb-3 line-clamp-2">
              {{ badge.description }}
            </p>
            <div class="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-500 text-center font-medium bg-gray-200 dark:bg-gray-700 rounded px-2 py-1">
              <LightBulbIcon class="w-3 h-3" />
              <span>{{ getHintForBadge(badge.key) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!badgesStore.loading && badgesStore.badges.length === 0" class="text-center py-8 sm:py-12">
        <TrophyIcon class="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
        <p class="text-sm sm:text-base text-ink-body">Nenhuma conquista encontrada</p>
      </div>
    </div>
  </div>
</template>
