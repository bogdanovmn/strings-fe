<template>
  <div class="full-fretboard-scroll">
    <svg
      class="full-fretboard"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      :aria-label="ariaLabel"
    >
      <rect x="0" y="0" :width="width" :height="height" rx="8" fill="var(--color-surface)" />

      <line
        v-for="fret in fretLines"
        :key="`fret-${fret}`"
        :x1="fretX(fret)"
        :y1="top"
        :x2="fretX(fret)"
        :y2="bottomY"
        :stroke="fret === 0 ? 'var(--color-text)' : 'var(--color-border)'"
        :stroke-width="fret === 0 ? 3 : 1"
      />

      <line
        v-for="(_, stringIndex) in openNotes"
        :key="`string-${stringIndex}`"
        :x1="left"
        :y1="stringY(stringIndex)"
        :x2="right"
        :y2="stringY(stringIndex)"
        stroke="var(--color-muted)"
        stroke-width="1"
      />

      <circle
        v-for="(marker, index) in markers"
        :key="`marker-${index}`"
        :cx="marker.x"
        :cy="marker.y"
        r="4"
        fill="var(--color-border)"
      />

      <text
        v-for="fret in fretNumbers"
        :key="`number-${fret}`"
        :x="fretCenter(fret)"
        :y="height - 7"
        text-anchor="middle"
        font-size="10"
        fill="var(--color-muted)"
      >{{ fret }}</text>

      <g v-for="(position, index) in visiblePositions" :key="`position-${index}`">
        <title>{{ noteLabel(position.note) }} · струна {{ position.string + 1 }} · лад {{ position.fret }}</title>
        <circle
          :cx="positionX(position.fret)"
          :cy="stringY(position.string)"
          r="10"
          :fill="position.fret === 0 ? '#ffffff' : (position.degree === 0 ? 'var(--color-tonic)' : 'var(--color-primary)')"
          :stroke="position.fret === 0
            ? (position.degree === 0 ? 'var(--color-tonic)' : 'var(--color-primary)')
            : (position.degree === 0 ? 'var(--color-primary)' : 'none')"
          stroke-width="1"
        />
        <text
          :x="positionX(position.fret)"
          :y="stringY(position.string) + 3"
          text-anchor="middle"
          font-size="8"
          font-weight="600"
          :fill="position.fret === 0 ? 'var(--color-text)' : 'var(--color-on-primary)'"
        >{{ noteLabel(position.note) }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FretboardPosition } from '@/api'
import { noteLabel } from '@/api'

const props = withDefaults(defineProps<{
  openNotes: number[]
  frets: number
  positions: FretboardPosition[]
  maxFret?: number
}>(), {
  maxFret: 12
})

const left = 44
const openX = left - 20
const top = 20
const bottom = 30
const fretWidth = 44
const stringGap = 26
const rightPad = 16

const maxFret = computed(() =>
  Math.max(1, Math.min(props.maxFret, props.frets > 0 ? props.frets : props.maxFret))
)
const stringCount = computed(() => Math.max(props.openNotes.length, 1))
const width = computed(() => left + maxFret.value * fretWidth + rightPad)
const height = computed(() => top + (stringCount.value - 1) * stringGap + bottom)
const bottomY = computed(() => top + (stringCount.value - 1) * stringGap)
const right = computed(() => left + maxFret.value * fretWidth)

const fretLines = computed(() => Array.from({ length: maxFret.value + 1 }, (_, fret) => fret))
const fretNumbers = computed(() => Array.from({ length: maxFret.value }, (_, index) => index + 1))
const visiblePositions = computed(() =>
  props.positions.filter(position => position.fret <= maxFret.value)
)

const markers = computed(() => {
  const middle = top + (bottomY.value - top) / 2
  const result: { x: number; y: number }[] = []
  for (const fret of [3, 5, 7, 9, 12]) {
    if (fret > maxFret.value) break
    const x = fretCenter(fret)
    if (fret === 12 && stringCount.value >= 3) {
      result.push({ x, y: middle - stringGap / 2 }, { x, y: middle + stringGap / 2 })
    } else {
      result.push({ x, y: middle })
    }
  }
  return result
})

const ariaLabel = computed(() =>
  `Гриф: ${props.openNotes.length} струн, лады 0–${maxFret.value}, нот: ${visiblePositions.value.length}`
)

function stringY(stringIndex: number): number {
  return top + (stringCount.value - 1 - stringIndex) * stringGap
}

function fretX(fret: number): number {
  return left + fret * fretWidth
}

function fretCenter(fret: number): number {
  return left + (fret - 0.5) * fretWidth
}

function positionX(fret: number): number {
  return fret === 0 ? openX : fretCenter(fret)
}
</script>

<style scoped>
.full-fretboard-scroll {
  overflow-x: auto;
}

.full-fretboard {
  display: block;
  flex: none;
}
</style>
