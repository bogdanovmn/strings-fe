<template>
  <svg
    class="fretboard-svg"
    :viewBox="`0 0 ${width} ${height}`"
    role="img"
    :aria-label="ariaLabel"
  >
    <rect x="0" y="0" :width="width" :height="height" rx="8" fill="var(--color-surface)" />

    <line
      v-for="fretLine in fretLines"
      :key="`fret-${fretLine}`"
      :x1="fretX(fretLine)"
      :y1="top"
      :x2="fretX(fretLine)"
      :y2="bottomY"
      :stroke="fretLine === 0 ? 'var(--color-primary)' : 'var(--color-border)'"
      :stroke-width="fretLine === 0 ? 3 : 1"
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

    <text
      v-for="fretNumber in fretNumbers"
      :key="`number-${fretNumber}`"
      :x="fretX(fretNumber) - fretWidth / 2"
      :y="height - 7"
      text-anchor="middle"
      font-size="10"
      fill="var(--color-muted)"
    >{{ fretNumber }}</text>

    <g v-for="(position, index) in positions" :key="`position-${index}`">
      <title>{{ noteLabel(position.note) }} · струна {{ position.string + 1 }} · лад {{ position.fret }}</title>
      <circle
        :cx="positionX(position.fret)"
        :cy="stringY(position.string)"
        :r="position.fret === 0 ? 9 : 11"
        :fill="position.degree === 0 ? 'var(--color-tonic)' : 'var(--color-primary)'"
        :stroke="position.degree === 0 ? 'var(--color-primary)' : 'none'"
        stroke-width="1"
      />
      <text
        :x="positionX(position.fret)"
        :y="stringY(position.string) + 3.5"
        text-anchor="middle"
        font-size="9"
        font-weight="600"
        fill="var(--color-on-primary)"
      >{{ noteLabel(position.note) }}</text>
    </g>

    <g v-if="showMutes" fill="var(--color-muted)">
      <text
        v-for="stringIndex in mutedStrings"
        :key="`mute-${stringIndex}`"
        :x="openX"
        :y="stringY(stringIndex) + 5"
        text-anchor="middle"
        font-size="15"
        font-weight="700"
      >×</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FretboardPosition } from '@/api'
import { noteLabel } from '@/api'

const props = withDefaults(defineProps<{
  openNotes: number[]
  frets: number
  positions: FretboardPosition[]
  baseFret?: number
  span?: number
  showMutes?: boolean
}>(), {
  baseFret: 1,
  span: 5,
  showMutes: false
})

const left = 46
const rightPad = 18
const top = 22
const bottom = 30
const fretWidth = 46
const stringGap = 26

const windowStart = computed(() => {
  const base = Math.max(1, props.baseFret)
  const highestFret = props.positions.reduce((max, position) => Math.max(max, position.fret), 0)
  if (base <= 1 && highestFret <= 12) {
    return 0
  }
  return Math.max(0, Math.min(base - 1, props.frets))
})

const windowEnd = computed(() => {
  if (windowStart.value === 0) {
    const highestFret = props.positions.reduce((max, position) => Math.max(max, position.fret), 0)
    return Math.min(props.frets, Math.max(12, highestFret))
  }
  return Math.min(props.frets, windowStart.value + Math.max(2, props.span))
})

const columns = computed(() => windowEnd.value - windowStart.value + 1)
const width = computed(() => left + columns.value * fretWidth + rightPad)
const height = computed(() => top + Math.max(0, props.openNotes.length - 1) * stringGap + bottom)
const bottomY = computed(() => top + Math.max(0, props.openNotes.length - 1) * stringGap)
const right = computed(() => left + columns.value * fretWidth)
const openX = computed(() => left - 26)

const fretLines = computed(() => {
  const result: number[] = []
  for (let fret = windowStart.value; fret <= windowEnd.value + 1; fret++) {
    result.push(fret)
  }
  return result
})

const fretNumbers = computed(() => {
  const result: number[] = []
  for (let fret = Math.max(1, windowStart.value); fret <= windowEnd.value; fret++) {
    result.push(fret)
  }
  return result
})

const mutedStrings = computed(() => {
  const sounded = new Set(props.positions.map(position => position.string))
  return props.openNotes.map((_, index) => index).filter(index => !sounded.has(index))
})

const ariaLabel = computed(() =>
  `Гриф: ${props.openNotes.length} струн, лады ${windowStart.value}–${windowEnd.value}`
)

function stringY(stringIndex: number): number {
  return top + (props.openNotes.length - 1 - stringIndex) * stringGap
}

function fretX(fret: number): number {
  return left + (fret - windowStart.value) * fretWidth
}

function positionX(fret: number): number {
  if (fret === 0) {
    return openX.value
  }
  return fretX(fret) + fretWidth / 2
}
</script>

<style scoped>
.fretboard-svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 340px;
}
</style>
