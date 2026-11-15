<template>
  <div class="tonic-picker">
    <select :value="pitchClass" aria-label="Нота" @change="onNoteChange">
      <option v-for="(name, index) in NOTE_NAMES" :key="name" :value="index">{{ name }}</option>
    </select>
    <select :value="octave" aria-label="Октава" @change="onOctaveChange">
      <option v-for="value in octaves" :key="value" :value="value">{{ value }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { floorMod, MAX_MIDI, MIN_MIDI, NOTE_NAMES } from '@/api'

const props = withDefaults(defineProps<{
  modelValue: number
  minOctave?: number
  maxOctave?: number
}>(), {
  minOctave: 1,
  maxOctave: 7
})

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const octaves = computed(() => {
  const result: number[] = []
  for (let octave = props.minOctave; octave <= props.maxOctave; octave++) {
    result.push(octave)
  }
  return result
})

const pitchClass = computed(() => floorMod(props.modelValue, 12))
const octave = computed(() => Math.floor(props.modelValue / 12) - 1)

function update(nextPitchClass: number, nextOctave: number) {
  const midi = (nextOctave + 1) * 12 + nextPitchClass
  if (midi >= MIN_MIDI && midi <= MAX_MIDI) {
    emit('update:modelValue', midi)
  }
}

function onNoteChange(event: Event) {
  update(Number((event.target as HTMLSelectElement).value), octave.value)
}

function onOctaveChange(event: Event) {
  update(pitchClass.value, Number((event.target as HTMLSelectElement).value))
}
</script>

<style scoped>
.tonic-picker {
  display: inline-flex;
  gap: 0.35rem;
}

select {
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  min-height: 40px;
}
</style>
