<template>
  <select
    class="entity-picker"
    :value="modelValue ?? ''"
    :disabled="disabled"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="item in chords" :key="item.id" :value="item.id">
      {{ item.name }}{{ item.global ? ' · общий' : '' }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { Chord } from '@/api'

withDefaults(defineProps<{
  modelValue: string | null
  chords: Chord[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: 'Выберите аккорд',
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>

<style scoped>
.entity-picker {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  min-height: 42px;
}
</style>
