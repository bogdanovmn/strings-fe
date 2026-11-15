<template>
  <div class="tuning-editor">
    <div v-for="(midi, index) in modelValue" :key="index" class="tuning-row">
      <span class="string-label">{{ index + 1 }}<template v-if="index === 0"> (низкая)</template></span>
      <select :value="pitchClass(midi)" @change="setNote(index, Number(($event.target as HTMLSelectElement).value))">
        <option v-for="(name, noteIndex) in NOTE_NAMES" :key="name" :value="noteIndex">{{ name }}</option>
      </select>
      <select
        :value="octave(midi)"
        aria-label="Октава открытой струны"
        @change="setOctave(index, Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="value in octaves" :key="value" :value="value">{{ value }}</option>
      </select>
      <span class="note-result">{{ noteName(midi) }}</span>
      <button
        type="button"
        class="remove-btn"
        :disabled="modelValue.length <= MIN_STRINGS"
        title="Удалить струну"
        @click="remove(index)"
      >×</button>
    </div>

    <button
      type="button"
      class="add-btn"
      :disabled="modelValue.length >= MAX_STRINGS"
      @click="add"
    >Добавить струну</button>

    <p class="hint">
      Струны перечисляются от самой низкой к самой высокой. Октава нужна только для выбора высоты открытой струны.
    </p>
  </div>
</template>

<script setup lang="ts">
import { floorMod, MAX_MIDI, MAX_STRINGS, MIN_MIDI, MIN_STRINGS, NOTE_NAMES, noteName } from '@/api'

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function pitchClass(midi: number): number {
  return floorMod(midi, 12)
}

function octave(midi: number): number {
  return Math.floor(midi / 12) - 1
}

function emitValue(tuning: number[]) {
  emit('update:modelValue', tuning)
}

function setNote(index: number, value: number) {
  const next = [...props.modelValue]
  const midi = (octave(next[index]) + 1) * 12 + value
  next[index] = Math.min(MAX_MIDI, Math.max(MIN_MIDI, midi))
  emitValue(next)
}

function setOctave(index: number, value: number) {
  const next = [...props.modelValue]
  const midi = (value + 1) * 12 + pitchClass(next[index])
  next[index] = Math.min(MAX_MIDI, Math.max(MIN_MIDI, midi))
  emitValue(next)
}

function add() {
  if (props.modelValue.length >= MAX_STRINGS) return
  const last = props.modelValue[props.modelValue.length - 1] ?? 64
  emitValue([...props.modelValue, Math.min(108, last + 5)])
}

function remove(index: number) {
  if (props.modelValue.length <= MIN_STRINGS) return
  emitValue(props.modelValue.filter((_, i) => i !== index))
}
</script>

<style scoped>
.tuning-editor {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  padding: 0.75rem;
}

.tuning-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
}

.string-label {
  width: 3.4rem;
  color: var(--color-muted);
  font-size: 0.8rem;
}

select {
  padding: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.note-result {
  min-width: 2.6rem;
  color: var(--color-muted);
  font-size: 0.85rem;
}

.remove-btn {
  width: 32px;
  height: 32px;
  margin-left: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-danger);
  cursor: pointer;
}

.remove-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.add-btn {
  margin-top: 0.2rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.hint {
  margin-top: 0.6rem;
  color: var(--color-muted);
  font-size: 0.82rem;
}
</style>
