<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
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
  sm: 'px-3 py-1.5 text-sm rounded-sm',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-3.5 text-base rounded-pill'
}
</script>

<template>
  <button
    :class="[
      'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size]
    ]"
    :disabled="disabled || loading"
    @click="(e) => $emit('click', e)"
  >
    <span v-if="loading" class="inline-block mr-2">⏳</span>
    <slot />
  </button>
</template>
