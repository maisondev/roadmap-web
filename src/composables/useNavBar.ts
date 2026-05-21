import { ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGoogleSignIn } from '@/composables/useGoogleSignIn'
import type { GoogleCredentialResponse } from '@/types/google'
import { useRouter } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useNavBar() {
  const authStore = useAuthStore()
  const router = useRouter()
  const { withLoading } = useGlobalLoading()

  // Estado dos modais
  const showAuthModal = ref(false)
  const authMode = ref<'login' | 'register'>('login')
  const email = ref('')
  const password = ref('')
  const fullName = ref('')
  const consentGiven = ref(false)
  const authError = ref<string | null>(null)
  const showPassword = ref(false)
  const showMobileMenu = ref(false)
  const showFeedbackModal = ref(false)

  // Google OAuth
  const { setCallback, renderButton } = useGoogleSignIn()

  // Watch para renderizar botão Google quando modal abre
  watch(showAuthModal, async (newVal) => {
    if (newVal) {
      await nextTick()
      setCallback(handleGoogleLogin)
      renderButton('google-signin-button-navbar')
    }
  })

  function openLogin() {
    authMode.value = 'login'
    email.value = ''
    password.value = ''
    fullName.value = ''
    consentGiven.value = false
    authError.value = null
    showPassword.value = false
    showAuthModal.value = true
  }

  function openRegister() {
    authMode.value = 'register'
    email.value = ''
    password.value = ''
    fullName.value = ''
    consentGiven.value = false
    authError.value = null
    showPassword.value = false
    showAuthModal.value = true
  }

  async function submitAuth() {
    authError.value = null
    try {
      if (authMode.value === 'register') {
        await withLoading(
          authStore.register(email.value, password.value, fullName.value, consentGiven.value),
          'Criando sua conta...'
        )
      } else {
        await withLoading(
          authStore.login(email.value, password.value),
          'Entrando...'
        )
      }
      showAuthModal.value = false
    } catch (e) {
      authError.value = e instanceof Error ? e.message : String(e)
    }
  }

  const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
    authError.value = null

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
    }
  }

  function switchAuthMode() {
    authMode.value = authMode.value === 'login' ? 'register' : 'login'
    authError.value = null
    consentGiven.value = false
  }

  function closeAuthModal() {
    showAuthModal.value = false
  }

  return {
    // Estado
    showAuthModal,
    authMode,
    email,
    password,
    fullName,
    consentGiven,
    authError,
    showPassword,
    showMobileMenu,
    showFeedbackModal,

    // Ações
    openLogin,
    openRegister,
    submitAuth,
    switchAuthMode,
    closeAuthModal,
  }
}
