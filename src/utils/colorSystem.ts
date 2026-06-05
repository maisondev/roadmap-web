// Design System Vercel Color Palette
export const colorPalette = {
  develop: {
    name: 'Develop',
    start: '#007cf0', // blue
    end: '#00dfd8',   // cyan
    gradient: 'from-blue-500 to-cyan-400',
    border: 'border-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400'
  },
  preview: {
    name: 'Preview',
    start: '#7928ca', // violet
    end: '#ff0080',   // magenta
    gradient: 'from-purple-600 to-pink-500',
    border: 'border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400'
  },
  ship: {
    name: 'Ship',
    start: '#ff4d4d', // coral
    end: '#f9cb28',   // amber
    gradient: 'from-red-500 to-amber-400',
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400'
  },
  success: {
    name: 'Sage',
    start: '#10b981', // green
    end: '#14b8a6',   // teal
    gradient: 'from-green-500 to-teal-400',
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400'
  },
  warning: {
    name: 'Amber',
    start: '#f9cb28', // amber
    end: '#f97316',   // orange
    gradient: 'from-amber-400 to-orange-500',
    border: 'border-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400'
  },
  highlight: {
    name: 'Highlight',
    start: '#ff0080', // pink
    end: '#f43f5e',   // rose
    gradient: 'from-pink-500 to-rose-400',
    border: 'border-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    text: 'text-pink-600 dark:text-pink-400'
  }
}

export type ColorKey = keyof typeof colorPalette

export function getColor(key: ColorKey) {
  return colorPalette[key]
}

export function getGradientStyle(key: ColorKey) {
  const color = colorPalette[key]
  return `linear-gradient(90deg, ${color.start}, ${color.end})`
}

export const colorSequence = [
  'develop',
  'preview',
  'ship',
  'success',
  'warning',
  'highlight'
] as const

export function getColorByIndex(index: number): ColorKey {
  return colorSequence[index % colorSequence.length] as ColorKey
}
