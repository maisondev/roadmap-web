<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()
const router = useRouter()

const showMenu = ref(false)

function getNotificationColor(type: string) {
  const colors = {
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  return colors[type as keyof typeof colors] || colors.info
}

function getNotificationBorderColor(type: string) {
  const colors = {
    info: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    error: 'border-l-red-500'
  }
  return colors[type as keyof typeof colors] || colors.info
}

async function toggleMenu() {
  if (!showMenu.value) {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (response.ok) {
        const serverNotifications = await response.json()
        notificationsStore.loadFromServer(serverNotifications)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }
  showMenu.value = !showMenu.value
}
</script>

<template>
  <div v-if="authStore.isLoggedIn" class="relative">
    <button
      @click="toggleMenu"
      class="relative p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="Notificações"
    >
      <BellIcon class="w-5 h-5" />
      <span
        v-if="notificationsStore.unreadCount > 0"
        class="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
      >
        {{ notificationsStore.unreadCount }}
      </span>
    </button>

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
        class="absolute -right-4 mt-2 w-[28rem] sm:w-[28rem] max-w-[90vw] max-h-[48rem] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <!-- Header -->
        <div class="sticky top-0 flex items-center justify-between bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">Notificações</h3>
            <span v-if="notificationsStore.unreadCount > 0" class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
              {{ notificationsStore.unreadCount }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="notificationsStore.unreadCount > 0"
              @click="notificationsStore.markAllAsReadSync()"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Marcar tudo
            </button>
            <button
              @click="router.push('/notifications'); showMenu = false"
              class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Ver todas as notificações"
            >
              Ver todas →
            </button>
          </div>
        </div>

        <!-- Notifications list -->
        <div v-if="notificationsStore.sortedNotifications.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="notif in notificationsStore.sortedNotifications"
            :key="notif.id"
            :class="[
              'border-l-4 p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
              getNotificationBorderColor(notif.type),
              notif.read
                ? 'bg-white dark:bg-gray-800'
                : 'bg-blue-50 dark:bg-blue-900/20'
            ]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0 cursor-pointer" @click="notificationsStore.markAsReadSync(notif.id)">
                <p class="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                  {{ notif.title }}
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap break-words leading-relaxed">
                  {{ notif.message }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
                  {{ new Date(notif.timestamp).toLocaleString('pt-BR') }}
                </p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  @click.stop="notificationsStore.toggleReadSync(notif.id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  :title="notif.read ? 'Marcar como não lido' : 'Marcar como lido'"
                >
                  <span v-if="!notif.read" class="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                  <span v-else class="w-2.5 h-2.5 bg-gray-400 rounded-full inline-block"></span>
                </button>
                <button
                  @click.stop="notificationsStore.removeNotificationSync(notif.id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="p-8 text-center">
          <BellIcon class="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Nenhuma notificação no momento
          </p>
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
