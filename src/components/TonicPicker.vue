<template>
  <select
    class="tonic-select"
    :value="pitchClass"
    aria-label="Тоника"
    @change="onNoteChange"
  >
    <option v-for="(name, index) in NOTE_NAMES" :key="name" :value="index">{{ name }}</option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { floorMod, MAX_MIDI, MIN_MIDI, NOTE_NAMES } from '@/api'

const props = defineProps<{ modelValue: number }>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const pitchClass = computed(() => floorMod(props.modelValue, 12))
const octave = computed(() => Math.floor(props.modelValue / 12) - 1)

function onNoteChange(event: Event) {
  const nextPitchClass = Number((event.target as HTMLSelectElement).value)
  const midi = (octave.value + 1) * 12 + nextPitchClass
  if (midi >= MIN_MIDI && midi <= MAX_MIDI) {
    emit('update:modelValue', midi)
  }
}
</script>

<style scoped>
.tonic-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  min-height: 42px;
}
</style>
