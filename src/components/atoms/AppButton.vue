<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: string
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = {
  primary: 'bg-ink text-on-primary hover:opacity-90',
  secondary: 'bg-canvas text-ink border border-hairline hover:bg-canvas-soft-2',
  ghost: 'bg-transparent text-ink-body hover:bg-canvas-soft-2',
  danger: 'bg-ds-error text-white hover:opacity-90'
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs rounded-sm',
  sm: 'px-3 py-1.5 text-sm rounded-sm',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
  xl: 'px-8 py-4 text-lg rounded-lg'
}
</script>

<template>
  <button
    :class="[
      'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      block ? 'w-full flex items-center justify-center gap-2' : 'inline-flex items-center gap-2',
      variantClasses[variant],
      sizeClasses[size]
    ]"
    :disabled="disabled || loading"
    @click="(e) => $emit('click', e)"
  >
    <ArrowPathIcon v-if="loading" class="w-4 h-4 animate-spin" />
    <slot />
  </button>
</template>
