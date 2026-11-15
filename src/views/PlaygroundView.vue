<template>
  <div class="playground">
    <div class="heading-row">
      <BackButton fallback="/" />
      <h1>Аппликатуры</h1>
    </div>
    <p class="subtitle">
      Выберите инструмент, материал и окно ладов. Открытые струны разрешены и не расширяют окно.
    </p>

    <div class="tabs material-tabs" role="tablist" aria-label="Материал">
      <button
        v-for="option in kinds"
        :key="option.value"
        type="button"
        class="tab"
        role="tab"
        :aria-selected="kind === option.value"
        :class="{ active: kind === option.value }"
        @click="kind = option.value"
      >
        <AppIcon :name="option.icon" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="controls">
      <label class="control">
        <span>Инструмент</span>
        <InstrumentPicker v-model="instrumentId" :instruments="instrumentsStoreInstance.instruments" />
      </label>

      <label v-if="kind === 'scale'" class="control">
        <span>Лад</span>
        <ModePicker v-model="modeId" :modes="modesStoreInstance.modes" />
      </label>
      <label v-else class="control">
        <span>Аккорд</span>
        <ChordPicker v-model="chordId" :chords="chordsStoreInstance.chords" />
      </label>

      <div class="control">
        <span>Тоника</span>
        <TonicPicker v-model="tonic" />
      </div>

      <label class="control small">
        <span>Окно, ладов</span>
        <select v-model.number="span">
          <option v-for="value in spanOptions" :key="value" :value="value">{{ value }}</option>
        </select>
      </label>

      <div class="control">
        <span>Представление</span>
        <div class="segmented" role="group" aria-label="Представление аппликатуры">
          <button
            type="button"
            :class="{ active: view === 'fretboard' }"
            @click="view = 'fretboard'"
          >
            <AppIcon name="shapes" />
            <span>Гриф</span>
          </button>
          <button
            type="button"
            :class="{ active: view === 'tablature' }"
            @click="view = 'tablature'"
          >
            <AppIcon name="tablature" />
            <span>Табулатура</span>
          </button>
        </div>
      </div>

      <label v-if="kind === 'chord'" class="control checkbox">
        <input v-model="allowMuted" type="checkbox" />
        <span>разрешить приглушённые струны</span>
      </label>
    </div>

    <p v-if="fretboard.error" class="error">{{ fretboard.error }}</p>

    <div v-if="!canBuild" class="empty">
      <template v-if="!instrumentId">
        Сначала добавьте инструмент в разделе «Справочники».
      </template>
      <template v-else-if="kind === 'scale' && !modeId">
        Выберите лад или добавьте его в справочниках.
      </template>
      <template v-else-if="kind !== 'scale' && !chordId">
        Выберите аккорд или добавьте его в справочниках.
      </template>
    </div>

    <div v-else-if="fretboard.isLoading && !fretboard.fingerings" class="empty">Строим аппликатуры…</div>

    <template v-else-if="fretboard.fingerings">
      <div class="results-head">
        <h2>{{ materialTitle }}</h2>
        <span class="count">вариантов: {{ visibleFingerings.length }}</span>
      </div>

      <p v-if="fretboard.fingerings.truncated" class="notice">
        Показаны не все варианты: сработал лимит. Уменьшите окно ладов или уточните запрос.
      </p>

      <div v-if="visibleFingerings.length === 0" class="empty">
        Подходящих аппликатур не найдено. Попробуйте увеличить окно ладов или выбрать другой материал.
      </div>

      <div v-else class="shape-grid">
        <ShapeCard
          v-for="(fingering, index) in visibleFingerings"
          :key="index"
          :fingering="fingering"
          :open-notes="openNotes"
          :frets="frets"
          :span="span"
          :show-mutes="kind === 'chord' && allowMuted"
          :view="view"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import InstrumentPicker from '@/components/InstrumentPicker.vue'
import ModePicker from '@/components/ModePicker.vue'
import ChordPicker from '@/components/ChordPicker.vue'
import TonicPicker from '@/components/TonicPicker.vue'
import ShapeCard from '@/components/ShapeCard.vue'
import AppIcon from '@/components/AppIcon.vue'
import type { IconName } from '@/components/icons'
import { instrumentsStore } from '@/stores/instruments'
import { modesStore } from '@/stores/modes'
import { chordsStore } from '@/stores/chords'
import { fretboardStore } from '@/stores/fretboard'
import { noteName } from '@/api'
import type { Fingering } from '@/api'

type Kind = 'scale' | 'arpeggio' | 'chord'
type ShapeView = 'fretboard' | 'tablature'

const kinds: { value: Kind; label: string; icon: IconName }[] = [
  { value: 'scale', label: 'Гамма', icon: 'mode' },
  { value: 'arpeggio', label: 'Арпеджио', icon: 'arpeggio' },
  { value: 'chord', label: 'Аккорд', icon: 'chord' }
]

const SHAPE_VIEW_KEY = 'strings.shapes.view'

const route = useRoute()
const instrumentsStoreInstance = instrumentsStore()
const modesStoreInstance = modesStore()
const chordsStoreInstance = chordsStore()
const fretboard = fretboardStore()

