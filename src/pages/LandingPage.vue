<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import HeroSection from '@/components/organisms/HeroSection.vue'
import BenefitsSection from '@/components/organisms/BenefitsSection.vue'
import ScienceSection from '@/components/organisms/ScienceSection.vue'
import CTASection from '@/components/organisms/CTASection.vue'
import { useGoogleSignIn } from '@/composables/useGoogleSignIn'
import { ArrowPathIcon } from '@heroicons/vue/24/solid'
import type { GoogleCredentialResponse } from '@/types/google'

const router = useRouter()
const authStore = useAuthStore()
const { withLoading } = useGlobalLoading()

const showAuthModal = ref(false)
const authMode = ref<'login' | 'register'>('register')
const email = ref('')
const password = ref('')
const consentGiven = ref(false)
const authError = ref<string | null>(null)
const isSubmitting = ref(false)

const { setCallback, renderButton } = useGoogleSignIn()

watch(showAuthModal, async (newVal) => {
  if (newVal) {
    await nextTick()
    setCallback(handleGoogleLogin)
    renderButton('google-signin-button-landing')
  }
})

const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
  authError.value = null
  isSubmitting.value = true

  try {
    const credential = response.credential
    if (!credential) {
      throw new Error('Google token não foi obtido')
    }

    await withLoading(
      authStore.loginWithGoogle(credential),
      'Entrando com Google...'
    )
    showAuthModal.value = false
    router.push('/dashboard')
  } catch (e) {
    authError.value = e instanceof Error ? e.message : String(e)
  } finally {
    isSubmitting.value = false
  }
}

function openRegister() {
  authMode.value = 'register'
  email.value = ''
  password.value = ''
  consentGiven.value = false
  authError.value = null
  showAuthModal.value = true
}

function openLogin() {
  authMode.value = 'login'
  email.value = ''
  password.value = ''
  consentGiven.value = false
  authError.value = null
  showAuthModal.value = true
}

async function submitAuth() {
  authError.value = null
  isSubmitting.value = true

  try {
    if (authMode.value === 'register') {
      await withLoading(
        authStore.register(email.value, password.value, undefined, consentGiven.value),
        'Criando sua conta...'
      )
    } else {
      await withLoading(
        authStore.login(email.value, password.value),
        'Entrando...'
      )
    }

    showAuthModal.value = false
    router.push('/dashboard')
  } catch (e) {
    authError.value = e instanceof Error ? e.message : String(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:to-slate-900">
    <HeroSection @register="openRegister" @login="openLogin" />
    <BenefitsSection />
    <ScienceSection />
    <CTASection @register="openRegister" @login="openLogin" />

    <!-- Auth Modal -->
    <div
      v-if="showAuthModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click="showAuthModal = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {{ authMode === 'register' ? 'Criar conta' : 'Entrar' }}
        </h2>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail
            </label>
            <input
              v-model="email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="seu@email.com"
              @keyup.enter="submitAuth"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <input
              v-model="password"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              :placeholder="authMode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'"
              @keyup.enter="submitAuth"
            />
          </div>

          <div v-if="authMode === 'register'" class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <input
              id="landing-consent"
              v-model="consentGiven"
              type="checkbox"
              class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer flex-shrink-0"
            />
            <label for="landing-consent" class="text-xs text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
              Li e aceito a
              <a href="/privacidade" class="text-blue-600 dark:text-blue-400 hover:underline" @click="showAuthModal = false">Política de Privacidade</a>
              e os
              <a href="/termos" class="text-blue-600 dark:text-blue-400 hover:underline" @click="showAuthModal = false">Termos de Serviço</a>
              do Sinapses.
            </label>
          </div>

          <p v-if="authError" class="text-sm text-red-600 dark:text-red-400">
            {{ authError }}
          </p>
        </div>

        <!-- Google Login Button -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div id="google-signin-button-landing" class="w-full flex justify-center" style="min-height: 48px;"></div>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            @click="submitAuth"
            :disabled="isSubmitting || (authMode === 'register' && !consentGiven)"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowPathIcon v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? 'Carregando...' : 'Continuar' }}
          </button>
          <button
            @click="showAuthModal = false"
            class="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>

        <button
          type="button"
          class="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
          @click="authMode = authMode === 'login' ? 'register' : 'login'; authError = null; consentGiven = false"
        >
          {{ authMode === 'login' ? 'Criar conta' : 'Já tenho conta' }}
        </button>
      </div>
    </div>
  </div>
</template>
