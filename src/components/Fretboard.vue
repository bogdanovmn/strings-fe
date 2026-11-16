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
      :stroke="fretLine === windowStart && windowStart === 1 ? 'var(--color-primary)' : 'var(--color-border)'"
      :stroke-width="fretLine === windowStart && windowStart === 1 ? 3 : 1"
    />

    <line
      v-for="(_, stringIndex) in openNotes"
      :key="`string-${stringIndex}`"
      :x1="stringLineStart"
      :y1="stringY(stringIndex)"
      :x2="right"
      :y2="stringY(stringIndex)"
      stroke="var(--color-muted)"
      stroke-width="1"
    />

    <text
      v-for="fretNumber in fretNumbers"
      :key="`number-${fretNumber}`"
      :x="fretX(fretNumber) + fretWidth / 2"
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

    <g v-if="showMutes && mutedStrings.length > 0" fill="var(--color-muted)">
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
  showMutes?: boolean
}>(), {
  showMutes: false
})

const top = 22
const bottom = 30
const fretWidth = 46
const stringGap = 26
const rightPad = 18

const mutedStrings = computed(() => {
  const sounded = new Set(props.positions.map(position => position.string))
  return props.openNotes.map((_, index) => index).filter(index => !sounded.has(index))
})

const hasOpenColumn = computed(() =>
  props.positions.some(position => position.fret === 0)
    || (props.showMutes && mutedStrings.value.length > 0)
)

const frettedFrets = computed(() =>
  props.positions.filter(position => position.fret > 0).map(position => position.fret)
)

// Only the frets that actually carry notes are shown; open strings and mutes live in the left column.
const windowStart = computed(() =>
  frettedFrets.value.length > 0 ? Math.min(...frettedFrets.value) : 1
)
const windowEnd = computed(() =>
  frettedFrets.value.length > 0
    ? Math.max(...frettedFrets.value)
    : Math.min(props.frets || 1, 4)
)

const left = computed(() => (hasOpenColumn.value ? 46 : 26))
const openX = computed(() => left.value - 20)
const stringLineStart = computed(() => (hasOpenColumn.value ? openX.value : left.value))

const columns = computed(() => windowEnd.value - windowStart.value + 1)
const width = computed(() => left.value + columns.value * fretWidth + rightPad)
const height = computed(() => top + Math.max(0, props.openNotes.length - 1) * stringGap + bottom)
const bottomY = computed(() => top + Math.max(0, props.openNotes.length - 1) * stringGap)
const right = computed(() => left.value + columns.value * fretWidth)

const fretLines = computed(() => {
  const result: number[] = []
  for (let fret = windowStart.value; fret <= windowEnd.value + 1; fret++) {
    result.push(fret)
  }
  return result
})

// A shape needs only one fret label: the first (leftmost) fret of the shown window.
const fretNumbers = computed(() => [windowStart.value])

const ariaLabel = computed(() =>
  `Гриф: ${props.openNotes.length} струн, лады ${windowStart.value}–${windowEnd.value}`
)

function stringY(stringIndex: number): number {
  return top + (props.openNotes.length - 1 - stringIndex) * stringGap
}

function fretX(fret: number): number {
  return left.value + (fret - windowStart.value) * fretWidth
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
