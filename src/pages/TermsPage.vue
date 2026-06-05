<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/atoms/AppButton.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const terms = ref<{ version: string; lastUpdated: string; title: string; sections: { title: string; content: string }[] } | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/api/terms`)
    if (!res.ok) throw new Error('Erro ao carregar')
    terms.value = await res.json()
  } catch {
    error.value = 'Não foi possível carregar os Termos de Serviço.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div class="flex items-center gap-2">
        <AppButton variant="ghost" size="sm" @click="router.back()" class="text-xs sm:text-sm">← Voltar</AppButton>
      </div>

      <div v-if="isLoading" class="text-center py-16 text-gray-500 dark:text-gray-400">
        Carregando...
      </div>

      <div v-else-if="error" class="text-center py-16 text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <template v-else-if="terms">
        <PageHeader :title="terms.title">
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Versão {{ terms.version }} — Última atualização: {{ terms.lastUpdated }}
          </p>
        </PageHeader>

        <div class="space-y-4 sm:space-y-6">
          <div
            v-for="section in terms.sections"
            :key="section.title"
            class="space-y-1 sm:space-y-2"
          >
            <h2 class="text-sm sm:text-base font-semibold text-ink">{{ section.title }}</h2>
            <p class="text-xs sm:text-sm text-ink-body leading-relaxed">{{ section.content }}</p>
          </div>
        </div>

        <div class="pt-4 sm:pt-6 border-t border-hairline">
          <router-link to="/privacidade" class="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver também: Política de Privacidade →
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>
