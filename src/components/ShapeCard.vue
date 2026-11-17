<template>
  <div class="shape-card">
    <Fretboard
      v-if="view === 'fretboard'"
      :open-notes="openNotes"
      :frets="frets"
      :positions="fingering.positions"
      :show-mutes="showMutes"
    />

    <Tablature
      v-else
      :positions="fingering.positions"
      :open-notes="openNotes"
      :string-count="openNotes.length"
    />
  </div>
</template>

<script setup lang="ts">
import type { Fingering } from '@/api'
import Fretboard from '@/components/Fretboard.vue'
import Tablature from '@/components/Tablature.vue'

withDefaults(defineProps<{
  fingering: Fingering
  openNotes: number[]
  frets: number
  view?: 'fretboard' | 'tablature'
  showMutes?: boolean
}>(), {
  view: 'fretboard',
  showMutes: false
})
</script>

<style scoped>
.shape-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  min-width: 0;
}
</style>
