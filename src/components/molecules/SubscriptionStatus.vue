<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useRouter } from 'vue-router'
import AppButton from '@/components/atoms/AppButton.vue'
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon, SparklesIcon, ArrowPathIcon, ClockIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const subscriptionStatus = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  await loadStatus()
})

async function loadStatus() {
  isLoading.value = true
  error.value = null
  try {
    subscriptionStatus.value = await api.get('/api/plan/status')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar status'
    console.error(error.value)
  } finally {
    isLoading.value = false
  }
}

function getStatusColor() {
  if (!subscriptionStatus.value.isActive) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  if (subscriptionStatus.value.plan === 'ESSENCIAL') return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  if (subscriptionStatus.value.expiresInDays && subscriptionStatus.value.expiresInDays <= 7) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
}

function getStatusIcon() {
  if (!subscriptionStatus.value.isActive) return XMarkIcon
  if (subscriptionStatus.value.plan === 'ESSENCIAL') return SparklesIcon
  if (subscriptionStatus.value.expiresInDays && subscriptionStatus.value.expiresInDays <= 7) return ExclamationTriangleIcon
  return CheckIcon
}

function getStatusText() {
  if (!subscriptionStatus.value.isActive) return 'Expirado'
  if (subscriptionStatus.value.plan === 'ESSENCIAL') return 'Gratuito'
  if (subscriptionStatus.value.expiresInDays && subscriptionStatus.value.expiresInDays <= 7) return 'Expirando em breve'
  return 'Ativo'
}
</script>

