import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export interface Badge {
  key: string
  icon: string
  title: string
  description: string
  earned: boolean
  earnedAt: string | null
}

export const useBadgesStore = defineStore('badges', () => {
  const badges = ref<Badge[]>([])
  const loading = ref(false)

  const earnedCount = computed(() => {
    return badges.value.filter(b => b.earned).length
  })

  const earnedBadges = computed(() => {
    return badges.value.filter(b => b.earned).sort((a, b) => {
      if (!a.earnedAt || !b.earnedAt) return 0
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    })
  })

  const unearnedBadges = computed(() => {
    return badges.value.filter(b => !b.earned)
  })

  async function fetchBadges() {
    try {
      loading.value = true
      const response = await api.get('/api/badges/all')
      badges.value = Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Erro ao buscar badges:', error)
      badges.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    badges,
    loading,
    earnedCount,
    earnedBadges,
    unearnedBadges,
    fetchBadges
  }
})
