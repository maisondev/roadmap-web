<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppModal from '@/components/atoms/AppModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<any>(null)
const users = ref<any[]>([])
const activity = ref<any>(null)
const analytics = ref<any>(null)
const loginStats = ref<any>(null)
const isLoading = ref(true)
const isLoadingAnalytics = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'stats' | 'users' | 'activity' | 'notifications' | 'analytics'>('stats')
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
const firstRoadmapMessage = ref('Continue criando roadmaps incríveis! Você está no caminho certo! 🚀')
const isSendingFirstRoadmapMessage = ref(false)
const firstRoadmapSuccess = ref<string | null>(null)
const firstRoadmapError = ref<string | null>(null)

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
    const [statsData, usersData, activityData, analyticsData, loginStatsData] = await Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/users'),
      api.get('/api/admin/activity'),
      api.get(`/api/admin/analytics?days=${analyticsRange.value}`),
      api.get('/api/admin/stats/login-methods')
    ])

    stats.value = statsData
    users.value = usersData
    activity.value = activityData
    analytics.value = analyticsData
    loginStats.value = loginStatsData
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
    firstRoadmapSuccess.value = `✓ Mensagens enviadas para ${response.count} usuário(s)!`
    setTimeout(() => { firstRoadmapSuccess.value = null }, 4000)
    await loadStats()
  } catch (err) {
    firstRoadmapError.value = err instanceof Error ? err.message : 'Erro ao enviar mensagens'
  } finally {
    isSendingFirstRoadmapMessage.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-light dark:bg-gray-900 p-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Painel de Administrador</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Acompanhe a evolução do produto</p>
        </div>
        <AppButton variant="secondary" size="sm" @click="router.push('/')" class="flex items-center gap-2">
          ← Voltar
        </AppButton>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
        <button
          v-for="tab in [
            { id: 'stats', label: '📊 Estatísticas' },
            { id: 'analytics', label: '📈 Analytics' },
            { id: 'users', label: '👥 Usuários' },
            { id: 'activity', label: '📝 Atividades' },
            { id: 'notifications', label: '🔔 Notificações' },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="[
            'px-4 py-3 font-medium transition-colors whitespace-nowrap',
            activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
        <AppButton variant="secondary" size="sm" @click="loadStats" class="mt-2">Tentar novamente</AppButton>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">Carregando dados...</p>
      </div>

      <!-- ===== STATS TAB ===== -->
      <div v-else-if="activeTab === 'stats' && stats" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalUsers }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ stats.usersToday }} hoje</p>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Roadmaps</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalRoadmaps }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ stats.roadmapsWeek }} esta semana</p>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Blocos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalBlocks }}</p>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Tópicos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalTopics }}</p>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Recursos</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalResources }}</p>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total de Logs</p>
            <p class="text-3xl font-bold text-primary mt-2">{{ stats.totalLogs }}</p>
          </div>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 5 Usuários Mais Ativos</h3>
          <div class="space-y-2">
            <div
              v-for="(user, idx) in stats.topUsers"
              :key="idx"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span class="text-sm text-gray-900 dark:text-white">{{ user.email }}</span>
              <span class="text-sm font-semibold text-primary">{{ user.roadmapCount }} roadmaps</span>
            </div>
          </div>
        </div>

        <!-- Métodos de Login -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="loginStats">
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">📧 Login por Email</h3>
            <p class="text-4xl font-bold text-blue-600 dark:text-blue-400">{{ loginStats.email }}</p>
            <div class="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all"
                :style="{ width: `${loginStats.emailPercent}%` }"
              />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ loginStats.emailPercent }}% do total</p>
          </div>

          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">🔵 Login via Google</h3>
            <p class="text-4xl font-bold text-orange-600 dark:text-orange-400">{{ loginStats.google }}</p>
            <div class="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-orange-500 rounded-full transition-all"
                :style="{ width: `${loginStats.googlePercent}%` }"
              />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ loginStats.googlePercent }}% do total</p>
          </div>
        </div>
      </div>

      <!-- ===== ANALYTICS TAB ===== -->
      <div v-else-if="activeTab === 'analytics'" class="space-y-6">
        <!-- Seletor de período -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Período:</span>
          <button
            v-for="d in [7, 30, 90]"
            :key="d"
            @click="setAnalyticsRange(d)"
            :class="[
              'px-3 py-1 text-sm rounded-full font-medium transition-colors',
              analyticsRange === d
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ d }}d
          </button>
          <span v-if="isLoadingAnalytics" class="text-xs text-gray-500 dark:text-gray-400 ml-2">Atualizando...</span>
        </div>

        <!-- Gráfico: Novos usuários por dia -->
        <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Novos usuários por dia</h3>
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
                  fill="#3b82f6"
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
                  fill="#3b82f6"
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
                  fill="#9ca3af"
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
                  fill="#3b82f6"
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
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Usuários ativos (última semana)</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Criaram roadmap ou registro de log</p>

            <div v-if="analytics">
              <p class="text-4xl font-bold text-green-600 dark:text-green-400">
                {{ analytics.activeUsers.count }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                de {{ analytics.churn.abandonedCount + analytics.activeUsers.count }} usuários com conta
              </p>

              <!-- Barra de progresso -->
              <div class="mt-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full transition-all"
                  :style="{ width: `${Math.min(analytics.activeUsers.percentOfTotal, 100)}%` }"
                />
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ analytics.activeUsers.percentOfTotal }}% do total de usuários
              </p>
            </div>
          </div>

          <!-- Taxa de abandono -->
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Taxa de abandono</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ analytics?.churn?.definition }}</p>

            <div v-if="analytics">
              <p class="text-4xl font-bold" :class="analytics.churn.abandonedPercent > 30 ? 'text-red-500' : 'text-orange-500'">
                {{ analytics.churn.abandonedPercent }}%
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ analytics.churn.abandonedCount }} usuários nunca criaram um roadmap
              </p>

              <!-- Barra de progresso -->
              <div class="mt-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="analytics.churn.abandonedPercent > 30 ? 'bg-red-500' : 'bg-orange-400'"
                  :style="{ width: `${Math.min(analytics.churn.abandonedPercent, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Features mais usadas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="analytics">
          <!-- Categorias de roadmap -->
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Categorias de roadmap</h3>
            <div v-if="analytics.featureUsage.roadmapCategories.length" class="space-y-3">
              <div
                v-for="item in analytics.featureUsage.roadmapCategories"
                :key="item.category"
                class="space-y-1"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{{ item.category }}</span>
                  <span class="text-gray-500 dark:text-gray-400 font-medium">{{ item.count }}</span>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full"
                    :style="{ width: `${(item.count / maxFeatureCount(analytics.featureUsage.roadmapCategories)) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>

          <!-- Tipos de resource -->
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Tipos de recurso usados</h3>
            <div v-if="analytics.featureUsage.resourceTypes.length" class="space-y-3">
              <div
                v-for="item in analytics.featureUsage.resourceTypes"
                :key="item.type"
                class="space-y-1"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ item.type }}</span>
                  <span class="text-gray-500 dark:text-gray-400 font-medium">{{ item.count }}</span>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-purple-500 rounded-full"
                    :style="{ width: `${(item.count / maxFeatureCount(analytics.featureUsage.resourceTypes)) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>

          <!-- Status dos tópicos -->
          <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg md:col-span-2">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Status dos tópicos</h3>
            <div v-if="analytics.featureUsage.topicStatuses.length" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                v-for="item in analytics.featureUsage.topicStatuses"
                :key="item.status"
                class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
              >
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ item.count }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ item.status }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">Sem dados</p>
          </div>
        </div>
      </div>

      <!-- ===== USERS TAB ===== -->
      <div v-else-if="activeTab === 'users' && users" class="space-y-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Login</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Último Acesso</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Consentimento</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Roadmaps</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Logs</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">🔔 Notificações</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Cadastro</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <span v-if="user.role === 'OWNER'" class="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                    👑 Owner
                  </span>
                  <span v-else-if="user.role === 'ADMIN'" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                    Admin
                  </span>
                  <span v-else class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded">
                    Usuário
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="user.loginMethod === 'GOOGLE'" class="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded">
                    🔵 Google
                  </span>
                  <span v-else class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded">
                    📧 Email
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                  {{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca' }}
                </td>
                <td class="px-4 py-3">
                  <span v-if="user.consentGiven" class="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                    ✓ Sim
                  </span>
                  <span v-else class="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded">
                    ✗ Não
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user._count.roadmaps }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user._count.logs }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                    {{ user._count.notifications }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ formatDate(user.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2 items-center">
                    <select
                      :value="user.role"
                      @change="(e) => changeRole(user, (e.target as HTMLSelectElement).value)"
                      :disabled="togglingUserId === user.id || deletingUserId === user.id || authStore.user?.id === user.id || !authStore.isOwner"
                      class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    <button
                      @click="viewUserNotifications(user)"
                      :disabled="deletingUserId === user.id || togglingUserId === user.id"
                      class="px-3 py-1 text-xs font-medium rounded transition-colors bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🔔 Ver
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      :disabled="deletingUserId === user.id || togglingUserId === user.id || authStore.user?.id === user.id || !authStore.isOwner"
                      :class="[
                        'px-3 py-1 text-xs font-medium rounded transition-colors',
                        deletingUserId === user.id || togglingUserId === user.id || !authStore.isOwner
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : authStore.user?.id === user.id
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60'
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

      <!-- ===== ACTIVITY TAB ===== -->
      <div v-else-if="activeTab === 'activity' && activity" class="space-y-4">
        <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Roadmaps Recentes</h3>
          <div class="space-y-2">
            <div
              v-for="roadmap in activity.recentRoadmaps"
              :key="roadmap.id"
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ roadmap.title }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Por: <strong>{{ roadmap.user.email }}</strong> em {{ formatDate(roadmap.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== NOTIFICATIONS TAB ===== -->
      <div v-else-if="activeTab === 'notifications' && users" class="space-y-6">
        <!-- Enviar Notificação para Usuário -->
        <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Enviar Notificação para Usuário</h3>
          <div class="space-y-4">
            <div v-if="notificationSendSuccess" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">✓ Notificação enviada com sucesso!</p>
            </div>
            <div v-if="notificationSendError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ notificationSendError }}</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione um usuário</label>
                <select v-model="selectedUserId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">-- Selecione um usuário --</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }} ({{ user.role }})</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Notificação</label>
                <select v-model="notificationType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="info">ℹ️ Informação</option>
                  <option value="success">✓ Sucesso</option>
                  <option value="warning">⚠️ Aviso</option>
                  <option value="error">❌ Erro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                <input v-model="notificationTitle" type="text" placeholder="Título da notificação" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensagem</label>
                <textarea v-model="notificationMessage" placeholder="Mensagem da notificação" rows="4" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <AppButton variant="primary" @click="sendNotification" :disabled="isSendingNotification" class="w-full">
                {{ isSendingNotification ? 'Enviando...' : '🔔 Enviar Notificação' }}
              </AppButton>
            </div>
          </div>
        </div>

        <!-- Mensagem para Primeiro Roadmap -->
        <div class="p-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">🎯 Incentivar Usuários com 1 Roadmap</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Envie mensagens personalizadas para usuários que criaram exatamente 1 roadmap e ainda não receberam a badge PRIMEIRA_AULA
          </p>

          <div class="space-y-4">
            <div v-if="firstRoadmapSuccess" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">{{ firstRoadmapSuccess }}</p>
            </div>
            <div v-if="firstRoadmapError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ firstRoadmapError }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensagem Personalizada</label>
              <textarea
                v-model="firstRoadmapMessage"
                placeholder="Digite a mensagem que será enviada aos usuários"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Título da notificação será: "🎯 Continue Aprendendo!"
              </p>
            </div>

            <AppButton
              variant="primary"
              @click="sendFirstRoadmapMessage"
              :disabled="isSendingFirstRoadmapMessage"
              class="w-full"
            >
              {{ isSendingFirstRoadmapMessage ? 'Enviando...' : '📤 Enviar para Usuários' }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Refresh -->
      <div class="flex justify-end">
        <AppButton variant="secondary" size="sm" @click="loadStats" :disabled="isLoading" class="flex items-center gap-2">
          🔄 Atualizar
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
      <p class="text-gray-700 dark:text-gray-300">
        Tem certeza que deseja deletar o usuário <strong>{{ userToDelete?.email }}</strong>?
      </p>
      <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-xs text-red-600 dark:text-red-400 font-semibold leading-relaxed">
          ⚠️ Esta ação não pode ser desfeita. Todos os roadmaps, logs e dados do usuário serão permanentemente removidos.
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
        <p class="text-gray-600 dark:text-gray-400">Carregando notificações...</p>
      </div>
      <div v-else-if="userNotifications.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">Nenhuma notificação encontrada</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="notif in userNotifications"
          :key="notif.id"
          class="p-3 border rounded-lg border-gray-200 dark:border-gray-700"
          :class="{
            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': notif.type === 'info',
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': notif.type === 'success',
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800': notif.type === 'warning',
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': notif.type === 'error',
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white">{{ notif.title }}</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ notif.message }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {{ new Date(notif.createdAt).toLocaleString('pt-BR') }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                class="px-2 py-1 text-xs font-semibold rounded whitespace-nowrap"
                :class="{
                  'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200': notif.type === 'info',
                  'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200': notif.type === 'success',
                  'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200': notif.type === 'warning',
                  'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200': notif.type === 'error',
                }"
              >
                {{ notif.type }}
              </span>
              <button
                @click="deleteUserNotification(notif.id)"
                :disabled="deletingNotificationId === notif.id"
                class="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded transition-colors bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
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
