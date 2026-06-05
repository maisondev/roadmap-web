<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- ✅ APPROVED STATE -->
      <div v-if="status === 'approved'" class="text-center">
        <!-- Animated Check Icon -->
        <div class="mb-8 flex justify-center">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse"></div>
            <svg
              class="w-24 h-24 text-green-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-ink mb-2">
          Plano ativado com sucesso!
        </h1>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Seu upgrade para <span class="font-semibold text-blue-600 dark:text-blue-400">{{ planName }}</span> foi confirmado.
        </p>

        <div v-if="currentPlan" class="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
          <p class="text-sm text-ink-body mb-2">Seu plano atual:</p>
          <p class="text-lg font-semibold text-ink">{{ currentPlan }}</p>
          <p v-if="planExpiresAt" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Válido até: {{ formatDate(planExpiresAt) }}
          </p>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Redirecionando para o dashboard em {{ countdown }}s...
        </p>

        <AppButton
          @click="goToDashboard"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Ir para o Dashboard
        </AppButton>
      </div>

      <!-- ⏳ PENDING STATE -->
      <div v-else-if="status === 'pending'" class="text-center">
        <div class="mb-8 flex justify-center">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-full animate-pulse"></div>
            <svg
              class="w-24 h-24 text-yellow-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-ink mb-2">
          Pagamento em processamento
        </h1>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Seu pagamento está sendo processado. Isso pode levar alguns minutos.
        </p>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-900 dark:text-blue-200">
            Você receberá uma confirmação por email quando o pagamento for processado.
          </p>
        </div>

        <AppButton
          @click="goToPlans"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Verificar meus planos
        </AppButton>
      </div>

      <!-- ❌ FAILURE STATE -->
      <div v-else-if="status === 'failure'" class="text-center">
        <div class="mb-8 flex justify-center">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse"></div>
            <svg
              class="w-24 h-24 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2M12 2a10 10 0 110 20 10 10 0 010-20z" />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-ink mb-2">
          Pagamento não aprovado
        </h1>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Não conseguimos processar seu pagamento. Por favor, tente novamente com outro cartão ou método de pagamento.
        </p>

        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p class="text-sm text-red-900 dark:text-red-200">
            Seu cartão está seguro. Você não foi cobrado.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <AppButton
            @click="goToPlans"
            variant="primary"
            size="lg"
            class="w-full"
          >
            Tentar novamente
          </AppButton>
          <AppButton
            @click="goHome"
            variant="secondary"
            size="lg"
            class="w-full"
          >
            Ir para o início
          </AppButton>
        </div>
      </div>

      <!-- Unknown/Invalid Status -->
      <div v-else class="text-center">
        <div class="mb-8 flex justify-center">
          <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              class="w-12 h-12 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-ink mb-2">
          Status desconhecido
        </h1>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Não conseguimos determinar o status do seu pagamento.
        </p>

        <AppButton
          @click="goToPlans"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Voltar para planos
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'
import AppButton from '../components/atoms/AppButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const status = ref<'approved' | 'pending' | 'failure' | string>('unknown')
const currentPlan = ref<string | null>(null)
const planExpiresAt = ref<string | null>(null)
const countdown = ref(5)

const planName = computed(() => {
  const planMap: Record<string, string> = {
    'PLUS': 'Plus',
    'AVANCADO': 'Avançado',
    'ADVANCED': 'Avançado'
  }
  return planMap[currentPlan.value || ''] || currentPlan.value || 'Premium'
})

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return date
  }
}

const goToDashboard = () => router.push('/dashboard')
const goToPlans = () => router.push('/plans')
const goHome = () => router.push('/')

onMounted(async () => {
  // Read status from query params
  const queryStatus = route.query.status as string
  status.value = queryStatus || 'unknown'

  console.log(`[PaymentReturn] Status: ${status.value}`)

  // If user is logged in, fetch current plan
  if (authStore.isAuthenticated) {
    try {
      const response = await api.get('/api/plan')
      const data = await response.json()
      currentPlan.value = data.plan
      planExpiresAt.value = data.planExpiresAt
      console.log(`[PaymentReturn] Current plan:`, { plan: data.plan, expiresAt: data.planExpiresAt })
    } catch (error) {
      console.error('[PaymentReturn] Error fetching plan:', error)
    }
  }

  // Auto-redirect on success (com delay para webhook processar)
  if (status.value === 'approved') {
    console.log(`[PaymentReturn] Payment approved, waiting for webhook...`)

    // Esperar 5 segundos para webhook processar (pode levar tempo)
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Refetch do plano para confirmar atualização
    console.log(`[PaymentReturn] Refetching plan...`)
    try {
      const response = await api.get('/api/plan')
      const data = await response.json()
      currentPlan.value = data.plan
      planExpiresAt.value = data.planExpiresAt
      console.log(`[PaymentReturn] Plan updated:`, { plan: data.plan, expiresAt: data.planExpiresAt })
    } catch (error) {
      console.error('[PaymentReturn] Error refetching plan:', error)
    }

    // Contador visual
    const interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
        console.log(`[PaymentReturn] Redirecting to dashboard...`)
        goToDashboard()
      }
    }, 1000)
  }
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.5rem); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
