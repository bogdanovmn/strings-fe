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
        <InstrumentPicker v-model="instrumentId" :instruments="availableInstruments" />
      </label>

      <label v-if="kind === 'scale'" class="control">
        <span>Лад</span>
        <ModePicker v-model="modeId" :modes="availableModes" />
      </label>
      <label v-else class="control">
        <span>Аккорд</span>
        <ChordPicker v-model="chordId" :chords="availableChords" />
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
    </div>

    <p v-if="fretboard.error" class="error">{{ fretboard.error }}</p>

    <div v-if="!canBuild" class="empty">
      <template v-if="!instrumentId">
        Сначала добавьте инструмент или включите его в разделе «Справочники».
      </template>
      <template v-else-if="kind === 'scale' && !modeId">
        Выберите лад или включите его в справочниках.
      </template>
      <template v-else-if="kind !== 'scale' && !chordId">
        Выберите аккорд или включите его в справочниках.
      </template>
    </div>

    <div v-else-if="fretboard.isLoading && !fretboard.fingerings" class="empty">Строим аппликатуры…</div>

    <template v-else-if="fretboard.fingerings">
      <div class="results-head">
        <span class="count">
          вариантов: {{ filteredFingerings.length }}<template v-if="hasActiveFilters"> из {{ visibleFingerings.length }}</template>
        </span>
      </div>

      <p v-if="fretboard.fingerings.truncated" class="notice">
        Показаны не все варианты: сработал лимит. Уменьшите окно ладов или уточните запрос.
      </p>

      <div v-if="visibleFingerings.length === 0" class="empty">
        Подходящих аппликатур не найдено. Попробуйте увеличить окно ладов или выбрать другой материал.
      </div>

      <template v-else>
        <div v-if="showFilters" class="filters" role="group" aria-label="Фильтры аппликатур">
          <div v-if="positionOptions.length > 1" class="filter-group">
            <span class="filter-label">Позиция</span>
            <div class="filter-chips">
              <button
                v-for="option in positionOptions"
                :key="`position-${option.value}`"
                type="button"
                class="filter-chip"
                :class="{ active: positionFilter.includes(option.value) }"
                :aria-pressed="positionFilter.includes(option.value)"
                @click="togglePosition(option.value)"
              >
                {{ option.label }}<span class="chip-count">{{ option.count }}</span>
              </button>
            </div>
          </div>

          <div v-if="mutedOptions.length > 0" class="filter-group">
            <span class="filter-label">Приглушённые</span>
            <div class="filter-chips">
              <button
                v-for="option in mutedOptions"
                :key="`muted-${option.value}`"
                type="button"
                class="filter-chip"
                :class="{ active: mutedFilter.includes(option.value) }"
                :aria-pressed="mutedFilter.includes(option.value)"
                @click="toggleMuted(option.value)"
              >
                {{ option.label }}<span class="chip-count">{{ option.count }}</span>
              </button>
            </div>
          </div>

          <div v-if="openOptions.length > 0" class="filter-group">
            <span class="filter-label">Открытые</span>
            <div class="filter-chips">
              <button
                v-for="option in openOptions"
                :key="`open-${option.value}`"
                type="button"
                class="filter-chip"
                :class="{ active: openFilter.includes(option.value) }"
                :aria-pressed="openFilter.includes(option.value)"
                @click="toggleOpen(option.value)"
              >
                {{ option.label }}<span class="chip-count">{{ option.count }}</span>
              </button>
            </div>
          </div>

          <button v-if="hasActiveFilters" type="button" class="filter-reset" @click="resetFilters">
            Сбросить
          </button>
        </div>

        <div v-if="filteredFingerings.length === 0" class="empty">
          Под выбранные фильтры ничего не подошло.
        </div>

        <div v-else class="shape-grid">
          <ShapeCard
            v-for="(fingering, index) in filteredFingerings"
            :key="index"
            :fingering="fingering"
            :open-notes="openNotes"
            :frets="frets"
            :view="view"
            :show-mutes="kind === 'chord'"
          />
        </div>
      </template>
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
import type { Fingering } from '@/api'

