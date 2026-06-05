<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDailyLogStore } from '@/stores/dailyLog'
import { useSettingsStore } from '@/stores/settings'
import { useSync } from '@/composables/useSync'
import { useNavBar } from '@/composables/useNavBar'
import { ArrowLeftIcon, HomeIcon, Bars3Icon, ChartBarIcon, CalendarIcon, TrophyIcon, ShieldCheckIcon, CreditCardIcon, MoonIcon, SunIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
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
const settingsStore = useSettingsStore()
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
  return false
})

const backLabel = computed(() => {
  if (route.name === 'block-detail') return 'Roadmap'
  return ''
})

function goBack() {
  if (route.name === 'block-detail') {
    router.push({
      name: 'roadmap',
      params: { roadmapId: route.params.roadmapId }
    })
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
    { name: 'achievements', path: '/achievements', label: 'Conquistas', icon: TrophyIcon },
    { name: 'teacher-ranking', path: '/teacher-ranking', label: 'Professores', icon: UserGroupIcon }
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
  <nav class="sticky top-0 z-50 bg-canvas border-b border-hairline shadow-sm">
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
            class="flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors text-ink-body hover:bg-canvas-soft-2"
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
              'flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors',
              isActive(item.name)
                ? 'bg-ink text-on-primary'
                : 'text-ink-body hover:bg-canvas-soft-2'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </button>
        </div>

        <!-- Center: Public links (not logged in) -->
        <div v-else class="hidden md:flex items-center gap-8">
          <button @click="router.push({ name: 'home' })" class="text-ink-body hover:text-ink text-sm transition-colors">Início</button>
          <button @click="router.push({ name: 'help' })" class="text-ink-body hover:text-ink text-sm transition-colors">Ajuda</button>
          <button @click="router.push({ name: 'contact' })" class="text-ink-body hover:text-ink text-sm transition-colors">Contato</button>
        </div>

        <!-- Right: Actions + Hamburguer -->
        <div class="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
          <!-- Streak counter -->
          <div
            v-if="dailyLogStore.streakDays > 0"
            class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-[6px] bg-canvas-soft-2"
          >
            <div class="w-5 h-5 rounded-full bg-ds-warning flex items-center justify-center text-on-primary text-xs font-bold">
              {{ dailyLogStore.streakDays }}
            </div>
            <span class="text-xs font-semibold text-ink-body whitespace-nowrap">
              dias
            </span>
          </div>

          <!-- Notifications -->
          <NavNotificationsDropdown />

          <!-- Theme toggle -->
          <button
            @click="settingsStore.toggleTheme()"
            class="p-2.5 rounded-[6px] transition-colors text-ink-body hover:bg-canvas-soft-2"
            :title="`Alternar para modo ${settingsStore.settings.theme === 'dark' ? 'claro' : 'escuro'}`"
          >
            <SunIcon v-if="settingsStore.settings.theme === 'dark'" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>

          <!-- Profile (desktop only) -->
          <NavProfileDropdown v-if="authStore.isLoggedIn" class="hidden md:block" @openFeedback="showFeedbackModal = true" />

          <!-- Auth Actions (desktop, not logged in) -->
          <AuthActions v-else class="hidden md:flex" variant="navbar" @register="openRegister" @login="openLogin" />

          <!-- Mobile Menu Button (always last, fixed position) -->
          <button
            class="md:hidden p-2.5 rounded-[6px] transition-colors flex-shrink-0 text-ink-body hover:bg-canvas-soft-2"
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







