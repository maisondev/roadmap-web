<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '@/components/atoms/AppModal.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  mode: 'login' | 'register'
  email: string
  password: string
  fullName: string
  consentGiven: boolean
  authError: string | null
  showPassword: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'switchMode'): void
  (e: 'updateEmail', value: string): void
  (e: 'updatePassword', value: string): void
  (e: 'updateFullName', value: string): void
  (e: 'updateConsent', value: boolean): void
  (e: 'togglePassword'): void
}

defineProps<Props>()
defineEmits<Emits>()

const isRegister = computed<boolean>(() => {
  return true // será passado via props
})
</script>

<template>
  <AppModal
    :open="open"
    :title="mode === 'register' ? 'Criar conta' : 'Entrar'"
    submit-label="Continuar"
    cancel-label="Cancelar"
    @submit="$emit('submit')"
    @cancel="$emit('close')"
  >
    <div class="space-y-5 sm:space-y-4">
      <div v-if="mode === 'register'">
        <label class="block text-sm sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome completo
        </label>
        <input
          :value="fullName"
          @input="$emit('updateFullName', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label class="block text-sm sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          E-mail
        </label>
        <input
          :value="email"
          @input="$emit('updateEmail', ($event.target as HTMLInputElement).value)"
          type="email"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label class="block text-sm sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Senha
        </label>
        <div class="relative">
          <input
            :value="password"
            @input="$emit('updatePassword', ($event.target as HTMLInputElement).value)"
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
            :placeholder="mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'"
          />
          <button
            type="button"
            @click="$emit('togglePassword')"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <EyeIcon v-if="showPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="mode === 'register'" class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <input
          :checked="consentGiven"
          @change="$emit('updateConsent', ($event.target as HTMLInputElement).checked)"
          id="navbar-consent"
          type="checkbox"
          class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer flex-shrink-0"
        />
        <label for="navbar-consent" class="text-xs text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
          Li e aceito a
          <router-link to="/privacidade" class="text-blue-600 dark:text-blue-400 hover:underline" @click="$emit('close')">Política de Privacidade</router-link>
          e os
          <router-link to="/termos" class="text-blue-600 dark:text-blue-400 hover:underline" @click="$emit('close')">Termos de Serviço</router-link>
          do Sinapses. Estou ciente de como meus dados serão tratados conforme a LGPD.
        </label>
      </div>

      <p v-if="authError" class="text-sm text-red-600 dark:text-red-400">
        {{ authError }}
      </p>

      <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div id="google-signin-button-navbar" class="flex justify-center" style="min-height: 48px;"></div>
      </div>

      <button
        type="button"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        @click="$emit('switchMode')"
      >
        {{ mode === 'login' ? 'Criar conta' : 'Já tenho conta' }}
      </button>
    </div>
  </AppModal>
</template>
