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
  <div class="min-h-screen bg-canvas-soft">
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
        class="bg-canvas rounded-lg shadow-modal max-w-md w-full p-8"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-ink mb-6">
          {{ authMode === 'register' ? 'Criar conta' : 'Entrar' }}
        </h2>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-ink-body mb-2">
              E-mail
            </label>
            <input
              v-model="email"
              type="email"
              class="w-full px-3 py-2 border border-hairline rounded-[6px] bg-canvas-soft text-ink"
              placeholder="seu@email.com"
              @keyup.enter="submitAuth"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-body mb-2">
              Senha
            </label>
            <input
              v-model="password"
              type="password"
              class="w-full px-3 py-2 border border-hairline rounded-[6px] bg-canvas-soft text-ink"
              :placeholder="authMode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'"
              @keyup.enter="submitAuth"
            />
          </div>

          <div v-if="authMode === 'register'" class="flex items-start gap-3 p-3 bg-canvas-soft-2 rounded-[6px] border border-hairline">
            <input
              id="landing-consent"
              v-model="consentGiven"
              type="checkbox"
              class="mt-0.5 w-4 h-4 border-hairline rounded cursor-pointer flex-shrink-0"
            />
            <label for="landing-consent" class="text-xs text-ink-body cursor-pointer leading-relaxed">
              Li e aceito a
              <a href="/privacidade" class="text-ds-link hover:underline" @click="showAuthModal = false">Política de Privacidade</a>
              e os
              <a href="/termos" class="text-ds-link hover:underline" @click="showAuthModal = false">Termos de Serviço</a>
              do Sinapses.
            </label>
          </div>

          <p v-if="authError" class="text-sm text-ds-error">
            {{ authError }}
          </p>
        </div>

        <!-- Google Login Button -->
        <div class="mb-6 pb-6 border-b border-hairline">
          <div id="google-signin-button-landing" class="w-full flex justify-center" style="min-height: 48px;"></div>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            @click="submitAuth"
            :disabled="isSubmitting || (authMode === 'register' && !consentGiven)"
            class="flex-1 bg-ink text-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 rounded-[6px] transition-all flex items-center justify-center gap-2"
          >
            <ArrowPathIcon v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? 'Carregando...' : 'Continuar' }}
          </button>
          <button
            @click="showAuthModal = false"
            class="flex-1 bg-canvas-soft-2 text-ink hover:bg-canvas-soft font-medium py-2 rounded-[6px] transition-colors border border-hairline"
          >
            Cancelar
          </button>
        </div>

        <button
          type="button"
          class="w-full text-sm text-ds-link hover:underline"
          @click="authMode = authMode === 'login' ? 'register' : 'login'; authError = null; consentGiven = false"
        >
          {{ authMode === 'login' ? 'Criar conta' : 'Já tenho conta' }}
        </button>
      </div>
    </div>
  </div>
</template>
