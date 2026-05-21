<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/atoms/AppModal.vue'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  submit: [data: string]
}>()

const importData = ref('')

function handleSubmit() {
  if (!importData.value.trim()) {
    alert('Cole os dados do roadmap para importar')
    return
  }

  emit('submit', importData.value)
  importData.value = ''
}

function handleCancel() {
  importData.value = ''
  emit('cancel')
}

function handleFileImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    importData.value = content
  }
  reader.onerror = () => {
    alert('Erro ao ler o arquivo. Tente novamente.')
  }
  reader.readAsText(file)
}
</script>

<template>
  <AppModal
    :open="open"
    title="Importar Roadmap"
    submit-label="Importar"
    cancel-label="Cancelar"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Arquivo JSON
        </label>
        <input
          type="file"
          accept=".json"
          @change="handleFileImport"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
        />
      </div>
      <div class="text-center text-sm text-gray-600 dark:text-gray-400">ou</div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cole os dados do Roadmap (JSON)
        </label>
        <textarea
          v-model="importData"
          rows="8"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-base"
          placeholder="Cole os dados JSON do roadmap aqui..."
        />
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-400">
        <p>Dicas:</p>
        <ul class="list-disc list-inside mt-1 space-y-1">
          <li>Selecione um arquivo .json ou cole os dados diretamente</li>
          <li>Peça o arquivo para quem compartilhou o roadmap</li>
        </ul>
      </div>
    </div>
  </AppModal>
</template>