type Kind = 'scale' | 'arpeggio' | 'chord'
type ShapeView = 'fretboard' | 'tablature'

interface SavedForm {
  kind?: Kind
  instrumentId?: string | null
  modeId?: string | null
  chordId?: string | null
  tonic?: number
  span?: number
}

interface FilterOption {
  value: number
  label: string
  count: number
}

interface PresenceOption {
  value: boolean
  label: string
  count: number
}

const kinds: { value: Kind; label: string; icon: IconName }[] = [
  { value: 'scale', label: 'Гамма', icon: 'mode' },
  { value: 'arpeggio', label: 'Арпеджио', icon: 'arpeggio' },
  { value: 'chord', label: 'Аккорд', icon: 'chord' }
]

const FORM_KEY = 'strings.playground.form'
const SHAPE_VIEW_KEY = 'strings.shapes.view'

const route = useRoute()
const instrumentsStoreInstance = instrumentsStore()
const modesStoreInstance = modesStore()
const chordsStoreInstance = chordsStore()
const fretboard = fretboardStore()

const savedForm = readSavedForm()
const kind = ref<Kind>(parseKind(route.query.kind ?? savedForm.kind))
const instrumentId = ref<string | null>(queryString('instrumentId') ?? savedString(savedForm.instrumentId))
const modeId = ref<string | null>(queryString('modeId') ?? savedString(savedForm.modeId))
const chordId = ref<string | null>(queryString('chordId') ?? savedString(savedForm.chordId))
const tonic = ref<number>(queryNumber('tonic') ?? savedNumber(savedForm.tonic) ?? 60)
const span = ref<number>(queryNumber('span') ?? savedNumber(savedForm.span) ?? (kind.value === 'chord' ? 4 : 5))
const view = ref<ShapeView>(readShapeView())

const ready = ref(false)
const spanOptions = Array.from({ length: 11 }, (_, index) => index + 2)

const positionFilter = ref<number[]>([])
const mutedFilter = ref<boolean[]>([])
const openFilter = ref<boolean[]>([])

const selectedInstrument = computed(() =>
  instrumentsStoreInstance.instruments.find(item => item.id === instrumentId.value) ?? null
)
const openNotes = computed(() => selectedInstrument.value?.tuning ?? [])
const frets = computed(() => selectedInstrument.value?.frets ?? 0)

const availableInstruments = computed(() =>
  instrumentsStoreInstance.instruments.filter(item => item.enabled)
)
const availableModes = computed(() =>
  modesStoreInstance.modes.filter(item => item.enabled)
)
const availableChords = computed(() =>
  chordsStoreInstance.chords.filter(item => item.enabled)
)

const canBuild = computed(() => {
  if (!instrumentId.value) return false
  if (kind.value === 'scale') return Boolean(modeId.value)
  return Boolean(chordId.value)
})

// After the 12th fret the fretboard repeats structurally, so shapes whose leftmost note is above it are not shown.
const visibleFingerings = computed(() =>
  (fretboard.fingerings?.items ?? []).filter(fingering => lowestFret(fingering) <= 12)
)

