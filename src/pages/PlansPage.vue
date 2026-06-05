<template>
  <div class="min-h-screen bg-canvas-soft py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-ink mb-4">Escolha seu plano</h1>
        <p class="text-xl text-ink-body">Acesse mais recursos e limite de créditos de IA com upgrades</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-8 p-4 bg-canvas border border-ds-error border-opacity-30 rounded-lg">
        <p class="text-ds-error font-medium">Erro ao carregar plano: {{ error }}</p>
        <AppButton @click="loadPlan" variant="danger" size="sm" class="mt-2">
          Tentar novamente
        </AppButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-96">
        <div class="text-center">
          <AppSpinner />
          <p class="text-ink-body mt-4">Carregando seus dados...</p>
        </div>
      </div>

      <!-- Current Plan Info -->
      <div v-if="!isLoading && currentPlan && currentPlan.plan !== 'ESSENCIAL' && currentPlan.planExpiresAt" class="mb-8 p-4 bg-canvas border border-ds-success border-opacity-30 rounded-lg">
        <p class="text-ds-success font-medium">
          Seu plano {{ currentPlan.plan }} está ativo até <strong>{{ formatDate(currentPlan.planExpiresAt) }}</strong>
        </p>
        <p class="text-sm text-ds-success mt-2 opacity-80">
          Se você fizer downgrade, continuará pagando até essa data, mas terá acesso imediato ao novo plano.
        </p>
      </div>

      <!-- Plans Grid -->
      <div v-if="!isLoading && currentPlan" class="grid md:grid-cols-3 gap-8 mb-12">
        <!-- ESSENCIAL Plan -->
        <div class="relative bg-canvas rounded-2xl shadow-card overflow-hidden hover:shadow-card-lg transition">
          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-ink">Essencial</h2>
              <div v-if="currentPlan?.plan === 'ESSENCIAL'" class="px-3 py-1 bg-canvas-soft-2 text-ink-body text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-ink">Grátis</span>
            </div>

            <ul class="space-y-4 mb-8 text-ink-body">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>Até 3 roadmaps</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>5 módulos por roadmap</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>10 tópicos por módulo</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>10 recursos por tópico</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>0 créditos IA/mês</span>
              </li>
            </ul>

            <AppButton
              v-if="currentPlan?.plan === 'ESSENCIAL'"
              disabled
              variant="secondary"
              size="lg"
              block
              class="opacity-60"
            >
              Plano atual
            </AppButton>
            <AppButton
              v-else
              @click="upgrade('ESSENCIAL')"
              :disabled="isLoadingCheckout"
              :loading="isLoadingCheckout"
              variant="secondary"
              size="lg"
              block
            >
              {{ isLoadingCheckout ? '' : 'Fazer downgrade' }}
            </AppButton>
          </div>
        </div>

        <!-- PLUS Plan -->
        <div class="relative bg-canvas rounded-2xl shadow-card overflow-hidden hover:shadow-card-lg transition border-2 border-ds-success">
          <div class="absolute top-0 right-0 bg-ds-success text-on-primary px-4 py-1 text-xs font-bold rounded-bl-lg">
            POPULAR
          </div>

          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-ink">Plus</h2>
              <div v-if="currentPlan?.plan === 'PLUS'" class="px-3 py-1 bg-canvas-soft-2 text-ink text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-ink">R$19,90</span>
              <span class="text-ink-mute">/mês</span>
            </div>

            <ul class="space-y-4 mb-8 text-ink-body">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>Até 15 roadmaps</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>20 módulos por roadmap</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>50 tópicos por módulo</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>30 recursos por tópico</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-success" />
                <span>30 créditos IA/mês</span>
              </li>
            </ul>

            <AppButton
              v-if="currentPlan?.plan !== 'PLUS' && currentPlan?.plan !== 'AVANCADO'"
              @click="upgrade('PLUS')"
              :disabled="isLoadingCheckout"
              :loading="isLoadingCheckout"
              variant="primary"
              size="lg"
              block
            >
              {{ isLoadingCheckout ? '' : 'Fazer upgrade' }}
            </AppButton>
            <AppButton
              v-else
              disabled
              variant="secondary"
              size="lg"
              block
              class="opacity-60"
            >
              Plano atual
            </AppButton>
          </div>
        </div>

        <!-- AVANCADO Plan -->
        <div class="relative bg-canvas rounded-2xl shadow-card overflow-hidden hover:shadow-card-lg transition">
          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-ink">Avançado</h2>
              <div v-if="currentPlan?.plan === 'AVANCADO'" class="px-3 py-1 bg-canvas-soft-2 text-ink text-xs font-semibold rounded-full">
                Plano atual
              </div>
            </div>

            <div class="mb-6">
              <span class="text-4xl font-bold text-ink">R$49,90</span>
              <span class="text-ink-mute">/mês</span>
            </div>

            <ul class="space-y-4 mb-8 text-ink-body">
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-warning" />
                <span>Roadmaps ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-warning" />
                <span>Módulos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-warning" />
                <span>Tópicos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-warning" />
                <span>Recursos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <CheckIcon class="w-5 h-5 text-ds-warning" />
                <span>150 créditos IA/mês</span>
              </li>
            </ul>

            <AppButton
              v-if="currentPlan?.plan !== 'AVANCADO'"
              @click="upgrade('AVANCADO')"
              :disabled="isLoadingCheckout"
              :loading="isLoadingCheckout"
              variant="ghost"
              size="lg"
              block
              class="bg-hairline-strong text-on-primary hover:opacity-90"
            >
              {{ isLoadingCheckout ? '' : 'Fazer upgrade' }}
            </AppButton>
            <AppButton
              v-else
              disabled
              variant="secondary"
              size="lg"
              block
              class="opacity-60"
            >
              Plano atual
            </AppButton>
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
import AppSpinner from '../components/atoms/AppSpinner.vue'
import AppButton from '../components/atoms/AppButton.vue'
const currentPlan = ref<any>(null)
const isLoading = ref(false)
const isLoadingCheckout = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await loadPlan()
})

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}