const kind = ref<Kind>(parseKind(route.query.kind))
const instrumentId = ref<string | null>(queryString('instrumentId'))
const modeId = ref<string | null>(queryString('modeId'))
const chordId = ref<string | null>(queryString('chordId'))
const tonic = ref<number>(queryNumber('tonic') ?? 60)
const span = ref<number>(queryNumber('span') ?? (kind.value === 'chord' ? 4 : 5))
const allowMuted = ref<boolean>(route.query.allowMuted !== 'false')
const view = ref<ShapeView>(readShapeView())

const ready = ref(false)
const spanOptions = Array.from({ length: 11 }, (_, index) => index + 2)

const selectedInstrument = computed(() =>
  instrumentsStoreInstance.instruments.find(item => item.id === instrumentId.value) ?? null
)
const openNotes = computed(() => selectedInstrument.value?.tuning ?? [])
const frets = computed(() => selectedInstrument.value?.frets ?? 0)

const canBuild = computed(() => {
  if (!instrumentId.value) return false
  if (kind.value === 'scale') return Boolean(modeId.value)
  return Boolean(chordId.value)
})

// After the 12th fret the fretboard repeats structurally, so shapes whose leftmost note is above it are not shown.
const visibleFingerings = computed(() =>
  (fretboard.fingerings?.items ?? []).filter(fingering => lowestFret(fingering) <= 12)
)

function lowestFret(fingering: Fingering): number {
  return fingering.positions.reduce(
    (lowest, position) => Math.min(lowest, position.fret),
    Number.POSITIVE_INFINITY
  )
}

const materialTitle = computed(() => {
  if (kind.value === 'scale') {
    const mode = modesStoreInstance.modes.find(item => item.id === modeId.value)
    return `${mode?.name ?? 'Лад'} · ${noteName(tonic.value)}`
  }
  const chord = chordsStoreInstance.chords.find(item => item.id === chordId.value)
  const suffix = kind.value === 'arpeggio' ? 'арпеджио' : 'аккорд'
  return `${chord?.name ?? 'Аккорд'} · ${suffix} · ${noteName(tonic.value)}`
})

function readShapeView(): ShapeView {
  try {
    return window.localStorage.getItem(SHAPE_VIEW_KEY) === 'tablature' ? 'tablature' : 'fretboard'
  } catch {
    return 'fretboard'
  }
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

function parseKind(value: unknown): Kind {
  return value === 'arpeggio' || value === 'chord' ? value : 'scale'
}

async function loadAll(): Promise<void> {
  if (!canBuild.value || !instrumentId.value) {
    fretboard.reset()
    return
  }
  await fretboard.loadGrid(instrumentId.value)
  if (kind.value === 'scale' && modeId.value) {
    await fretboard.loadScales({
      instrumentId: instrumentId.value,
      modeId: modeId.value,
      tonic: tonic.value,
      span: span.value
    })
  } else if (kind.value === 'arpeggio' && chordId.value) {
    await fretboard.loadArpeggios({
      instrumentId: instrumentId.value,
      chordId: chordId.value,
      tonic: tonic.value,
      span: span.value
    })
  } else if (kind.value === 'chord' && chordId.value) {
    await fretboard.loadChordShapes({
      instrumentId: instrumentId.value,
      chordId: chordId.value,
      tonic: tonic.value,
      span: span.value,
      allowMuted: allowMuted.value
    })
  }
}

onMounted(async () => {
  await Promise.all([
    instrumentsStoreInstance.load(),
    modesStoreInstance.load(),
    chordsStoreInstance.load()
  ])
  if (!instrumentId.value) {
    instrumentId.value = instrumentsStoreInstance.instruments[0]?.id ?? null
  }
  if (!modeId.value) {
    modeId.value = modesStoreInstance.modes[0]?.id ?? null
  }
  if (!chordId.value) {
    chordId.value = chordsStoreInstance.chords[0]?.id ?? null
  }
  ready.value = true
  await loadAll()
})

watch([kind, instrumentId, modeId, chordId, tonic, span, allowMuted], () => {
  if (ready.value) {
    void loadAll()
  }
}, { flush: 'sync' })

watch(view, (value) => {
  try {
    window.localStorage.setItem(SHAPE_VIEW_KEY, value)
  } catch {
    // Storage may be unavailable; the in-memory setting still works.
  }
})
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

.material-tabs {
  margin-bottom: 0.75rem;
}

.controls {
  display: grid;
  grid-template-columns: 1fr;
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
  min-width: 0;
}

.control > span:first-child {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-muted);
}

.control.small select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  min-height: 42px;
}

.control.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.control.checkbox span {
  font-size: 0.88rem;
  color: var(--color-text);
}

.segmented {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.segmented button {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  border: none;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  min-height: 42px;
}

.segmented button + button {
  border-left: 1px solid var(--color-border);
}

.segmented button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
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

.notice {
  margin-bottom: 0.8rem;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  background: var(--color-danger-soft);
  color: var(--color-text);
  font-size: 0.88rem;
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

.shape-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 600px) {
  .controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .controls {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .shape-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>
