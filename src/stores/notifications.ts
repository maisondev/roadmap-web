import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: Date
  read: boolean
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const sortedNotifications = computed(() => {
    return notifications.value.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })

  function addNotification(title: string, message: string, type: NotificationType = 'info', duration?: number) {
    const id = Date.now().toString()
    const notification: Notification = {
      id,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    }

    notifications.value.unshift(notification)

    // Auto remove after duration if specified
    if (duration) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function markAsRead(id: string) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.read = true
    }
  }

  function toggleRead(id: string) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.read = !notif.read
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  function loadFromServer(serverNotifications: any[]) {
    clearAll()
    if (Array.isArray(serverNotifications)) {
      for (const notif of serverNotifications) {
        const notification: Notification = {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          timestamp: new Date(notif.createdAt),
          read: notif.read
        }
        notifications.value.unshift(notification)
      }
    }
  }

  async function markAsReadSync(id: string) {
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()
    if (!authStore.token) return

    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      markAsRead(id)
    } catch (error) {
      console.error('Erro ao sincronizar notificação:', error)
    }
  }

  async function toggleReadSync(id: string) {
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()
    if (!authStore.token) return

    const notif = notifications.value.find(n => n.id === id)
    if (!notif) return

    try {
      const endpoint = notif.read ? `/unread` : `/read`
      await fetch(`${API_URL}/api/notifications/${id}${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      toggleRead(id)
    } catch (error) {
      console.error('Erro ao sincronizar notificação:', error)
    }
  }

  async function removeNotificationSync(id: string) {
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()
    if (!authStore.token) return

    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      removeNotification(id)
    } catch (error) {
      console.error('Erro ao sincronizar notificação:', error)
    }
  }

  async function markAllAsReadSync() {
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()
    if (!authStore.token) return

    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      markAllAsRead()
    } catch (error) {
      console.error('Erro ao sincronizar notificações:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    sortedNotifications,
    addNotification,
    markAsRead,
    markAsReadSync,
    toggleRead,
    toggleReadSync,
    markAllAsRead,
    markAllAsReadSync,
    removeNotification,
    removeNotificationSync,
    clearAll,
    loadFromServer
  }
})
