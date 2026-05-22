<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Escolha seu plano</h1>
        <p class="text-xl text-gray-600 dark:text-slate-300">Acesse mais recursos e limite de créditos de IA com upgrades</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-red-700 dark:text-red-400 font-medium">Erro ao carregar plano: {{ error }}</p>
        <button @click="loadPlan" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
          Tentar novamente
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600 dark:text-slate-400">Carregando seus dados...</p>
        </div>
      </div>

      <!-- Plans Grid -->
      <div v-else class="grid md:grid-cols-3 gap-8 mb-12">
        <!-- ESSENCIAL Plan -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Essencial</h2>
              <div v-if="currentPlan?.plan === 'ESSENCIAL'" class="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">Grátis</span>
            </div>

            <ul class="space-y-4 mb-8 text-gray-700 dark:text-slate-300">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-green-600" />
                <span>Até 3 roadmaps</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-green-600" />
                <span>5 módulos por roadmap</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-green-600" />
                <span>10 tópicos por módulo</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-green-600" />
                <span>10 recursos por tópico</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-green-600" />
                <span>0 créditos IA/mês</span>
              </li>
            </ul>

            <button
              disabled
              class="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-not-allowed"
            >
              Plano atual
            </button>
          </div>
        </div>

        <!-- PLUS Plan -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition border-2 border-blue-500">
          <div class="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
            POPULAR
          </div>

          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Plus</h2>
              <div v-if="currentPlan?.plan === 'PLUS'" class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">R$19,90</span>
              <span class="text-gray-600 dark:text-slate-400">/mês</span>
            </div>

            <ul class="space-y-4 mb-8 text-gray-700 dark:text-slate-300">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-blue-600" />
                <span>Até 15 roadmaps</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-blue-600" />
                <span>20 módulos por roadmap</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-blue-600" />
                <span>50 tópicos por módulo</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-blue-600" />
                <span>30 recursos por tópico</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-blue-600" />
                <span>30 créditos IA/mês</span>
              </li>
            </ul>

            <button
              v-if="currentPlan?.plan !== 'PLUS' && currentPlan?.plan !== 'AVANCADO'"
              @click="upgrade('PLUS')"
              :disabled="isLoadingCheckout"
              class="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ isLoadingCheckout ? 'Processando...' : 'Fazer upgrade' }}
            </button>
            <button
              v-else
              disabled
              class="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-not-allowed"
            >
              Plano atual ou superior
            </button>
          </div>
        </div>

        <!-- AVANCADO Plan -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Avançado</h2>
              <div v-if="currentPlan?.plan === 'AVANCADO'" class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">R$49,90</span>
              <span class="text-gray-600 dark:text-slate-400">/mês</span>
            </div>

            <ul class="space-y-4 mb-8 text-gray-700 dark:text-slate-300">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-purple-600" />
                <span>Roadmaps ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-purple-600" />
                <span>Módulos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-purple-600" />
                <span>Tópicos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-purple-600" />
                <span>Recursos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-purple-600" />
                <span>150 créditos IA/mês</span>
              </li>
            </ul>

            <button
              v-if="currentPlan?.plan !== 'AVANCADO'"
              @click="upgrade('AVANCADO')"
              :disabled="isLoadingCheckout"
              class="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {{ isLoadingCheckout ? 'Processando...' : 'Fazer upgrade' }}
            </button>
            <button
              v-else
              disabled
              class="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-not-allowed"
            >
              Plano atual
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import { api } from '../services/api'
const currentPlan = ref<any>(null)
const isLoading = ref(false)
const isLoadingCheckout = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await loadPlan()
})


async function loadPlan() {
  isLoading.value = true
  error.value = null

  try {
    console.log('📋 [PlansPage] Carregando plano do usuário...')
    const response = await api.get('/api/plan')
    console.log('✅ [PlansPage] Plano carregado:', response)
    currentPlan.value = response
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar plano'
    console.error('❌ [PlansPage] Erro ao carregar plano:', err)
    error.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

async function upgrade(plan: 'PLUS' | 'AVANCADO') {
  isLoadingCheckout.value = true
  error.value = null

  try {
    console.log(`🔄 [PlansPage] Iniciando checkout para plano: ${plan}`)
    console.log(`📤 [PlansPage] POST /api/plan/checkout com body:`, { plan })

    const response = await api.post('/api/plan/checkout', { plan })
    console.log('✅ [PlansPage] Resposta do checkout:', response)

    const { checkoutUrl, publicKey, preferenceId } = response
    console.log('🔗 [PlansPage] URLs recebidas:', { checkoutUrl, publicKey, preferenceId })

    if (!checkoutUrl) {
      throw new Error('checkoutUrl não retornou da API')
    }

    console.log('🚀 [PlansPage] Redirecionando para:', checkoutUrl)
    window.location.href = checkoutUrl
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao criar checkout'
    console.error('❌ [PlansPage] Erro ao criar checkout:', err)
    console.error('❌ [PlansPage] Mensagem de erro:', errorMsg)
    error.value = errorMsg
    isLoadingCheckout.value = false
  }
}
</script>
