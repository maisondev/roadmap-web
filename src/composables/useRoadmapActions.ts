import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import { useSettingsStore } from '@/stores/settings'
import { roadmapInterpretacaoTextos } from '@/data/roadmaps/interpretacao-textos'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import type { Block, ResourceType, TopicStatus } from '@/types'

type CreateRoadmapInput = {
  title: string
  description: string
  category: string
  tags: string[]
  visibility: 'public' | 'private'
  blocks?: Block[]
}

function mapAiResourceType(type: string, url?: string): ResourceType {
  const normalized = type.toLowerCase()

  if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
    return 'youtube'
  }

  if (normalized === 'book' || normalized === 'documentation' || normalized === 'article' || normalized === 'course' || normalized === 'tool') {
    return 'link'
  }

  if (normalized === 'video') {
    return url && (url.includes('youtube.com') || url.includes('youtu.be')) ? 'youtube' : 'link'
  }

  return 'link'
}

export function useRoadmapActions() {
  const router = useRouter()
  const roadmapStore = useRoadmapStore()
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()

  // Filter state
  const filterName = ref('')
  const filterStatus = ref<'all' | 'ativo' | 'pausado' | 'concluido'>('all')

  const filteredRoadmapIds = computed(() => {
    let roadmaps = Object.keys(roadmapStore.roadmaps)

    if (filterName.value.trim()) {
      const searchTerm = filterName.value.toLowerCase().trim()
      roadmaps = roadmaps.filter(id => {
        const roadmap = roadmapStore.roadmaps[id]
        return (
          roadmap.title.toLowerCase().includes(searchTerm) ||
          roadmap.description.toLowerCase().includes(searchTerm)
        )
      })
    }

    if (filterStatus.value !== 'all') {
      roadmaps = roadmaps.filter(id => {
        const roadmap = roadmapStore.roadmaps[id]
        return (roadmap.status || 'ativo') === filterStatus.value
      })
    }

    return roadmaps.sort((a, b) => {
      const roadmapA = roadmapStore.roadmaps[a]
      const roadmapB = roadmapStore.roadmaps[b]
      return (roadmapA.order || 0) - (roadmapB.order || 0)
    })
  })

  function getRoadmapStats(roadmapId: string) {
    const roadmap = roadmapStore.roadmaps[roadmapId]
    if (!roadmap) return { blocks: 0, topics: 0, resources: 0, percent: 0 }

    let totalTopics = 0
    let completedTopics = 0
    let totalResources = 0

    roadmap.blocks.forEach(block => {
      totalTopics += block.topics.length
      completedTopics += block.topics.filter(t => t.status === 'concluido').length
      block.topics.forEach(topic => {
        totalResources += topic.resources.length
      })
    })

    return {
      blocks: roadmap.blocks.length,
      topics: totalTopics,
      resources: totalResources,
      percent: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    }
  }

  async function createRoadmap({
    title,
    description,
    category,
    tags,
    visibility,
    blocks = []
  }: CreateRoadmapInput) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      alert('Digite um título para o roadmap')
      return null
    }

    if (!authStore.isLoggedIn) {
      const id = roadmapStore.addRoadmap(
        trimmedTitle,
        description.trim(),
        category.trim() || '',
        tags,
        visibility,
        blocks
      )

      if (!id) {
        alert('Sem login, você pode criar até 7 roadmaps. Faça login para liberar mais.')
        return null
      }

      navigateToRoadmap(id)
      return id
    }

    const createdRoadmap = await api.post('/api/roadmaps', {
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || '',
      tags,
      visibility
    })

    const roadmapId = createdRoadmap.id

    for (const [blockIndex, block] of blocks.entries()) {
      const createdBlock = await api.post(`/api/roadmaps/${roadmapId}/blocks`, {
        title: block.title
      })

      if (blockIndex !== 0) {
        await api.put(`/api/roadmaps/blocks/${createdBlock.id}`, {
          order: blockIndex
        })
      }

      for (const [topicIndex, topic] of block.topics.entries()) {
        const createdTopic = await api.post(`/api/topics/${createdBlock.id}`, {
          title: topic.title
        })

        await api.put(`/api/topics/${createdTopic.id}`, {
          notes: topic.notes || topic.description || '',
          order: topicIndex,
          status: topic.status === 'nao_iniciado' ? 'not_started' : topic.status
        })

        for (const [resourceIndex, resource] of topic.resources.entries()) {
          const createdResource = await api.post(`/api/resources/${createdTopic.id}`, {
            type: mapAiResourceType(resource.type, resource.url),
            title: resource.title || resource.label,
            url: resource.url
          })

          if (resourceIndex !== 0) {
            await api.put(`/api/resources/${createdResource.id}`, {
              order: resourceIndex
            })
          }
        }
      }
    }

    const fullRoadmap = await api.get('/api/roadmaps')
    const created = fullRoadmap.find((item: any) => item.id === roadmapId) || {
      ...createdRoadmap,
      blocks: []
    }
    const id = roadmapStore.upsertRoadmapFromApi(created)
    navigateToRoadmap(id)
    return id
  }

  function deleteRoadmap(roadmapId: string, password: string) {
    if (password !== settingsStore.settings.deletePassword) {
      alert('Senha incorreta!')
      return
    }

    roadmapStore.removeRoadmap(roadmapId)
  }

  function editRoadmap(
    roadmapId: string,
    updates: { title: string; description: string; rating: number; status: string }
  ) {
    roadmapStore.updateRoadmap(roadmapId, updates.title, updates.description, updates.rating, updates.status as any)
  }

  function moveRoadmapUp(roadmapId: string) {
    roadmapStore.moveRoadmapUp(roadmapId)
  }

  function moveRoadmapDown(roadmapId: string) {
    roadmapStore.moveRoadmapDown(roadmapId)
  }

  function updateRoadmapColor(roadmapId: string, color: string) {
    roadmapStore.updateRoadmapColor(roadmapId, color as any)
  }

  function markRoadmapComplete(roadmapId: string) {
    const roadmap = roadmapStore.roadmaps[roadmapId]
    if (roadmap) {
      roadmap.blocks.forEach(block => {
        block.topics.forEach(topic => {
          topic.status = 'concluido'
        })
      })
      roadmap.updatedAt = new Date().toISOString()
      roadmapStore.updateRoadmap(roadmapId, roadmap.title, roadmap.description, roadmap.rating, 'concluido')
    }
  }

  function markRoadmapIncomplete(roadmapId: string) {
    const roadmap = roadmapStore.roadmaps[roadmapId]
    if (roadmap) {
      roadmap.blocks.forEach(block => {
        block.topics.forEach(topic => {
          topic.status = 'nao_iniciado'
        })
      })
      roadmap.updatedAt = new Date().toISOString()
      roadmapStore.updateRoadmap(roadmapId, roadmap.title, roadmap.description, roadmap.rating, 'ativo')
    }
  }

  function useExampleRoadmap() {
    const id = roadmapStore.addRoadmap(
      roadmapInterpretacaoTextos.title,
      roadmapInterpretacaoTextos.description,
      'exemplo',
      ['concursos', 'português'],
      'private'
    )

    if (!id) {
      alert('Sem login, você pode criar até 7 roadmaps. Faça login para liberar mais.')
      return
    }

    const newRoadmap = roadmapStore.roadmaps[id]
    if (newRoadmap && roadmapInterpretacaoTextos.blocks) {
      newRoadmap.blocks = JSON.parse(JSON.stringify(roadmapInterpretacaoTextos.blocks))
      roadmapStore.roadmaps[id] = newRoadmap
    }

    navigateToRoadmap(id)
  }

  function exportRoadmap(roadmapId: string) {
    const exportData = roadmapStore.exportRoadmap(roadmapId)
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const roadmap = roadmapStore.roadmaps[roadmapId]
      a.download = `${roadmap.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  function importRoadmap(importData: string) {
    if (!importData.trim()) {
      alert('Cole os dados do roadmap para importar')
      return null
    }

    const id = roadmapStore.importRoadmap(importData)
    if (!id) {
      alert('Erro ao importar roadmap. Verifique os dados e tente novamente.')
      return null
    }

    navigateToRoadmap(id)
    return id
  }

  function performGlobalSearch(query: string) {
    if (!query.trim()) {
      return []
    }

    const q = query.toLowerCase().trim()
    const results: any[] = []

    Object.values(roadmapStore.roadmaps).forEach(roadmap => {
      if (roadmap.title.toLowerCase().includes(q) || roadmap.description.toLowerCase().includes(q)) {
        results.push({
          type: 'roadmap',
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          roadmapTitle: roadmap.title,
          category: roadmap.category,
          tags: roadmap.tags
        })
      }

      roadmap.blocks.forEach(block => {
        if (block.title.toLowerCase().includes(q)) {
          results.push({
            type: 'block',
            id: block.id,
            title: block.title,
            description: '',
            roadmapTitle: roadmap.title,
            roadmapId: roadmap.id,
            category: roadmap.category,
            tags: roadmap.tags
          })
        }

        block.topics.forEach(topic => {
          if (topic.title.toLowerCase().includes(q) || (topic.description && topic.description.toLowerCase().includes(q))) {
            results.push({
              type: 'topic',
              id: topic.id,
              title: topic.title,
              description: topic.description || '',
              roadmapTitle: roadmap.title,
              roadmapId: roadmap.id,
              blockId: block.id,
              blockTitle: block.title,
              category: roadmap.category,
              tags: roadmap.tags
            })
          }

          topic.resources.forEach(resource => {
            if (resource.title.toLowerCase().includes(q) || resource.url.toLowerCase().includes(q)) {
              results.push({
                type: 'resource',
                id: resource.id,
                title: resource.title,
                description: resource.url,
                roadmapTitle: roadmap.title,
                roadmapId: roadmap.id,
                blockId: block.id,
                blockTitle: block.title,
                topicId: topic.id,
                topicTitle: topic.title,
                category: roadmap.category,
                tags: roadmap.tags
              })
            }
          })
        })
      })
    })

    return results
  }

  function navigateToRoadmap(roadmapId: string) {
    roadmapStore.setActiveRoadmap(roadmapId)
    router.push({
      name: 'roadmap',
      params: { roadmapId }
    })
  }

  function navigateToSearchResult(result: any) {
    switch (result.type) {
      case 'roadmap':
        navigateToRoadmap(result.id)
        break
      case 'block':
      case 'topic':
      case 'resource':
        navigateToRoadmap(result.roadmapId)
        break
    }
  }

  return {
    // State
    filterName,
    filterStatus,
    filteredRoadmapIds,

    // Actions
    getRoadmapStats,
    createRoadmap,
    deleteRoadmap,
    editRoadmap,
    moveRoadmapUp,
    moveRoadmapDown,
    updateRoadmapColor,
    markRoadmapComplete,
    markRoadmapIncomplete,
    useExampleRoadmap,
    exportRoadmap,
    importRoadmap,
    performGlobalSearch,
    navigateToRoadmap,
    navigateToSearchResult
  }
}
