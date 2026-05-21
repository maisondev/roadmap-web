<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDailyLogStore } from '@/stores/dailyLog'
import { useSync } from '@/composables/useSync'
import { useNavBar } from '@/composables/useNavBar'
import { ArrowLeftIcon, HomeIcon, Bars3Icon, ChartBarIcon, CalendarIcon, TrophyIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/vue/24/outline'
import AppButton from '@/components/atoms/AppButton.vue'
import FeedbackModal from '@/components/molecules/FeedbackModal.vue'
import AuthActions from '@/components/molecules/AuthActions.vue'
import NavNotificationsDropdown from '@/components/molecules/NavNotificationsDropdown.vue'
import NavProfileDropdown from '@/components/molecules/NavProfileDropdown.vue'
import NavAuthModal from '@/components/molecules/NavAuthModal.vue'
import NavMobileDrawer from '@/components/molecules/NavMobileDrawer.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const dailyLogStore = useDailyLogStore()
const { syncStatus } = useSync()

const {
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
  openLogin,
  openRegister,
  submitAuth,
  switchAuthMode,
  closeAuthModal
} = useNavBar()

const showBackButton = computed(() => {
  if (route.name === 'block-detail') return true
  if (!authStore.isLoggedIn && ['contact', 'help'].includes(route.name as string)) return true
  return false
})

const backLabel = computed(() => {
  if (route.name === 'block-detail') return 'Roadmap'
  if (route.name === 'contact' || route.name === 'help') return 'Voltar'
  return ''
})

function goBack() {
  if (route.name === 'block-detail') {
    router.push({
      name: 'roadmap',
      params: { roadmapId: route.params.roadmapId }
    })
  } else if (route.name === 'contact' || route.name === 'help') {
    router.push('/')
  }
}

function navigateTo(path: string, name: string) {
  router.push({
    name,
    params: path === '/roadmap' ? { roadmapId: 'interpretacao-textos' } : undefined
  })
  showMobileMenu.value = false
}

const navItems = computed(() => {
  const items = [
    { name: 'home', path: '/', label: 'Roadmaps', icon: HomeIcon },
    { name: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { name: 'daily-log', path: '/daily-log', label: 'Registros', icon: CalendarIcon },
    { name: 'achievements', path: '/achievements', label: 'Conquistas', icon: TrophyIcon }
  ]
  if (authStore.isOwner) {
    items.push({ name: 'plans', path: '/plans', label: 'Planos', icon: CreditCardIcon })
  }
  if (authStore.isAdmin) {
    items.push({ name: 'admin', path: '/admin', label: 'Admin', icon: ShieldCheckIcon })
  }
  return items
})

const isActive = (name: string) => route.name === name
</script>

<template>
  <nav :class="[`sticky top-0 z-50`, authStore.isLoggedIn ? `bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-sm` : `bg-slate-950 border-b border-slate-800/60`]">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Logo + Back button -->
        <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
          <button
            @click="router.push('/')"
            class="py-1 px-1 rounded-lg hover:opacity-75 transition-opacity focus:outline-none flex-shrink-0"
            title="Voltar para home"
          >
            <img src="@/assets/sinapses-logo.png" alt="Sinapses" class="h-16 sm:h-16 md:h-20 w-auto object-contain" />
          </button>
          <button
            v-if="showBackButton"
            @click="goBack"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="authStore.isLoggedIn
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-slate-300 hover:bg-slate-800'"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            {{ backLabel }}
          </button>
        </div>

        <!-- Center: Desktop navigation -->
        <div v-if="authStore.isLoggedIn" class="hidden md:flex items-center gap-1 flex-1 justify-center">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="navigateTo(item.path, item.name)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.name)
                ? 'bg-primary text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </button>
        </div>

        <!-- Center: Public links (not logged in) -->
        <div v-else class="hidden md:flex items-center gap-8">
          <button @click="router.push('/')" class="text-slate-300 hover:text-white text-sm transition-colors">Início</button>
          <button @click="router.push('/help')" class="text-slate-300 hover:text-white text-sm transition-colors">Ajuda</button>
          <button @click="router.push('/contact')" class="text-slate-300 hover:text-white text-sm transition-colors">Contato</button>
        </div>

        <!-- Right: Actions + Hamburguer -->
        <div class="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
          <!-- Streak counter -->
          <div
            v-if="dailyLogStore.streakDays > 0"
            class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30"
          >
            <div class="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {{ dailyLogStore.streakDays }}
            </div>
            <span class="text-xs font-semibold text-orange-700 dark:text-orange-300 whitespace-nowrap">
              dias
            </span>
          </div>

          <!-- Notifications -->
          <NavNotificationsDropdown />

          <!-- Profile (desktop only) -->
          <NavProfileDropdown v-if="authStore.isLoggedIn" class="hidden md:block" @openFeedback="showFeedbackModal = true" />

          <!-- Auth Actions (desktop, not logged in) -->
          <AuthActions v-else class="hidden md:flex" variant="navbar" @register="openRegister" @login="openLogin" />

          <!-- Mobile Menu Button (always last, fixed position) -->
          <button
            class="md:hidden p-2.5 rounded-lg transition-colors flex-shrink-0"
            :class="authStore.isLoggedIn
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-slate-300 hover:bg-slate-800'"
            @click="showMobileMenu = true"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Sub-components -->
  <NavMobileDrawer
    :open="showMobileMenu"
    @close="showMobileMenu = false"
    @openLogin="openLogin"
    @openRegister="openRegister"
    @openFeedback="showFeedbackModal = true"
  />

  <NavAuthModal
    :open="showAuthModal"
    :mode="authMode"
    :email="email"
    :password="password"
    :fullName="fullName"
    :consentGiven="consentGiven"
    :authError="authError"
    :showPassword="showPassword"
    @close="closeAuthModal"
    @submit="submitAuth"
    @switchMode="switchAuthMode"
    @updateEmail="email = $event"
    @updatePassword="password = $event"
    @updateFullName="fullName = $event"
    @updateConsent="consentGiven = $event"
    @togglePassword="showPassword = !showPassword"
  />

  <FeedbackModal
    :open="showFeedbackModal"
    @close="showFeedbackModal = false"
  />
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







