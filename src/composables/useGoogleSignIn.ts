import { ref, watch, nextTick, onMounted } from 'vue'
import type { GoogleCredentialResponse } from '@/types/google'

const googleInitialized = ref(false)
const googleScriptLoaded = ref(false)

export function useGoogleSignIn() {
  onMounted(() => {
    loadGoogleScript()
  })

  function loadGoogleScript() {
    if (document.getElementById('google-script') || googleScriptLoaded.value) return

    const script = document.createElement('script')
    script.id = 'google-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      googleScriptLoaded.value = true
      initializeGoogle()
    }
    document.head.appendChild(script)
  }

  function initializeGoogle() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    if (!window.google?.accounts) {
      setTimeout(initializeGoogle, 100)
      return
    }

    if (googleInitialized.value) return

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {} // callback será sobrescrito por cada componente
      })
      googleInitialized.value = true
    } catch (e) {
      console.error('Erro ao inicializar Google:', e)
    }
  }

  function setCallback(callback: (response: GoogleCredentialResponse) => void) {
    ensureInitialized().then(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback
        })
      }
    })
  }

  function renderButton(elementId: string) {
    if (!window.google) {
      setTimeout(() => renderButton(elementId), 100)
      return
    }

    try {
      const element = document.getElementById(elementId)
      if (!element) return

      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        size: 'large',
        theme: 'filled_blue'
      })
    } catch (e) {
      console.error('Erro ao renderizar botão:', e)
    }
  }

  function ensureInitialized() {
    return new Promise<void>((resolve) => {
      if (googleInitialized.value) {
        resolve()
      } else {
        const checkInterval = setInterval(() => {
          if (googleInitialized.value) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      }
    })
  }

  return {
    googleInitialized,
    setCallback,
    renderButton,
    ensureInitialized
  }
}
