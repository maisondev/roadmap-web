import { ref, onMounted } from 'vue'
import type { GoogleCredentialResponse } from '@/types/google'

const googleInitialized = ref(false)
let currentCallback: ((response: GoogleCredentialResponse) => void) | null = null

// Inicializar script apenas uma vez globalmente
function initializeGoogleScript() {
  if (document.getElementById('google-script')) return

  const script = document.createElement('script')
  script.id = 'google-script'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
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
      callback: (response: GoogleCredentialResponse) => {
        if (currentCallback) {
          currentCallback(response)
        }
      }
    })
    googleInitialized.value = true
  } catch (e) {
    console.error('Erro ao inicializar Google:', e)
  }
}

export function useGoogleSignIn() {
  onMounted(() => {
    initializeGoogleScript()
  })

  function setCallback(callback: (response: GoogleCredentialResponse) => void) {
    currentCallback = callback
  }

  function renderButton(elementId: string) {
    const checkAndRender = () => {
      if (!window.google) {
        setTimeout(checkAndRender, 100)
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

    checkAndRender()
  }

  return {
    googleInitialized,
    setCallback,
    renderButton
  }
}
