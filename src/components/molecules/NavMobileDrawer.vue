<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { api } from '@/services/api'
import { HomeIcon, ChartBarIcon, CalendarIcon, TrophyIcon, ShieldCheckIcon, ChatBubbleLeftEllipsisIcon, MapIcon, SunIcon, MoonIcon, XMarkIcon, ArrowRightOnRectangleIcon, CreditCardIcon } from '@heroicons/vue/24/outline'
import MD5 from 'crypto-js/md5'
import AppButton from '@/components/atoms/AppButton.vue'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'openLogin'): void
  (e: 'openRegister'): void
  (e: 'openFeedback'): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const profileImageLoaded = ref(true)
const planData = ref<any>(null)

onMounted(async () => {
  if (authStore.isLoggedIn) {
    try {
      planData.value = await api.get('/api/plan')
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
    }
  }
})

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

function navigateTo(path: string, name: string) {
  router.push({
    name,
    params: path === '/roadmap' ? { roadmapId: 'interpretacao-textos' } : undefined
  })
  emit('close')
}

function toggleThemeMobile() {
  settingsStore.toggleTheme()
  if (!authStore.isLoggedIn) {
    emit('close')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
  emit('close')
}

const navItems = computed(() => {
  const items = [
    { name: 'home', path: '/', label: 'Roadmaps', icon: HomeIcon },
    { name: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { name: 'daily-log', path: '/daily-log', label: 'Registros', icon: CalendarIcon },
    { name: 'achievements', path: '/achievements', label: 'Conquistas', icon: TrophyIcon },
    { name: 'plans', path: '/plans', label: 'Planos', icon: CreditCardIcon }
  ]
  if (authStore.isAdmin) {
    items.push({ name: 'admin', path: '/admin', label: 'Admin', icon: ShieldCheckIcon })
  }
  return items
})

const isActive = (name: string) => route.name === name
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        @click="emit('close')"
        :class="[
          'fixed inset-0 z-40 md:hidden',
          authStore.isLoggedIn ? 'bg-black/40 dark:bg-black/60' : 'bg-black/50'
        ]"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open"
        :class="[
          'fixed right-0 top-0 bottom-0 w-screen sm:w-80 max-w-full overflow-hidden shadow-lg z-50 md:hidden flex flex-col',
          authStore.isLoggedIn ? 'bg-canvas' : 'bg-slate-900'
        ]"
      >
        <!-- Drawer Header (Logado) -->
        <div v-if="authStore.isLoggedIn" class="p-4 border-b border-hairline space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-ink">Menu</h3>
            <button
              @click="emit('close')"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <!-- Profile Mini (Logado) -->
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <img
              v-if="profileImageLoaded"
              :src="profileAvatarUrl"
              :alt="authStore.username"
              class="w-10 h-10 rounded-full flex-shrink-0"
              @error="profileImageLoaded = false"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            >
              {{ profileInitials }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink truncate">{{ authStore.user?.name || authStore.username }}</p>
              <p class="text-xs text-ink-body truncate">{{ authStore.userEmail }}</p>
              <div v-if="planData" class="mt-1 inline-block">
                <span :class="[
                  'text-xs font-semibold px-2 py-0.5 rounded',
                  planData.plan === 'AVANCADO' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                  planData.plan === 'PLUS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                  'bg-gray-200 dark:bg-gray-600 text-ink-body'
                ]">
                  {{ planData.plan === 'AVANCADO' ? '🚀' : planData.plan === 'PLUS' ? '⭐' : '📦' }} {{ planData.plan }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Header (Não logado) -->
        <div v-else class="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 class="text-lg font-semibold text-white">Menu</h3>
          <button
            @click="emit('close')"
            class="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon class="w-6 h-6 text-slate-300" />
          </button>
        </div>

        <!-- Drawer Content (Logado) -->
        <div v-if="authStore.isLoggedIn" class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          <!-- Navigation Items -->
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="navigateTo(item.path, item.name)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
              isActive(item.name)
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-ink-body hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </button>

          <!-- Divider -->
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-4" />

          <!-- Theme Toggle in Drawer -->
          <button
            @click="toggleThemeMobile"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-ink-body hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SunIcon v-if="settingsStore.settings.theme === 'dark'" class="w-5 h-5 flex-shrink-0" />
            <MoonIcon v-else class="w-5 h-5 flex-shrink-0" />
            <span>{{ settingsStore.settings.theme === 'dark' ? 'Modo claro' : 'Modo escuro' }}</span>
          </button>
        </div>

        <!-- Drawer Footer (Logado) -->
        <div v-if="authStore.isLoggedIn" class="border-t border-hairline p-4">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5 flex-shrink-0" />
            <span>Sair</span>
          </button>
        </div>

        <!-- Drawer Content (Não logado) -->
        <div v-else class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          <!-- Public Navigation Items -->
          <button
            @click="router.push('/'); emit('close')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <HomeIcon class="w-5 h-5 flex-shrink-0" />
            <span>Início</span>
          </button>

          <button
            @click="router.push('/help'); emit('close')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon class="w-5 h-5 flex-shrink-0" />
            <span>Ajuda</span>
          </button>

          <button
            @click="router.push('/contatos'); emit('close')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <MapIcon class="w-5 h-5 flex-shrink-0" />
            <span>Contato</span>
          </button>

          <!-- Divider -->
          <div class="h-px bg-slate-700 my-3" />

          <!-- Ações (Feedback + Dark Mode) -->
          <div class="flex gap-2">
            <!-- Feedback -->
            <button
              @click="emit('openFeedback')"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              title="Enviar Feedback"
            >
              <ChatBubbleLeftEllipsisIcon class="w-5 h-5 flex-shrink-0" />
              <span class="hidden xs:inline">Feedback</span>
            </button>

            <!-- Theme Toggle -->
            <button
              @click="toggleThemeMobile"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              :title="settingsStore.settings.theme === 'dark' ? 'Modo claro' : 'Modo escuro'"
            >
              <SunIcon v-if="settingsStore.settings.theme === 'dark'" class="w-5 h-5 flex-shrink-0" />
              <MoonIcon v-else class="w-5 h-5 flex-shrink-0" />
              <span class="hidden xs:inline">{{ settingsStore.settings.theme === 'dark' ? 'Claro' : 'Escuro' }}</span>
            </button>
          </div>
        </div>

        <!-- Drawer Footer (Não logado) -->
        <div v-if="!authStore.isLoggedIn" class="border-t border-slate-700 p-3 space-y-2.5">
          <AppButton
            variant="secondary"
            size="sm"
            @click="emit('openLogin'); emit('close')"
            class="w-full text-xs sm:text-sm"
          >
            Entrar
          </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            @click="emit('openRegister'); emit('close')"
            class="w-full text-xs sm:text-sm"
          >
            Criar conta
          </AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
