<template>
  <div class="chords-in-mode">
    <div class="heading-row">
      <BackButton fallback="/" />
      <h1>Аккорды в ладу</h1>
    </div>
    <p class="subtitle">
      Все аккорды на ступенях выбранного лада, все ноты которых входят в его звукоряд.
    </p>

    <div class="controls">
      <label class="control">
        <span>Лад</span>
        <ModePicker v-model="modeId" :modes="modesStoreInstance.modes" />
      </label>
      <div class="control">
        <span>Тоника лада</span>
        <TonicPicker v-model="tonic" :min-octave="1" :max-octave="7" />
      </div>
      <button class="build-btn" :disabled="!modeId || matching.isLoading" @click="load">
        {{ matching.isLoading ? 'Ищем…' : 'Найти аккорды' }}
      </button>
    </div>

    <p v-if="matching.error" class="error">{{ matching.error }}</p>

    <div v-if="!modeId" class="empty">
      Выберите лад или добавьте его в справочниках.
    </div>

    <template v-else-if="matching.chordsInMode.length > 0">
      <div class="results-head">
        <h2>{{ modeName }} · {{ noteName(tonic) }}</h2>
        <span class="count">аккордов: {{ matching.chordsInMode.length }}</span>
      </div>

      <div class="chord-list">
        <div v-for="item in matching.chordsInMode" :key="`${item.chordId}-${item.degree}`" class="chord-row">
          <div class="chord-main">
            <strong>{{ item.chordName }}</strong>
            <span class="root">на {{ item.rootNote }}</span>
          </div>
          <span class="degree">ступень {{ item.degree + 1 }}</span>
          <code class="formula">{{ degrees(item.intervals) }}</code>
          <span v-if="item.global" class="badge">общий</span>
          <button class="link-btn" @click="openShapes(item)">Аппликатуры</button>
        </div>
      </div>
    </template>

    <div v-else-if="!matching.isLoading" class="empty">
      Для этого лада и тоники подходящих аккордов не нашлось.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import ModePicker from '@/components/ModePicker.vue'
import TonicPicker from '@/components/TonicPicker.vue'
import { modesStore } from '@/stores/modes'
import { matchingStore } from '@/stores/matching'
import type { ChordInMode } from '@/api'
import { noteName } from '@/api'

const router = useRouter()
const modesStoreInstance = modesStore()
const matching = matchingStore()

const modeId = ref<string | null>(null)
const tonic = ref(60)
const ready = ref(false)

const modeName = computed(() => modesStoreInstance.modes.find(item => item.id === modeId.value)?.name ?? 'Лад')

function degrees(intervals: number[]): string {
  const result = [0]
  intervals.forEach((step, index) => result.push(result[index] + step))
  return result.join(' · ')
}

function openShapes(item: ChordInMode) {
  router.push({
    path: '/playground',
    query: {
      kind: 'chord',
      chordId: item.chordId,
      tonic: String(item.rootMidi),
      span: '4'
    }
  })
}

async function load(): Promise<void> {
  if (!modeId.value) return
  await matching.loadChordsInMode(modeId.value, tonic.value)
}

onMounted(async () => {
  await modesStoreInstance.load()
  if (!modeId.value) {
    modeId.value = modesStoreInstance.modes[0]?.id ?? null
  }
  ready.value = true
  await load()
})

watch([modeId, tonic], () => {
  if (ready.value) {
    void load()
  }
}, { flush: 'sync' })
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.35rem;
}

.subtitle {
  color: var(--color-muted);
  margin-bottom: 1rem;
  font-size: 0.92rem;
}

.controls {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  margin-bottom: 1.25rem;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
}

.control > span:first-child {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-muted);
}

.build-btn {
  padding: 0.55rem 1.2rem;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  cursor: pointer;
  min-height: 42px;
  font-size: 1rem;
}

.build-btn:disabled {
  opacity: 0.55;
  cursor: default;
}

.results-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}

.results-head h2 {
  font-size: 1.15rem;
}

.count {
  color: var(--color-muted);
  font-size: 0.88rem;
}

.chord-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.chord-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.8rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.chord-main {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-right: auto;
}

.root {
  color: var(--color-muted);
  font-size: 0.88rem;
}

.degree {
  font-size: 0.8rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--color-primary-soft);
  white-space: nowrap;
}

.formula {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.badge {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.link-btn {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-primary);
  cursor: pointer;
  min-height: 36px;
}

.link-btn:hover {
  background: var(--color-primary-soft);
}

.error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-muted);
}
</style>
