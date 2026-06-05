<script setup lang="ts">
import { computed } from 'vue'
import { PlayIcon, DocumentIcon, LinkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

interface Props {
  href: string
  external?: boolean
}

withDefaults(defineProps<Props>(), {
  external: false
})

defineEmits<{
  click: [e: MouseEvent]
}>()

function isYoutube(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function isDrive(url: string): boolean {
  return url.includes('drive.google.com')
}

function getIconComponent(url: string) {
  if (isYoutube(url)) return PlayIcon
  if (isDrive(url)) return DocumentIcon
  return LinkIcon
}
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    class="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
    @click="$emit('click', $event)"
  >
    <component :is="getIconComponent(href)" class="w-4 h-4" />
    <slot />
    <ArrowTopRightOnSquareIcon v-if="external" class="w-3 h-3" />
  </a>
</template>
