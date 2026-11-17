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
        <ModePicker v-model="modeId" :modes="availableModes" />
      </label>
      <div class="control">
        <span>Тоника лада</span>
        <TonicPicker v-model="tonic" />
      </div>
    </div>

    <p v-if="matching.error" class="error">{{ matching.error }}</p>

    <div v-if="!modeId" class="empty">
      Выберите лад или включите его в справочниках.
    </div>

    <template v-else-if="matching.chordsInMode.length > 0">
      <div class="list-meta">
        <span class="count">аккордов: {{ matching.chordsInMode.length }}</span>
      </div>

      <div class="chord-list">
        <div v-for="item in matching.chordsInMode" :key="rowKey(item)" class="chord-row">
          <div class="chord-main">
            <strong
              class="chord-name"
              :class="entityClass(item.global)"
              :title="item.global ? 'Общий аккорд' : 'Мой аккорд'"
            >
              <span class="chord-symbol">{{ noteLabel(item.rootNote) }}{{ item.chordSuffix }}</span>
              <span class="chord-full-name">{{ item.chordName }}</span>
            </strong>
          </div>

          <div class="row-actions">
            <div class="info-wrap">
              <button
                type="button"
                class="icon-action"
                title="Ступень и структура"
                aria-label="Ступень и структура"
                :aria-expanded="openInfo === rowKey(item)"
                @click="toggleInfo(item)"
              >
                <AppIcon name="info" />
              </button>
              <div v-if="openInfo === rowKey(item)" class="info-popover" role="dialog">
                <div class="info-line">
                  <span>Ступень</span>
                  <strong>{{ item.degree + 1 }}</strong>
                </div>
                <div class="info-line">
                  <span>Структура</span>
                  <code>{{ degrees(item.intervals) }}</code>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="icon-action"
              title="Аппликатуры"
              aria-label="Аппликатуры"
              @click="openShapes(item)"
            >
              <AppIcon name="shapes" />
            </button>
          </div>
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
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import ModePicker from '@/components/ModePicker.vue'
import TonicPicker from '@/components/TonicPicker.vue'
import AppIcon from '@/components/AppIcon.vue'
import { modesStore } from '@/stores/modes'
import { matchingStore } from '@/stores/matching'
import type { ChordInMode } from '@/api'
import { MAX_MIDI, MIN_MIDI, noteLabel } from '@/api'

const route = useRoute()
const router = useRouter()
const modesStoreInstance = modesStore()
const matching = matchingStore()

const modeId = ref<string | null>(queryString('modeId'))
const tonic = ref(initialTonic())
const ready = ref(false)
const openInfo = ref<string | null>(null)

const availableModes = computed(() => modesStoreInstance.modes.filter(item => item.enabled))

function initialTonic(): number {
  const value = queryNumber('tonic')
  return value !== null && value >= MIN_MIDI && value <= MAX_MIDI ? value : 60
}

function queryString(key: string): string | null {
  const value = route.query[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function queryNumber(key: string): number | null {
  const raw = queryString(key)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function rowKey(item: ChordInMode): string {
  return `${item.chordId}-${item.rootMidi}-${item.degree}`
}

function entityClass(global: boolean): string {
  return global ? 'entity-global' : 'entity-own'
}

function degrees(intervals: number[]): string {
  const result = [0]
  intervals.forEach((step, index) => result.push(result[index] + step))
  return result.join(' · ')
}

function toggleInfo(item: ChordInMode) {
  const key = rowKey(item)
  openInfo.value = openInfo.value === key ? null : key
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
  openInfo.value = null
  await matching.loadChordsInMode(modeId.value, tonic.value)
}

onMounted(async () => {
  await modesStoreInstance.load()
  const requestedModeId = modeId.value
  modeId.value = availableModes.value.find(item => item.id === requestedModeId)?.id
    ?? availableModes.value[0]?.id
    ?? null
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

.list-meta {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.45rem;
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
  flex-wrap: wrap;
  margin-right: auto;
  min-width: 0;
}

.chord-name {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
  overflow-wrap: anywhere;
}

.chord-tonic {
  font-size: 1.05em;
  font-weight: 100;
  color: var(--color-overlay)
}

.chord-symbol {
  font-size: 1.05em;
}

.chord-full-name {
  color: var(--color-muted);
  font-size: 0.85em;
  font-weight: 400;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.info-wrap {
  position: relative;
}

.info-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 210px;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: 0 10px 24px var(--color-overlay);
  font-size: 0.85rem;
}

.info-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.info-line > span {
  color: var(--color-muted);
}

.info-line code {
  color: var(--color-text);
  white-space: nowrap;
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
