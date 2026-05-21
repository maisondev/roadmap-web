<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { Cog6ToothIcon, ChatBubbleLeftEllipsisIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import MD5 from 'crypto-js/md5'

defineEmits<{
  (e: 'openFeedback'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const showMenu = ref(false)
const profileImageLoaded = ref(true)

function getGravatarUrl(userEmail: string): string {
  const emailLower = userEmail.toLowerCase().trim()
  const hash = MD5(emailLower).toString()
  return `https://www.gravatar.com/avatar/${hash}?s=40&d=identicon`
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')
}

const profileAvatarUrl = computed(() => {
  if (authStore.user?.avatar) return authStore.user.avatar
  return getGravatarUrl(authStore.userEmail || '')
})

const profileInitials = computed(() => {
  return getUserInitials(authStore.user?.name || authStore.username || 'U')
})

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function logout() {
  handleLogout()
  showMenu.value = false
}

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>

<template>
  <div class="relative">
    <!-- Profile button -->
    <button
      @click="showMenu = !showMenu"
      class="flex items-center gap-2 px-2.5 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <img
        v-if="profileImageLoaded"
        :src="profileAvatarUrl"
        :alt="authStore.username"
        class="w-8 h-8 rounded-full"
        @error="profileImageLoaded = false"
      />
      <div
        v-else
        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
      >
        {{ profileInitials }}
      </div>
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        class="absolute -right-2 sm:-right-4 mt-2 w-72 sm:w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
      >
        <!-- Profile header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4">
          <div class="flex items-start gap-2 sm:gap-3">
            <img
              v-if="profileImageLoaded"
              :src="profileAvatarUrl"
              :alt="authStore.user?.name || 'Usuário'"
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex-shrink-0"
              @error="profileImageLoaded = false"
            />
            <div
              v-else
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex items-center justify-center bg-white/20 flex-shrink-0 text-white font-bold text-sm sm:text-base"
            >
              {{ profileInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-xs sm:text-sm whitespace-normal break-words">
                {{ authStore.user?.name || 'Usuário' }}
              </p>
              <p class="text-blue-100 text-xs truncate">
                {{ authStore.userEmail }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menu items -->
        <div class="py-2 border-t border-gray-200 dark:border-gray-700">
          <!-- Settings button -->
          <button
            @click="router.push('/settings'); showMenu = false"
            class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            title="Configurações"
          >
            <Cog6ToothIcon class="w-4 h-4 flex-shrink-0" />
            Configurações
          </button>

          <!-- Feedback button -->
          <button
            @click="$emit('openFeedback'); showMenu = false"
            class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            title="Enviar Feedback"
          >
            <ChatBubbleLeftEllipsisIcon class="w-4 h-4 flex-shrink-0" />
            Feedback
          </button>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme(); showMenu = false"
            class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            :title="settingsStore.settings.theme === 'dark' ? 'Modo claro' : 'Modo escuro'"
          >
            <SunIcon v-if="settingsStore.settings.theme === 'dark'" class="w-4 h-4 flex-shrink-0" />
            <MoonIcon v-else class="w-4 h-4 flex-shrink-0" />
            {{ settingsStore.settings.theme === 'dark' ? 'Modo claro' : 'Modo escuro' }}
          </button>

          <!-- Divider -->
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          <!-- Logout button -->
          <button
            @click="logout"
            class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </Transition>

    <!-- Close dropdown on outside click -->
    <div
      v-if="showMenu"
      @click="showMenu = false"
      class="fixed inset-0 z-40"
    />
  </div>
</template>
