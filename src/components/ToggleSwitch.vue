<template>
  <button
    type="button"
    class="toggle"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    :title="modelValue ? 'Используется' : 'Не используется'"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-track" :class="{ on: modelValue }" aria-hidden="true">
      <span class="toggle-thumb" />
    </span>
    <span class="toggle-label" :class="{ on: modelValue }">
      {{ modelValue ? onLabel : offLabel }}
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
  label?: string
  onLabel?: string
  offLabel?: string
}>(), {
  disabled: false,
  label: undefined,
  onLabel: 'ON',
  offLabel: 'OFF'
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped>
.toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-muted);
  cursor: pointer;
  min-height: 36px;
}

.toggle:disabled {
  opacity: 0.5;
  cursor: default;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border-strong);
  transition: background-color 0.15s;
}

.toggle-track.on {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 1px 3px var(--color-overlay);
  transition: transform 0.15s;
}

.toggle-track.on .toggle-thumb {
  transform: translateX(18px);
}

.toggle-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-muted);
}

.toggle-label.on {
  color: var(--color-primary);
}
</style>
