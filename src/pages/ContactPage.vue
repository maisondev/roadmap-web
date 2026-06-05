<script setup lang="ts">
import { ref } from 'vue'
import { EnvelopeIcon } from '@heroicons/vue/24/outline'
import SocialIcon from '@/components/atoms/SocialIcon.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'

interface ContactLink {
  name: string
  icon: 'instagram' | 'twitter' | 'email'
  url: string
}

const contactLinks: ContactLink[] = [
  {
    name: 'Instagram',
    icon: 'instagram',
    url: 'https://www.instagram.com/sinapses.site/'
  },
  {
    name: 'Twitter',
    icon: 'twitter',
    url: 'https://x.com/sinapsesite'
  },
  {
    name: 'Email',
    icon: 'email',
    url: 'mailto:hello@sinapses.site'
  }
]

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitted = ref(false)

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.email || !formData.value.message) {
    alert('Por favor, preencha todos os campos obrigatórios')
    return
  }

  // Enviar para o email via mailto
  const mailto = `mailto:hello@sinapses.site?subject=${encodeURIComponent(formData.value.subject || 'Contato via site')}&body=${encodeURIComponent(
    `Nome: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMensagem:\n${formData.value.message}`
  )}`

  window.location.href = mailto

  // Reset do formulário
  formData.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
  submitted.value = true
  setTimeout(() => {
    submitted.value = false
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title="Entre em Contato"
        description="Tem dúvidas, sugestões ou feedback? Adoramos ouvir de você!"
      />

      <!-- Contact Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <a
          v-for="link in contactLinks"
          :key="link.name"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group p-4 sm:p-6 rounded-lg border border-hairline hover:border-transparent transition-all duration-300 bg-canvas hover:shadow-lg"
        >
          <div class="flex flex-col items-center space-y-2 sm:space-y-3">
            <div class="group-hover:scale-110 transition-transform duration-300">
              <SocialIcon :icon="link.icon" :size="48" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-ink">
              {{ link.name }}
            </h3>
            <p v-if="link.name === 'Email'" class="text-sm text-gray-500 dark:text-gray-400 break-all">
              hello@sinapses.site
            </p>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              Siga-nos
            </p>
          </div>
        </a>
      </div>

      <!-- Contact Form -->
      <div class="bg-canvas-soft rounded-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-ink mb-1 sm:mb-2">
            Envie uma Mensagem
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Preencha o formulário abaixo e entraremos em contato em breve.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-xs sm:text-sm font-medium text-ink-body mb-1 sm:mb-2">
              Nome <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Seu nome"
              class="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-ink placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs sm:text-sm font-medium text-ink-body mb-1 sm:mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="seu.email@exemplo.com"
              class="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-ink placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-xs sm:text-sm font-medium text-ink-body mb-1 sm:mb-2">
              Assunto
            </label>
            <input
              v-model="formData.subject"
              type="text"
              placeholder="Ex: Feedback, Dúvida, Bug Report"
              class="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-ink placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <!-- Message -->
          <div>
            <label class="block text-xs sm:text-sm font-medium text-ink-body mb-1 sm:mb-2">
              Mensagem <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.message"
              placeholder="Digite sua mensagem aqui..."
              rows="5"
              class="w-full px-3 sm:px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-ink placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <EnvelopeIcon class="w-4 sm:w-5 h-4 sm:h-5" />
            Enviar Mensagem
          </button>

          <!-- Success Message -->
          <Transition
            enter-active-class="transition-all duration-300"
            leave-active-class="transition-all duration-300"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div
              v-if="submitted"
              class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
            >
              ✓ Redirecionando para seu cliente de email...
            </div>
          </Transition>
        </form>
      </div>

      <!-- FAQ Shortcuts -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-4">
          Dúvidas Comuns?
        </h3>
        <p class="text-sm sm:text-base text-blue-800 dark:text-blue-200">
          Confira nossa <router-link to="/help" class="underline hover:opacity-75">Central de Ajuda</router-link> para respostas rápidas.
        </p>
      </div>
    </div>
  </div>
</template>
