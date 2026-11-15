<template>
  <div class="interval-editor">
    <div v-for="(step, index) in modelValue" :key="index" class="interval-row">
      <span class="degree">{{ index + 1 }}</span>
      <button type="button" class="step-btn" :disabled="step <= 1" @click="setStep(index, step - 1)">−</button>
      <input
        type="number"
        min="1"
        max="12"
        :value="step"
        @change="setStep(index, Number(($event.target as HTMLInputElement).value))"
      />
      <button type="button" class="step-btn" :disabled="step >= 12" @click="setStep(index, step + 1)">+</button>
      <span class="shift">+{{ cumulative[index + 1] }} полутонов</span>
      <button
        type="button"
        class="remove-btn"
        :disabled="modelValue.length <= minSteps"
        title="Удалить ступень"
        @click="remove(index)"
      >×</button>
    </div>

    <div class="summary">
      <span :class="{ invalid: !valid }">
        Интервалов: {{ modelValue.length }} · сумма: {{ total }}
        <template v-if="requireOctave"> (нужно 12)</template>
      </span>
      <button
        type="button"
        class="add-btn"
        :disabled="modelValue.length >= maxSteps"
        @click="add"
      >Добавить ступень</button>
    </div>

    <p class="hint">
      Интервалы — расстояния в полутонах между соседними ступенями.
      <template v-if="requireOctave">Лад должен замыкать октаву: сумма всех интервалов равна 12.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number[]
  minSteps: number
  maxSteps: number
  requireOctave?: boolean
}>(), {
  requireOctave: false
})

const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const total = computed(() => props.modelValue.reduce((sum, step) => sum + step, 0))
const cumulative = computed(() => {
  const result = [0]
  props.modelValue.forEach((step, index) => result.push(result[index] + step))
  return result
})
const valid = computed(() =>
  props.modelValue.length >= props.minSteps
  && props.modelValue.length <= props.maxSteps
  && props.modelValue.every(step => step > 0)
  && (!props.requireOctave || total.value === 12)
)

function emitValue(steps: number[]) {
  emit('update:modelValue', steps)
}

function setStep(index: number, value: number) {
  const next = [...props.modelValue]
  next[index] = Math.min(12, Math.max(1, Math.round(value) || 1))
  emitValue(next)
}

function add() {
  if (props.modelValue.length >= props.maxSteps) return
  emitValue([...props.modelValue, 1])
}

function remove(index: number) {
  if (props.modelValue.length <= props.minSteps) return
  emitValue(props.modelValue.filter((_, i) => i !== index))
}
</script>

<style scoped>
.interval-editor {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  padding: 0.75rem;
}

.interval-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
}

.degree {
  width: 1.4rem;
  text-align: right;
  color: var(--color-muted);
  font-size: 0.85rem;
}

input {
  width: 3.6rem;
  padding: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  text-align: center;
  background: var(--color-surface);
}

.step-btn,
.remove-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  cursor: pointer;
  line-height: 1;
}

.step-btn:disabled,
.remove-btn:disabled,
.add-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.remove-btn {
  color: var(--color-danger);
  margin-left: auto;
}

.shift {
  color: var(--color-muted);
  font-size: 0.82rem;
  white-space: nowrap;
}

.summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  font-size: 0.9rem;
}

.summary .invalid {
  color: var(--color-danger);
  font-weight: 500;
}

.add-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  cursor: pointer;
}

.hint {
  margin-top: 0.5rem;
  color: var(--color-muted);
  font-size: 0.82rem;
}
</style>
