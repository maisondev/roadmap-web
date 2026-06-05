<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppModal from '@/components/atoms/AppModal.vue'
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BellIcon,
  CreditCardIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<any>(null)
const users = ref<any[]>([])
const activity = ref<any>(null)
const analytics = ref<any>(null)
const loginStats = ref<any>(null)
const geminiStats = ref<any>(null)
const isLoading = ref(true)
const isLoadingAnalytics = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'stats' | 'users' | 'activity' | 'notifications' | 'analytics' | 'plans' | 'ia'>('stats')
const plansStats = ref<any>(null)
const isLoadingPlans = ref(false)
const analyticsRange = ref(30)
const togglingUserId = ref<string | null>(null)
const deletingUserId = ref<string | null>(null)
const showDeleteModal = ref(false)
const userToDelete = ref<any>(null)

const selectedUserId = ref<string>('')
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationType = ref<'info' | 'success' | 'warning' | 'error'>('info')
const isSendingNotification = ref(false)
const notificationSendError = ref<string | null>(null)
const notificationSendSuccess = ref(false)

// Mensagem para primeiro roadmap
const firstRoadmapMessage = ref('Continue criando roadmaps incríveis! Você está no caminho certo!')
const isSendingFirstRoadmapMessage = ref(false)
const firstRoadmapSuccess = ref<string | null>(null)
const firstRoadmapError = ref<string | null>(null)

// Sincronização de badges
const isSyncingBadges = ref(false)
const syncBadgesSuccess = ref<string | null>(null)
const syncBadgesError = ref<string | null>(null)

// Modal de notificações de usuário
const showUserNotificationsModal = ref(false)
const selectedUser = ref<any>(null)
const userNotifications = ref<any[]>([])
const isLoadingUserNotifications = ref(false)
const deletingNotificationId = ref<string | null>(null)

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  isLoading.value = true
  error.value = null

  try {
    const [statsData, usersData, activityData, analyticsData, loginStatsData, plansData, geminiData] = await Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/users'),
      api.get('/api/admin/activity'),
      api.get(`/api/admin/analytics?days=${analyticsRange.value}`),
      api.get('/api/admin/stats/login-methods'),
      api.get('/api/admin/stats/plans'),
      api.get('/api/admin/gemini-usage')
    ])

    stats.value = statsData
    users.value = usersData
    activity.value = activityData
    analytics.value = analyticsData
    loginStats.value = loginStatsData
    plansStats.value = plansData
    geminiStats.value = geminiData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar dados'
    console.error(error.value)
  } finally {
    isLoading.value = false
  }
}

async function loadAnalytics() {
  isLoadingAnalytics.value = true
  try {
    analytics.value = await api.get(`/api/admin/analytics?days=${analyticsRange.value}`)
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingAnalytics.value = false
  }
}

async function setAnalyticsRange(days: number) {
  analyticsRange.value = days
  await loadAnalytics()
}

// Preenche todos os dias do período, colocando count=0 nos dias sem dados
const paddedUsersByDay = computed(() => {
  if (!analytics.value) return []
  const today = new Date()
  const dataMap = new Map(
    analytics.value.newUsersByDay.map((d: any) => [d.date, Number(d.count)])
  )
  const result: { date: string; count: number }[] = []
  for (let i = analyticsRange.value - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    result.push({ date: dateStr, count: dataMap.get(dateStr) || 0 })
  }
  return result
})

const maxUsersCount = computed(() => Math.max(...paddedUsersByDay.value.map(d => d.count), 1))

// SVG chart dimensions
const chartHeight = 140
const labelHeight = 18
const svgHeight = chartHeight + labelHeight
const barSlotWidth = computed(() => {
  const total = analyticsRange.value
  // Largura mínima de 8px por barra, máximo de 24px
  return Math.max(8, Math.min(24, 600 / total))
})
const svgWidth = computed(() => barSlotWidth.value * analyticsRange.value)
const barPad = 1

function barHeight(count: number) {
  return maxUsersCount.value > 0 ? (count / maxUsersCount.value) * chartHeight : 0
}

function barY(count: number) {
  return chartHeight - barHeight(count)
}

// Mostra label a cada N dias para não aglomerar
function shouldShowLabel(i: number) {
  const total = analyticsRange.value
  if (total <= 14) return true
  if (total <= 31) return i % 3 === 0
  return i % 7 === 0
}