const positionOptions = computed<FilterOption[]>(() => {
  const counts = new Map<number, number>()
  for (const fingering of visibleFingerings.value) {
    const position = positionKey(fingering)
    counts.set(position, (counts.get(position) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([first], [second]) => first - second)
    .map(([value, count]) => ({
      value,
      label: value === 0 ? 'Открытая' : String(value),
      count
    }))
})

const mutedOptions = computed(() =>
  kind.value === 'chord' ? presenceOptions(visibleFingerings.value, hasMutedStrings) : []
)
const openOptions = computed(() =>
  presenceOptions(visibleFingerings.value, hasOpenStrings)
)

const showFilters = computed(() =>
  kind.value === 'chord'
    && (positionOptions.value.length > 1 || mutedOptions.value.length > 0 || openOptions.value.length > 0)
)

const hasActiveFilters = computed(() =>
  positionFilter.value.length > 0 || mutedFilter.value.length > 0 || openFilter.value.length > 0
)

const filteredFingerings = computed(() =>
  visibleFingerings.value.filter(fingering => {
    if (positionFilter.value.length > 0 && !positionFilter.value.includes(positionKey(fingering))) {
      return false
    }
    if (mutedFilter.value.length > 0 && !mutedFilter.value.includes(hasMutedStrings(fingering))) {
      return false
    }
    if (openFilter.value.length > 0 && !openFilter.value.includes(hasOpenStrings(fingering))) {
      return false
    }
    return true
  })
)

function lowestFret(fingering: Fingering): number {
  return fingering.positions.reduce(
    (lowest, position) => Math.min(lowest, position.fret),
    Number.POSITIVE_INFINITY
  )
}

function positionKey(fingering: Fingering): number {
  return fingering.baseFret <= 1 && hasOpenStrings(fingering) ? 0 : fingering.baseFret
}

function hasOpenStrings(fingering: Fingering): boolean {
  return fingering.positions.some(position => position.fret === 0)
}

function hasMutedStrings(fingering: Fingering): boolean {
  return fingering.positions.length < openNotes.value.length
}

function presenceOptions(
  fingerings: Fingering[],
  predicate: (fingering: Fingering) => boolean
): PresenceOption[] {
  const yes = fingerings.filter(predicate).length
  const no = fingerings.length - yes
  if (yes === 0 || no === 0) return []
  return [
    { value: true, label: 'Есть', count: yes },
    { value: false, label: 'Нет', count: no }
  ]
}

function toggleValue<T>(values: T[], value: T): void {
  const index = values.indexOf(value)
  if (index >= 0) {
    values.splice(index, 1)
  } else {
    values.push(value)
  }
}

function togglePosition(value: number): void {
  toggleValue(positionFilter.value, value)
}

function toggleMuted(value: boolean): void {
  toggleValue(mutedFilter.value, value)
}

function toggleOpen(value: boolean): void {
  toggleValue(openFilter.value, value)
}

function resetFilters(): void {
  positionFilter.value = []
  mutedFilter.value = []
  openFilter.value = []
}

function readSavedForm(): SavedForm {
  try {
    const raw = window.localStorage.getItem(FORM_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as SavedForm : {}
  } catch {
    return {}
  }
}

function savedString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function savedNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function saveForm(): void {
  try {
    window.localStorage.setItem(FORM_KEY, JSON.stringify({
      kind: kind.value,
      instrumentId: instrumentId.value,
      modeId: modeId.value,
      chordId: chordId.value,
      tonic: tonic.value,
      span: span.value
    }))
  } catch {
    // Storage may be unavailable; the in-memory state still works.
  }
}

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
  resetFilters()
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
      span: span.value
    })
  }
}

onMounted(async () => {
  await Promise.all([
    instrumentsStoreInstance.load(),
    modesStoreInstance.load(),
    chordsStoreInstance.load()
  ])
  if (!availableInstruments.value.some(item => item.id === instrumentId.value)) {
    instrumentId.value = availableInstruments.value[0]?.id ?? null
  }
  if (!availableModes.value.some(item => item.id === modeId.value)) {
    modeId.value = availableModes.value[0]?.id ?? null
  }
  if (!availableChords.value.some(item => item.id === chordId.value)) {
    chordId.value = availableChords.value[0]?.id ?? null
  }
  saveForm()
  ready.value = true
  await loadAll()
})

watch([kind, instrumentId, modeId, chordId, tonic, span], () => {
  saveForm()
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

.count {
  color: var(--color-muted);
  font-size: 0.88rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.6rem 1.1rem;
  margin-bottom: 0.9rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filter-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.8rem;
  cursor: pointer;
  min-height: 32px;
}

.filter-chip:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-alt);
}

.filter-chip.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.chip-count {
  font-size: 0.7rem;
  opacity: 0.75;
}

.filter-reset {
  align-self: flex-end;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 0.8rem;
  cursor: pointer;
  min-height: 32px;
}

.filter-reset:hover {
  background: var(--color-primary-soft);
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
