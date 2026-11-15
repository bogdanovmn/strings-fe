<template>
  <pre class="tablature">{{ text }}</pre>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FretboardPosition } from '@/api'
import { noteName } from '@/api'

const props = withDefaults(defineProps<{
  positions: FretboardPosition[]
  openNotes?: number[]
  stringCount?: number
}>(), {
  openNotes: () => [],
  stringCount: 0
})

const count = computed(() => {
  const fromPositions = props.positions.reduce((max, position) => Math.max(max, position.string + 1), 0)
  return Math.max(props.stringCount, fromPositions, props.openNotes.length, 1)
})

const text = computed(() => {
  const rows: string[] = []
  for (let stringIndex = count.value - 1; stringIndex >= 0; stringIndex--) {
    const label = props.openNotes[stringIndex] !== undefined
      ? noteName(props.openNotes[stringIndex]).padEnd(3, ' ')
      : String(stringIndex + 1).padEnd(3, ' ')
    const cells: string[] = []
    for (const position of props.positions) {
      if (position.string === stringIndex) {
        cells.push(String(position.fret).padEnd(3, '-'))
      } else {
        cells.push('---')
      }
    }
    rows.push(`${label}|${cells.join('')}|`)
  }
  return rows.join('\n')
})
</script>

<style scoped>
.tablature {
  margin: 0;
  overflow-x: auto;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Cascadia Mono', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.45;
}
</style>