<template>
  <div v-if="isLoading" class="p-6 text-center">
    <p class="text-ink-body">Carregando status...</p>
  </div>

  <div v-else-if="error" class="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
    <p class="text-red-600 dark:text-red-400">{{ error }}</p>
  </div>

  <div v-else-if="subscriptionStatus" :class="`p-6 border rounded-lg ${getStatusColor()}`">
    <!-- Header: Status e Plano -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <component :is="getStatusIcon()" class="w-6 h-6 text-ink" />
          <div>
            <h3 class="text-lg font-bold text-ink">Plano {{ subscriptionStatus.plan }}</h3>
            <p class="text-sm text-ink-body">{{ getStatusText() }}</p>
          </div>
        </div>
      </div>
      <div class="text-right" v-if="subscriptionStatus.planExpiresAt">
        <p class="text-sm font-medium text-ink-body">
          {{ subscriptionStatus.isActive ? 'Expira em' : 'Expirou em' }}
        </p>
        <p class="text-lg font-bold text-ink">
          {{ new Date(subscriptionStatus.planExpiresAt).toLocaleDateString('pt-BR') }}
        </p>
        <p v-if="subscriptionStatus.expiresInDays !== null" class="text-xs text-ink-body mt-1">
          {{ subscriptionStatus.expiresInDays > 0 ? `em ${subscriptionStatus.expiresInDays} dias` : 'hoje' }}
        </p>
      </div>
      <div v-else class="text-right">
        <p class="text-sm font-medium text-ink-body">Plano Gratuito</p>
        <p class="text-lg font-bold text-ink">Sem expiração</p>
      </div>
    </div>

    <!-- Mensagem -->
    <p class="text-sm text-ink-body mb-6 p-3 bg-white/50 dark:bg-white/5 rounded">
      {{ subscriptionStatus.message }}
    </p>

    <!-- Roadmaps -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-ink-body">Roadmaps</span>
        <span class="text-sm font-semibold text-ink">
          {{ subscriptionStatus.limits.roadmaps.used }}/{{ subscriptionStatus.limits.roadmaps.limit === Infinity ? '∞' : subscriptionStatus.limits.roadmaps.limit }}
        </span>
      </div>
      <div v-if="subscriptionStatus.limits.roadmaps.limit !== Infinity" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
          :style="{ width: `${Math.min((subscriptionStatus.limits.roadmaps.used / subscriptionStatus.limits.roadmaps.limit) * 100, 100)}%` }"
        />
      </div>
      <p v-else class="text-xs text-ink-body mt-1">Roadmaps ilimitados</p>
    </div>

    <!-- IA Credits -->
    <div v-if="subscriptionStatus.limits.aiCreditsPerMonth > 0" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <SparklesIcon class="w-4 h-4 text-ink-body" />
          <span class="text-sm font-medium text-ink-body">Créditos de IA/mês</span>
        </div>
        <span class="text-sm font-semibold text-ink">
          {{ subscriptionStatus.limits.aiCreditsRemaining }}/{{ subscriptionStatus.limits.aiCreditsPerMonth }}
        </span>
      </div>
      <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
          :style="{ width: `${Math.min((subscriptionStatus.limits.aiCreditsRemaining / subscriptionStatus.limits.aiCreditsPerMonth) * 100, 100)}%` }"
        />
      </div>
      <p class="text-xs text-ink-body mt-1">
        {{ subscriptionStatus.limits.aiCreditsRemaining > 0
          ? `${subscriptionStatus.limits.aiCreditsRemaining} crédito${subscriptionStatus.limits.aiCreditsRemaining !== 1 ? 's' : ''} disponível${subscriptionStatus.limits.aiCreditsRemaining !== 1 ? 's' : ''}`
          : 'Sem créditos disponíveis este mês' }}
      </p>
    </div>

    <!-- Limites -->
    <div class="bg-white/50 dark:bg-white/5 p-4 rounded mb-6">
      <p class="text-sm font-semibold text-ink mb-3">O que você pode fazer:</p>
      <ul class="space-y-2">
        <li class="flex items-center gap-2 text-sm text-ink-body">
          <CheckIcon class="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>
            {{ subscriptionStatus.features.maxBlocksPerBlock === Infinity ? 'Módulos ilimitados' : `Até ${subscriptionStatus.features.maxBlocksPerRoadmap} módulos por roadmap` }}
          </span>
        </li>
        <li class="flex items-center gap-2 text-sm text-ink-body">
          <CheckIcon class="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>
            {{ subscriptionStatus.features.maxTopicsPerBlock === Infinity ? 'Tópicos ilimitados' : `Até ${subscriptionStatus.features.maxTopicsPerBlock} tópicos por módulo` }}
          </span>
        </li>
        <li class="flex items-center gap-2 text-sm text-ink-body">
          <CheckIcon class="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>
            {{ subscriptionStatus.features.maxResourcesPerTopic === Infinity ? 'Recursos ilimitados' : `Até ${subscriptionStatus.features.maxResourcesPerTopic} recursos por tópico` }}
          </span>
        </li>
        <li v-if="subscriptionStatus.limits.aiCreditsPerMonth === 0" class="flex items-center gap-2 text-sm text-ink-body">
          <XMarkIcon class="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>Geração com IA (upgrade necessário)</span>
        </li>
        <li v-else-if="subscriptionStatus.features.canUseAi" class="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
          <CheckIcon class="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>Geração com IA ({{ subscriptionStatus.limits.aiCreditsRemaining }} créditos restantes)</span>
        </li>
        <li v-else class="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
          <ClockIcon class="w-4 h-4 flex-shrink-0" />
          <span>IA disponível no próximo mês</span>
        </li>
      </ul>
    </div>

    <!-- Botões de Ação -->
    <div class="flex gap-3">
      <AppButton
        v-if="subscriptionStatus.plan === 'ESSENCIAL'"
        variant="primary"
        @click="() => router.push('/plans')"
        class="flex-1"
      >
        Fazer Upgrade
      </AppButton>
      <AppButton
        v-else-if="!subscriptionStatus.isActive"
        variant="primary"
        @click="() => router.push('/plans')"
        class="flex-1"
      >
        Renovar Plano
      </AppButton>
      <AppButton
        variant="secondary"
        @click="loadStatus"
        class="flex-1"
      >
        Atualizar
      </AppButton>
    </div>
  </div>
</template>
