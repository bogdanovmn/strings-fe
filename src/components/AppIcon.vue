<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'shapes'">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="13" x2="17" y2="13" />
      <line x1="7" y1="18" x2="17" y2="18" />
      <circle cx="10.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'chord'">
      <circle cx="6" cy="17" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="11" r="2.2" fill="currentColor" stroke="none" />
      <path d="M8.2 17V6.5L18 4v7" />
    </template>

    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </template>

    <template v-else-if="name === 'catalog'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </template>

    <template v-else-if="name === 'instrument'">
      <path d="M14 3h4a1 1 0 0 1 1 1v4l-8 8" />
      <circle cx="8" cy="16" r="4" />
      <path d="M11 13l2 2" />
      <path d="M16 5h2" />
    </template>

    <template v-else-if="name === 'mode'">
      <path d="M4 19h4v-4h4v-4h4V7h4" />
      <path d="M4 19h16" />
    </template>

    <template v-else-if="name === 'arpeggio'">
      <circle cx="6" cy="18" r="2" />
      <circle cx="12" cy="15" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M8 18V8l10-3v7" />
    </template>

    <template v-else-if="name === 'list'">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'tablature'">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="3" y1="19" x2="21" y2="19" />
      <path d="M8 5v4" />
      <path d="M14 9v4" />
      <path d="M11 13v4" />
    </template>

    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'edit'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </template>

    <template v-else-if="name === 'trash'">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </template>

    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>

    <template v-else-if="name === 'menu'">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </template>

    <template v-else-if="name === 'close'">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </template>

    <template v-else-if="name === 'login'">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </template>

    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { IconName } from '@/components/icons'

withDefaults(defineProps<{
  name: IconName
  size?: number
}>(), {
  size: 20
})
</script>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
