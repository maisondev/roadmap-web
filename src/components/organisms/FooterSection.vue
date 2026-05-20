<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Roadmaps', href: '#' },
      { label: 'Dashboard', href: '#' },
      { label: 'Registros', href: '#' }
    ]
  },
  {
    title: 'Empresa',
    links: [
      { label: 'GitHub', href: 'https://github.com/maisondev' },
      { label: 'Site', href: 'https://sinapses.site' },
      { label: 'Contato', href: '#' }
    ]
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Documentação', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Ajuda', href: '#' }
    ]
  }
]

function handleNavigation(href: string) {
  if (href.startsWith('http')) {
    window.open(href, '_blank')
  } else if (href === '#') {
    return
  } else {
    router.push(href)
  }
}
</script>

<template>
  <footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
    <div class="max-w-6xl mx-auto px-4 py-16 sm:py-20">
      <!-- Footer Content -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <div
          v-for="column in footerColumns"
          :key="column.title"
        >
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">{{ column.title }}</h3>
          <ul class="space-y-2.5">
            <li
              v-for="link in column.links"
              :key="link.label"
            >
              <button
                @click="handleNavigation(link.href)"
                class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

      <!-- Bottom Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          © 2026 Sinapses. Todos os direitos reservados.
        </p>
        <div class="flex gap-6">
          <router-link to="/privacidade" class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacidade
          </router-link>
          <router-link to="/termos" class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Termos
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
