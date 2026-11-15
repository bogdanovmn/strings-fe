<template>
  <div class="shape-card">
    <div class="shape-head">
      <span v-if="title" class="shape-title">{{ title }}</span>
      <span class="badge">позиция {{ positionLabel }}</span>
      <span v-if="mutedCount > 0" class="badge muted">заглушено струн: {{ mutedCount }}</span>
      <span v-if="openCount > 0" class="badge">{{ openCount }} откр.</span>
    </div>

    <Fretboard
      :open-notes="openNotes"
      :frets="frets"
      :positions="fingering.positions"
      :base-fret="fingering.baseFret"
      :span="span"
      :show-mutes="showMutes"
    />

    <Tablature :positions="fingering.positions" :open-notes="openNotes" :string-count="openNotes.length" />

    <div class="notes">
      <span v-for="(position, index) in fingering.positions" :key="index" class="note-chip">
        {{ position.note }}
        <small>стр. {{ position.string + 1 }} / лад {{ position.fret }}</small>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Fingering } from '@/api'
import Fretboard from '@/components/Fretboard.vue'
import Tablature from '@/components/Tablature.vue'

const props = withDefaults(defineProps<{
  fingering: Fingering
  openNotes: number[]
  frets: number
  title?: string
  span?: number
  showMutes?: boolean
}>(), {
  title: '',
  span: 5,
  showMutes: false
})

const mutedCount = computed(() =>
  props.showMutes ? Math.max(0, props.openNotes.length - props.fingering.positions.length) : 0
)
const openCount = computed(() => props.fingering.positions.filter(position => position.fret === 0).length)
const positionLabel = computed(() =>
  props.fingering.baseFret <= 1 && openCount.value > 0 ? 'открытая' : String(props.fingering.baseFret)
)
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

.shape-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.shape-title {
  font-weight: 600;
  margin-right: auto;
  overflow-wrap: anywhere;
}

.badge {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--color-primary-soft);
  color: var(--color-text);
  white-space: nowrap;
}

.badge.muted {
  background: var(--color-danger-soft);
}

.notes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.note-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--color-row-border);
  border-radius: 4px;
  font-size: 0.78rem;
}

.note-chip small {
  color: var(--color-muted);
  font-size: 0.7rem;
}
</style>