function maxFeatureCount(items: any[]) {
  return Math.max(...items.map((i: any) => i.count), 1)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function changeRole(user: any, newRole: string) {
  togglingUserId.value = user.id
  try {
    const updated = await api.patch(`/api/admin/users/${user.id}/role`, { role: newRole })
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) users.value[idx].role = updated.role
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao alterar role'
  } finally {
    togglingUserId.value = null
  }
}

function confirmDelete(user: any) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function confirmDeleteUser() {
  if (!userToDelete.value) return
  const user = userToDelete.value
  deletingUserId.value = user.id
  try {
    await api.delete(`/api/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
    error.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao deletar usuário'
  } finally {
    deletingUserId.value = null
    showDeleteModal.value = false
    userToDelete.value = null
  }
}

async function sendNotification() {
  notificationSendError.value = null
  notificationSendSuccess.value = false

  if (!selectedUserId.value || !notificationTitle.value || !notificationMessage.value) {
    notificationSendError.value = 'Preencha todos os campos'
    return
  }

  isSendingNotification.value = true
  try {
    await api.post('/api/admin/send-notification', {
      userId: selectedUserId.value,
      title: notificationTitle.value,
      message: notificationMessage.value,
      type: notificationType.value
    })
    notificationSendSuccess.value = true
    selectedUserId.value = ''
    notificationTitle.value = ''
    notificationMessage.value = ''
    notificationType.value = 'info'
    setTimeout(() => { notificationSendSuccess.value = false }, 3000)
  } catch (err) {
    notificationSendError.value = err instanceof Error ? err.message : 'Erro ao enviar notificação'
  } finally {
    isSendingNotification.value = false
  }
}

async function viewUserNotifications(user: any) {
  selectedUser.value = user
  showUserNotificationsModal.value = true
  await loadUserNotifications(user.id)
}

async function loadUserNotifications(userId: string) {
  isLoadingUserNotifications.value = true
  try {
    const response = await api.get(`/api/admin/users/${userId}/notifications`)
    userNotifications.value = response.notifications || []
  } catch (err) {
    console.error('Erro ao carregar notificações do usuário:', err)
    userNotifications.value = []
  } finally {
    isLoadingUserNotifications.value = false
  }
}

async function deleteUserNotification(notificationId: string) {
  if (!selectedUser.value) return

  if (!confirm('Tem certeza que deseja remover esta notificação?')) {
    return
  }

  deletingNotificationId.value = notificationId
  try {
    await api.delete(`/api/admin/users/${selectedUser.value.id}/notifications/${notificationId}`)
    userNotifications.value = userNotifications.value.filter(n => n.id !== notificationId)

    // Atualizar o contador na tabela de usuários
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (userIndex !== -1 && users.value[userIndex]._count) {
      users.value[userIndex]._count.notifications = Math.max(0, users.value[userIndex]._count.notifications - 1)
    }
  } catch (err) {
    console.error('Erro ao remover notificação:', err)
    alert('Erro ao remover notificação: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
  } finally {
    deletingNotificationId.value = null
  }
}

async function sendFirstRoadmapMessage() {
  firstRoadmapError.value = null
  firstRoadmapSuccess.value = null

  if (!firstRoadmapMessage.value.trim()) {
    firstRoadmapError.value = 'A mensagem não pode estar vazia'
    return
  }

  isSendingFirstRoadmapMessage.value = true
  try {
    const response = await api.post('/api/admin/send-first-roadmap-message', {
      message: firstRoadmapMessage.value
    })
    firstRoadmapSuccess.value = `Messages enviadas para ${response.count} usuário(s)!`
    setTimeout(() => { firstRoadmapSuccess.value = null }, 4000)
    await loadStats()
  } catch (err) {
    firstRoadmapError.value = err instanceof Error ? err.message : 'Erro ao enviar mensagens'
  } finally {
    isSendingFirstRoadmapMessage.value = false
  }
}

async function syncBadges() {
  syncBadgesError.value = null
  syncBadgesSuccess.value = null

  isSyncingBadges.value = true
  try {
    const response = await api.post('/api/admin/sync-badges', {})
    syncBadgesSuccess.value = `Sync concluída! ${response.processed} usuários processados, ${response.awarded} badges concedidos.`
    setTimeout(() => { syncBadgesSuccess.value = null }, 5000)
    await loadStats()
  } catch (err) {
    syncBadgesError.value = err instanceof Error ? err.message : 'Erro ao sincronizar badges'
  } finally {
    isSyncingBadges.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas-soft">
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-ink">Painel de Administrador</h1>
          <p class="text-sm text-ink-body mt-1">Acompanhe a evolução do produto</p>
        </div>
        <AppButton variant="secondary" size="sm" @click="router.push('/')" class="flex items-center gap-2">
          ← Voltar
        </AppButton>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
        <button
          v-for="tab in [
            { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: SparklesIcon },
            { id: 'users', label: 'Usuários', icon: UsersIcon },
            { id: 'activity', label: 'Atividades', icon: DocumentTextIcon },
            { id: 'notifications', label: 'Notificações', icon: BellIcon },
            { id: 'plans', label: 'Planos', icon: CreditCardIcon },
            { id: 'ia', label: 'IA (Gemini)', icon: BoltIcon },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="[
            'flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap',
            activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-ink-body hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 bg-danger-50 dark:bg-danger-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-danger-600 dark:text-danger-400 text-sm">{{ error }}</p>
        <AppButton variant="secondary" size="sm" @click="loadStats" class="mt-2">Tentar novamente</AppButton>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-ink-body">Carregando dados...</p>
      </div>

      <!-- ===== STATS TAB ===== -->
      <div v-else-if="activeTab === 'stats' && stats" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Usuários</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalUsers }}</p>
            <p class="text-xs text-ink-body mt-1">{{ stats.usersToday }} hoje</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Roadmaps</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalRoadmaps }}</p>
            <p class="text-xs text-ink-body mt-1">{{ stats.roadmapsWeek }} esta semana</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Blocos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalBlocks }}</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Tópicos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalTopics }}</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Recursos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalResources }}</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Logs</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalLogs }}</p>
          </div>
        </div>

        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Top 5 Usuários Mais Ativos</h3>
          <div class="space-y-2">
            <div
              v-for="(user, idx) in stats.topUsers"
              :key="idx"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span class="text-sm text-ink">{{ user.email }}</span>
              <span class="text-sm font-semibold text-primary">{{ user.roadmapCount }} roadmaps</span>
            </div>
          </div>
        </div>

        <!-- Métodos de Login -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="loginStats">
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Login por Email</h3>
            <p class="text-4xl font-bold text-primary-600 dark:text-primary-400">{{ loginStats.email }}</p>
            <div class="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all"
                :style="{ width: `${loginStats.emailPercent}%` }"
              />
            </div>
            <p class="text-sm text-ink-body mt-2">{{ loginStats.emailPercent }}% do total</p>
          </div>

          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Login via Google</h3>
            <p class="text-4xl font-bold text-warning-600 dark:text-warning-400">{{ loginStats.google }}</p>
            <div class="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-warning-500 rounded-full transition-all"
                :style="{ width: `${loginStats.googlePercent}%` }"
              />
            </div>
            <p class="text-sm text-ink-body mt-2">{{ loginStats.googlePercent }}% do total</p>
          </div>

          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Total de Usuários</h3>
            <p class="text-4xl font-bold text-primary">{{ loginStats.total }}</p>
            <p class="text-sm text-ink-body mt-4">
              <span class="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded mr-2">
                {{ loginStats.email }}
              </span>
              <span class="inline-block px-2 py-1 bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs font-semibold rounded">
                {{ loginStats.google }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- ===== ANALYTICS TAB ===== -->
      <div v-else-if="activeTab === 'analytics'" class="space-y-6">
        <!-- Seletor de período -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-ink-body">Período:</span>
          <button
            v-for="d in [7, 30, 90]"
            :key="d"
            @click="setAnalyticsRange(d)"
            :class="[
              'px-3 py-1 text-sm rounded-full font-medium transition-colors',
              analyticsRange === d
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-ink-body hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ d }}d
          </button>
          <span v-if="isLoadingAnalytics" class="text-xs text-gray-500 dark:text-gray-400 ml-2">Atualizando...</span>
        </div>

        <!-- Gráfico: Novos usuários por dia -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-1">Novos usuários por dia</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Últimos {{ analyticsRange }} dias</p>

          <div v-if="analytics && paddedUsersByDay.length" class="overflow-x-auto">
            <svg
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
              :style="{ minWidth: '280px', width: '100%', height: '160px' }"
              preserveAspectRatio="none"
            >
              <g v-for="(item, i) in paddedUsersByDay" :key="item.date">
                <!-- Barra -->
                <rect
                  :x="i * barSlotWidth + barPad"
                  :y="barY(item.count)"
                  :width="barSlotWidth - barPad * 2"
                  :height="barHeight(item.count)"
                  fill="rgb(59, 130, 246)"
                  rx="2"
                  :opacity="item.count === 0 ? 0.15 : 0.85"
                />
                <!-- Barra de fundo (vazia) -->
                <rect
                  v-if="item.count === 0"
                  :x="i * barSlotWidth + barPad"
                  :y="0"
                  :width="barSlotWidth - barPad * 2"
                  :height="chartHeight"
                  fill="rgb(59, 130, 246)"
                  rx="2"
                  opacity="0.06"
                />
                <!-- Label data -->
                <text
                  v-if="shouldShowLabel(i)"
                  :x="i * barSlotWidth + barSlotWidth / 2"
                  :y="svgHeight - 2"
                  text-anchor="middle"
                  :font-size="Math.max(7, barSlotWidth * 0.45)"
                  fill="#71717A"
                >
                  {{ item.date.slice(5).replace('-', '/') }}
                </text>
                <!-- Tooltip: valor acima da barra -->
                <text
                  v-if="item.count > 0 && barSlotWidth >= 14"
                  :x="i * barSlotWidth + barSlotWidth / 2"
                  :y="barY(item.count) - 2"
                  text-anchor="middle"
                  :font-size="Math.max(7, barSlotWidth * 0.4)"
                  fill="rgb(59, 130, 246)"
                >
                  {{ item.count }}
                </text>
              </g>
            </svg>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados no período</p>
        </div>

        <!-- Cards: Usuários ativos + Taxa de abandono -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Usuários ativos -->
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-1">Usuários ativos (última semana)</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Criaram roadmap ou registro de log</p>

            <div v-if="analytics">
              <p class="text-4xl font-bold text-success-600 dark:text-success-400">
                {{ analytics.activeUsers.count }}
              </p>
              <p class="text-sm text-ink-body mt-1">
                de {{ analytics.churn.abandonedCount + analytics.activeUsers.count }} usuários com conta
              </p>

              <!-- Barra de progresso -->
              <div class="mt-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-success-500 rounded-full transition-all"
                  :style="{ width: `${Math.min(analytics.activeUsers.percentOfTotal, 100)}%` }"
                />
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ analytics.activeUsers.percentOfTotal }}% do total de usuários
              </p>
            </div>
          </div>

          <!-- Taxa de abandono -->
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-1">Taxa de abandono</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ analytics?.churn?.definition }}</p>

            <div v-if="analytics">
              <p class="text-4xl font-bold" :class="analytics.churn.abandonedPercent > 30 ? 'text-red-500' : 'text-warning-500'">
                {{ analytics.churn.abandonedPercent }}%
              </p>
              <p class="text-sm text-ink-body mt-1">
                {{ analytics.churn.abandonedCount }} usuários nunca criaram um roadmap
              </p>

              <!-- Barra de progresso -->
              <div class="mt-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="analytics.churn.abandonedPercent > 30 ? 'bg-danger-500' : 'bg-warning-400'"
                  :style="{ width: `${Math.min(analytics.churn.abandonedPercent, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Features mais usadas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4" v-if="analytics">
          <!-- Categorias de roadmap -->
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Categorias de roadmap</h3>
            <div v-if="analytics.featureUsage.roadmapCategories.length" class="space-y-3">
              <div
                v-for="item in analytics.featureUsage.roadmapCategories"
                :key="item.category"
                class="space-y-1"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-ink-body truncate max-w-[70%]">{{ item.category }}</span>
                  <span class="text-gray-500 dark:text-gray-400 font-medium">{{ item.count }}</span>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500 rounded-full"
                    :style="{ width: `${(item.count / maxFeatureCount(analytics.featureUsage.roadmapCategories)) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>

          <!-- Tipos de resource -->
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Tipos de recurso usados</h3>
            <div v-if="analytics.featureUsage.resourceTypes.length" class="space-y-3">
              <div
                v-for="item in analytics.featureUsage.resourceTypes"
                :key="item.type"
                class="space-y-1"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-ink-body">{{ item.type }}</span>
                  <span class="text-gray-500 dark:text-gray-400 font-medium">{{ item.count }}</span>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-secondary-500 rounded-full"
                    :style="{ width: `${(item.count / maxFeatureCount(analytics.featureUsage.resourceTypes)) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>

          <!-- Status dos tópicos -->
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg md:col-span-2">
            <h3 class="font-semibold text-ink mb-4">Status dos tópicos</h3>
            <div v-if="analytics.featureUsage.topicStatuses.length" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                v-for="item in analytics.featureUsage.topicStatuses"
                :key="item.status"
                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
              >
                <p class="text-2xl font-bold text-ink">{{ item.count }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ item.status }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>
        </div>
      </div>

      <!-- ===== USERS TAB ===== -->
      <div v-else-if="activeTab === 'users' && users" class="space-y-4">
        <div class="w-full rounded-lg border border-slate-200 dark:border-slate-700" style="overflow: visible;">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-canvas-soft border-b border-slate-200 dark:border-slate-700 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-ink text-xs">Email</th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Status</th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Login</th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Último</th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Consentimento</th>
                <th class="px-2 py-2 text-center font-semibold text-ink text-xs">RM</th>
                <th class="px-2 py-2 text-center font-semibold text-ink text-xs">Logs</th>
                <th class="px-2 py-2 text-center font-semibold text-ink text-xs"><BellIcon class="w-4 h-4 inline" /></th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Cadastro</th>
                <th class="px-2 py-2 text-left font-semibold text-ink text-xs">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 text-xs">
                <td class="px-3 py-2 text-ink font-medium">{{ user.email }}</td>
                <td class="px-2 py-2">
                  <span v-if="user.role === 'OWNER'" class="px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Owner
                  </span>
                  <span v-else-if="user.role === 'ADMIN'" class="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Admin
                  </span>
                  <span v-else class="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-ink-body text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Usuário
                  </span>
                </td>
                <td class="px-2 py-2">
                  <span v-if="user.loginMethod === 'GOOGLE'" class="px-1.5 py-0.5 bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Google
                  </span>
                  <span v-else class="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Email
                  </span>
                </td>
                <td class="px-2 py-2 text-ink-body whitespace-nowrap">
                  {{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—' }}
                </td>
                <td class="px-2 py-2">
                  <span v-if="user.consentGiven" class="px-1.5 py-0.5 bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
                    Sim
                  </span>
                  <span v-else class="px-1.5 py-0.5 bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300 text-xs font-semibold rounded whitespace-nowrap inline-block">
Não
                  </span>
                </td>
                <td class="px-2 py-2 text-ink-body text-center">{{ user._count.roadmaps }}</td>
                <td class="px-2 py-2 text-ink-body text-center">{{ user._count.logs }}</td>
                <td class="px-2 py-2 text-center">
                  <span class="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded inline-block">
                    {{ user._count.notifications }}
                  </span>
                </td>
                <td class="px-2 py-2 text-ink-body whitespace-nowrap text-xs">{{ formatDate(user.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2 items-center">
                    <select
                      :value="user.role"
                      @change="(e) => changeRole(user, (e.target as HTMLSelectElement).value)"
                      :disabled="togglingUserId === user.id || deletingUserId === user.id || authStore.user?.id === user.id || !authStore.isOwner"
                      class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-canvas text-ink disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    <button
                      @click="viewUserNotifications(user)"
                      :disabled="deletingUserId === user.id || togglingUserId === user.id"
                      class="px-3 py-1 text-xs font-medium rounded transition-colors bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ver
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      :disabled="deletingUserId === user.id || togglingUserId === user.id || authStore.user?.id === user.id || !authStore.isOwner"
                      :class="[
                        'px-3 py-1 text-xs font-medium rounded transition-colors',
                        deletingUserId === user.id || togglingUserId === user.id || !authStore.isOwner
                          ? 'bg-gray-300 dark:bg-gray-600 text-ink-body cursor-not-allowed'
                          : authStore.user?.id === user.id
                            ? 'bg-gray-300 dark:bg-gray-600 text-ink-body cursor-not-allowed'
                            : 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 hover:bg-warning-200 dark:hover:bg-warning-900/60'
                      ]"
                    >
                      {{ deletingUserId === user.id ? '...' : 'Deletar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== ACTIVITY TAB ===== -->
      <div v-else-if="activeTab === 'activity' && activity" class="space-y-4">
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Roadmaps Recentes</h3>
          <div class="space-y-2">
            <div
              v-for="roadmap in activity.recentRoadmaps"
              :key="roadmap.id"
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <p class="text-sm font-medium text-ink">{{ roadmap.title }}</p>
              <p class="text-xs text-ink-body mt-1">
                Por: <strong>{{ roadmap.user.email }}</strong> em {{ formatDate(roadmap.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PLANS TAB ===== -->
      <div v-else-if="activeTab === 'plans' && plansStats" class="space-y-6">
        <!-- Resumo por Plano -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Total de Usuários</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ plansStats.summaryCounts.total }}</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Essencial</p>
            <p class="text-3xl font-bold text-success-600 dark:text-success-400 mt-2">{{ plansStats.summaryCounts.essencial }}</p>
            <p class="text-xs text-ink-body mt-1">{{ plansStats.percentages.essencialPercent }}% do total</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Google Plus</p>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">{{ plansStats.summaryCounts.plus }}</p>
            <p class="text-xs text-ink-body mt-1">{{ plansStats.percentages.plusPercent }}% do total</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Avançado</p>
            <p class="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mt-2">{{ plansStats.summaryCounts.avancado }}</p>
            <p class="text-xs text-ink-body mt-1">{{ plansStats.percentages.avancadoPercent }}% do total</p>
          </div>
        </div>

        <!-- Assinaturas Ativas vs Expiradas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Assinaturas Ativas</h3>
            <p class="text-4xl font-bold text-success-600 dark:text-success-400">{{ plansStats.subscriptions.active }}</p>
            <p class="text-sm text-ink-body mt-2">Usuários com plano ativo</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-ink mb-4">Assinaturas Expiradas</h3>
            <p class="text-4xl font-bold text-warning-600 dark:text-warning-400">{{ plansStats.subscriptions.expired }}</p>
            <p class="text-sm text-ink-body mt-2">Usuários com plano expirado</p>
          </div>
        </div>

        <!-- Receita Estimada -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Receita Estimada Mensal</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-sm text-ink-body">Plus (R$ 19,90/mês)</p>
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">R$ {{ (plansStats.revenue.byPlan.plus || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-xs text-ink-body mt-1">{{ plansStats.summaryCounts.plus }} usuários</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-sm text-ink-body">Avançado (R$ 49,90/mês)</p>
              <p class="text-2xl font-bold text-secondary-600 dark:text-secondary-400 mt-2">R$ {{ (plansStats.revenue.byPlan.avancado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-xs text-ink-body mt-1">{{ plansStats.summaryCounts.avancado }} usuários</p>
            </div>
            <div class="p-4 bg-gradient-to-br from-success-50 to-success-50 dark:from-success-900/20 dark:to-success-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p class="text-sm font-semibold text-ink-body">Total Estimado</p>
              <p class="text-2xl font-bold text-success-600 dark:text-success-400 mt-2">R$ {{ (plansStats.revenue.estimated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
        </div>

        <!-- Alertas: Planos Expirando em 7 Dias -->
        <div v-if="plansStats.expiringPlans && plansStats.expiringPlans.length > 0" class="p-6 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Planos Expirando em 7 Dias</h3>
          <div class="space-y-3">
            <div
              v-for="user in plansStats.expiringPlans"
              :key="user.id"
              class="p-3 bg-canvas rounded border border-warning-200 dark:border-warning-800"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-ink">{{ user.email }}</p>
                  <p class="text-sm text-ink-body mt-1">
                    Plano: <strong>{{ user.plan }}</strong>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-warning-700 dark:text-warning-300">
                    Expira em: {{ new Date(user.planExpiresAt).toLocaleDateString('pt-BR') }}
                  </p>
                  <p class="text-xs text-ink-body mt-1">
                    {{ Math.ceil((new Date(user.planExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }} dias
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 bg-success-50 dark:bg-success-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm text-success-700 dark:text-success-300">Nenhum plano expirando nos próximos 7 dias</p>
        </div>
      </div>

      <!-- ===== NOTIFICATIONS TAB ===== -->
      <div v-else-if="activeTab === 'notifications' && users" class="space-y-6">
        <!-- Enviar Notificação para Usuário -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Enviar Notificação para Usuário</h3>
          <div class="space-y-4">
            <div v-if="notificationSendSuccess" class="p-3 bg-success-50 dark:bg-success-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-success-600 dark:text-success-400">Notificação enviada com sucesso!</p>
            </div>
            <div v-if="notificationSendError" class="p-3 bg-danger-50 dark:bg-danger-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-danger-600 dark:text-danger-400">{{ notificationSendError }}</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-ink-body mb-2">Selecione um usuário</label>
                <select v-model="selectedUserId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-canvas-soft text-ink">
                  <option value="">-- Selecione um usuário --</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }} ({{ user.role }})</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-body mb-2">Tipo de Notificação</label>
                <select v-model="notificationType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-canvas-soft text-ink">
                  <option value="info">Informação</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-body mb-2">Título</label>
                <input v-model="notificationTitle" type="text" placeholder="Título da notificação" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-canvas-soft text-ink" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-body mb-2">Mensagem</label>
                <textarea v-model="notificationMessage" placeholder="Mensagem da notificação" rows="4" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-canvas-soft text-ink" />
              </div>
              <AppButton variant="primary" @click="sendNotification" :disabled="isSendingNotification" class="w-full">
                {{ isSendingNotification ? 'Enviando...' : 'Enviar Notificação' }}
              </AppButton>
            </div>
          </div>
        </div>

        <!-- Mensagem para Primeiro Roadmap -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-2">Incentivar Usuários com 1 Roadmap</h3>
          <p class="text-sm text-ink-body mb-4">
            Envie mensagens personalizadas para usuários que criaram exatamente 1 roadmap e ainda não receberam a badge PRIMEIRA_AULA
          </p>

          <div class="space-y-4">
            <div v-if="firstRoadmapSuccess" class="p-3 bg-success-50 dark:bg-success-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-success-600 dark:text-success-400">{{ firstRoadmapSuccess }}</p>
            </div>
            <div v-if="firstRoadmapError" class="p-3 bg-danger-50 dark:bg-danger-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-danger-600 dark:text-danger-400">{{ firstRoadmapError }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-ink-body mb-2">Mensagem Personalizada</label>
              <textarea
                v-model="firstRoadmapMessage"
                placeholder="Digite a mensagem que será enviada aos usuários"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-canvas-soft text-ink"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Título da notificação será: "Continue Aprendendo!"
              </p>
            </div>

            <AppButton
              variant="primary"
              @click="sendFirstRoadmapMessage"
              :disabled="isSendingFirstRoadmapMessage"
              class="w-full"
            >
              {{ isSendingFirstRoadmapMessage ? 'Enviando...' : 'Enviar para Usuários' }}
            </AppButton>
          </div>
        </div>

        <!-- Sincronização de Badges -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-2">Sincronizar Badges</h3>
          <p class="text-sm text-ink-body mb-4">
            Processa todos os usuários e atribui badges que ainda não receberam com base em suas atividades (roadmaps criados, recursos adicionados, logs diários, etc)
          </p>

          <div class="space-y-4">
            <div v-if="syncBadgesSuccess" class="p-3 bg-success-50 dark:bg-success-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-success-600 dark:text-success-400">{{ syncBadgesSuccess }}</p>
            </div>
            <div v-if="syncBadgesError" class="p-3 bg-danger-50 dark:bg-danger-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-danger-600 dark:text-danger-400">{{ syncBadgesError }}</p>
            </div>

            <AppButton
              variant="primary"
              @click="syncBadges"
              :disabled="isSyncingBadges"
              class="w-full"
            >
              {{ isSyncingBadges ? 'Sincronizando...' : 'Sincronizar Badges de Todos os Usuários' }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- ===== IA (GEMINI) TAB ===== -->
      <div v-else-if="activeTab === 'ia' && geminiStats" class="space-y-6">
        <!-- Resumo Principal -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Roadmaps Gerados</p>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">{{ geminiStats.totalAiRoadmaps }}</p>
            <p class="text-xs text-ink-body mt-1">com IA (Gemini)</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Usuários Ativos</p>
            <p class="text-3xl font-bold text-success-600 dark:text-success-400 mt-2">{{ geminiStats.usersWithAi }}</p>
            <p class="text-xs text-ink-body mt-1">utilizaram IA</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Tokens Estimados</p>
            <p class="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mt-2">{{ (geminiStats.estimatedTokens / 1000).toFixed(0) }}k</p>
            <p class="text-xs text-ink-body mt-1">~1.5k por roadmap</p>
          </div>
          <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-ink-body">Custo Total</p>
            <p class="text-3xl font-bold text-warning-600 dark:text-warning-400 mt-2">US$ {{ geminiStats.estimatedCost.totalUSD.toFixed(2) }}</p>
            <p class="text-xs text-ink-body mt-1">{{ geminiStats.estimatedCost.description }}</p>
          </div>
        </div>

        <!-- Detalhes de Custos -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Análise de Custos</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-sm text-ink-body">Total de Tokens</span>
              <span class="text-sm font-semibold text-ink">{{ geminiStats.estimatedTokens.toLocaleString('pt-BR') }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-sm text-ink-body">Custo por Token</span>
              <span class="text-sm font-semibold text-ink">US$ {{ geminiStats.estimatedCost.costPerToken.toFixed(9) }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-danger-50 dark:from-orange-900/20 dark:to-danger-900/20 rounded border border-orange-200 dark:border-orange-800">
              <span class="text-sm font-semibold text-ink-body">Custo Total Estimado</span>
              <span class="text-lg font-bold text-warning-600 dark:text-warning-400">US$ {{ geminiStats.estimatedCost.totalUSD.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Usuários -->
        <div class="p-6 bg-canvas border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-ink mb-4">Top 10 Usuários com IA</h3>
          <div v-if="geminiStats.topUsers.length > 0" class="space-y-3">
            <div
              v-for="(user, idx) in geminiStats.topUsers"
              :key="user.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold">
                  {{ idx + 1 }}
                </span>
                <span class="text-sm text-ink truncate">{{ user.email }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {{  user.aiCreditsUsed }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                  US$ {{ (user.aiCreditsUsed * 1500 * geminiStats.estimatedCost.costPerToken).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-ink-body">Nenhum usuário utilizou IA ainda</p>
          </div>
        </div>

        <!-- Informações de Modelo -->
        <div class="p-6 bg-primary-50 dark:bg-primary-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 class="font-semibold text-ink mb-3">Detalhes Técnicos</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-ink-body">Modelo Utilizado</p>
              <p class="text-ink font-medium mt-1">Gemini Flash</p>
            </div>
            <div>
              <p class="text-ink-body">Tokens por Roadmap</p>
              <p class="text-ink font-medium mt-1">~1.500 (estimado)</p>
            </div>
            <div>
              <p class="text-ink-body">Método de Cálculo</p>
              <p class="text-ink font-medium mt-1">tokens × US$ 0,000000075</p>
            </div>
            <div>
              <p class="text-ink-body">Atualização</p>
              <p class="text-ink font-medium mt-1">Em tempo real</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh -->
      <div class="flex justify-end">
        <AppButton variant="secondary" size="sm" @click="loadStats" :disabled="isLoading" class="flex items-center gap-2">
          Atualizar
        </AppButton>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <AppModal
    :open="showDeleteModal"
    title="Confirmar Exclusão"
    submit-label="Deletar"
    submit-variant="danger"
    cancel-label="Cancelar"
    @submit="confirmDeleteUser"
    @cancel="showDeleteModal = false"
  >
    <div class="space-y-3">
      <p class="text-ink-body">
        Tem certeza que deseja deletar o usuário <strong>{{ userToDelete?.email }}</strong>?
      </p>
      <div class="p-3 bg-danger-50 dark:bg-danger-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-xs text-danger-600 dark:text-danger-400 font-semibold leading-relaxed">
          Esta ação não pode ser desfeita. Todos os roadmaps, logs e dados do usuário serão permanentemente removidos.
        </p>
      </div>
    </div>
  </AppModal>

  <!-- User Notifications Modal -->
  <AppModal
    :open="showUserNotificationsModal"
    :title="`Notificações de ${selectedUser?.email}`"
    submit-label=""
    cancel-label="Fechar"
    @cancel="showUserNotificationsModal = false"
  >
    <div class="space-y-4 max-h-96 overflow-y-auto">
      <div v-if="isLoadingUserNotifications" class="text-center py-8">
        <p class="text-ink-body">Carregando notificações...</p>
      </div>
      <div v-else-if="userNotifications.length === 0" class="text-center py-8">
        <p class="text-ink-body">Nenhuma notificação encontrada</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="notif in userNotifications"
          :key="notif.id"
          class="p-3 border rounded-lg border-hairline"
          :class="{
            'bg-primary-50 dark:bg-primary-900/20 border-blue-200 dark:border-blue-800': notif.type === 'info',
            'bg-success-50 dark:bg-success-900/20 border-green-200 dark:border-green-800': notif.type === 'success',
            'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800': notif.type === 'warning',
            'bg-danger-50 dark:bg-danger-900/20 border-red-200 dark:border-red-800': notif.type === 'error',
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-ink">{{ notif.title }}</p>
              <p class="text-sm text-ink-body mt-1">{{ notif.message }}</p>
              <p class="text-xs text-ink-body mt-2">
                {{ new Date(notif.createdAt).toLocaleString('pt-BR') }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                class="px-2 py-1 text-xs font-semibold rounded whitespace-nowrap"
                :class="{
                  'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-blue-200': notif.type === 'info',
                  'bg-success-200 dark:bg-success-800 text-success-700 dark:text-success-200': notif.type === 'success',
                  'bg-yellow-200 dark:bg-yellow-800 text-warning-700 dark:text-yellow-200': notif.type === 'warning',
                  'bg-danger-200 dark:bg-danger-800 text-danger-700 dark:text-danger-200': notif.type === 'error',
                }"
              >
                {{ notif.type }}
              </span>
              <button
                @click="deleteUserNotification(notif.id)"
                :disabled="deletingNotificationId === notif.id"
                class="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded transition-colors bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300 hover:bg-danger-200 dark:hover:bg-danger-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remover notificação"
              >
                {{ deletingNotificationId === notif.id ? '...' : '✕' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppModal>
</template>