async function loadPlan() {
  isLoading.value = true
  error.value = null

  try {
    console.log('[PlansPage] Loading user plan...')
    const response = await api.get('/api/plan')
    console.log('[PlansPage] Plan loaded:', response)
    currentPlan.value = response
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar plano'
    console.error('[PlansPage] Error loading plan:', err)
    error.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

async function upgrade(plan: 'ESSENCIAL' | 'PLUS' | 'AVANCADO') {
  isLoadingCheckout.value = true
  error.value = null

  try {
    console.log(`[PlansPage] Starting checkout for plan: ${plan}`)
    console.log(`[PlansPage] POST /api/plan/checkout with body:`, { plan })

    const response = await api.post('/api/plan/checkout', { plan })
    console.log('[PlansPage] Checkout response:', response)

    // Se for downgrade para Essencial (plano gratuito)
    if (response.success && plan === 'ESSENCIAL') {
      console.log('[PlansPage] Downgrade to Essential completed successfully')

      // Formatar data de expiração se existir
      let message = 'Downgrade realizado com sucesso! Você agora tem acesso ao plano Essencial.'

      if (response.expiresAt) {
        const expiresDate = new Date(response.expiresAt)
        const formattedDate = expiresDate.toLocaleDateString('pt-BR')
        message += `\n\nVocê continuará pagando o plano anterior até ${formattedDate}.\nDepois disso, sua assinatura Essencial continuará ativa permanentemente.`
      }

      alert(message)
      // Recarregar dados do plano sem fazer reload da página
      await loadPlan()
      isLoadingCheckout.value = false
      return
    }

    // Para upgrades (PLUS e AVANCADO), redirecionar para checkout
    const { checkoutUrl, publicKey, preferenceId } = response
    console.log('[PlansPage] Received URLs:', { checkoutUrl, publicKey, preferenceId })

    if (!checkoutUrl) {
      throw new Error('checkoutUrl not returned from API')
    }

    console.log('[PlansPage] Redirecting to:', checkoutUrl)
    window.location.href = checkoutUrl
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao criar checkout'
    console.error('[PlansPage] Error creating checkout:', err)
    console.error('[PlansPage] Error message:', errorMsg)
    error.value = errorMsg
    isLoadingCheckout.value = false
  }
}
</script>
