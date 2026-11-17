<template>
  <div class="match-view">
    <div class="heading-row">
      <BackButton fallback="/" />
      <h1>Подбор лада</h1>
    </div>
    <p class="subtitle">
      Укажите аккорды и их тоники — сервис найдёт лады и тональности, в которые укладываются все ноты.
    </p>

    <div class="rows">
      <div v-for="(row, index) in rows" :key="index" class="row">
        <span class="row-index">{{ index + 1 }}</span>
        <div class="row-control grow">
          <span>Аккорд</span>
          <ChordPicker v-model="row.chordId" :chords="chordsStoreInstance.chords" />
        </div>
        <div class="row-control">
          <span>Тоника аккорда</span>
          <TonicPicker v-model="row.tonic" />
        </div>
        <button
          class="remove-btn"
          type="button"
          title="Удалить аккорд"
          :disabled="rows.length <= 1"
          @click="removeRow(index)"
        >×</button>
      </div>
    </div>

    <div class="actions">
      <button class="secondary-btn" type="button" :disabled="rows.length >= 20" @click="addRow">
        Добавить аккорд
      </button>
      <button
        class="build-btn"
        type="button"
        :disabled="!canSubmit || matching.isLoading"
        @click="submit"
      >{{ matching.isLoading ? 'Ищем…' : 'Подобрать лады' }}</button>
    </div>

    <p v-if="matching.error" class="error">{{ matching.error }}</p>

    <template v-if="matching.modeMatches.length > 0">
      <div class="results-head">
        <h2>Подходящие лады</h2>
        <span class="count">найдено: {{ matching.modeMatches.length }}</span>
      </div>

      <div class="match-list">
        <div v-for="item in matching.modeMatches" :key="`${item.modeId}-${item.tonicPitchClass}`" class="match-row">
          <div class="match-main">
            <strong :class="entityClass(item.global)" :title="item.global ? 'Общий лад' : 'Мой лад'">
              <span class="tonic">{{ noteLabel(item.tonicNote) }}</span>
              <span>{{ item.modeName }}</span>
            </strong>
          </div>
          <code class="formula">{{ degrees(item.intervals) }}</code>
          <div class="row-actions">
            <button
              type="button"
              class="icon-action"
              title="Аппликатуры"
              aria-label="Аппликатуры"
              @click="openScale(item)"
            >
              <AppIcon name="shapes" />
            </button>
            <button
              type="button"
              class="icon-action"
              title="Аккорды в ладу"
              aria-label="Аккорды в ладу"
              @click="openChords(item)"
            >
              <AppIcon name="chord" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="!matching.isLoading && searched" class="empty">
      Ни один лад не подходит под указанные аккорды.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import ChordPicker from '@/components/ChordPicker.vue'
import TonicPicker from '@/components/TonicPicker.vue'
import AppIcon from '@/components/AppIcon.vue'
import { chordsStore } from '@/stores/chords'
import { matchingStore } from '@/stores/matching'
import type { ChordTonicRequest, ModeMatch } from '@/api'
import { noteLabel } from '@/api'

interface Row {
  chordId: string | null
  tonic: number
}

const router = useRouter()
const chordsStoreInstance = chordsStore()
const matching = matchingStore()

const rows = ref<Row[]>([{ chordId: null, tonic: 60 }])
const searched = ref(false)

const canSubmit = computed(() =>
  rows.value.length > 0 && rows.value.every(row => row.chordId !== null)
)

function degrees(intervals: number[]): string {
  const result = [0]
  intervals.forEach((step, index) => result.push(result[index] + step))
  return result.join(' · ')
}

function entityClass(global: boolean): string {
  return global ? 'entity-global' : 'entity-own'
}

function addRow() {
  if (rows.value.length >= 20) return
  rows.value.push({ chordId: chordsStoreInstance.chords[0]?.id ?? null, tonic: 60 })
}

function removeRow(index: number) {
  if (rows.value.length <= 1) return
  rows.value.splice(index, 1)
}

async function submit() {
  const request: ChordTonicRequest[] = rows.value
    .filter((row): row is Row & { chordId: string } => row.chordId !== null)
    .map(row => ({ chordId: row.chordId, tonic: row.tonic }))
  if (request.length === 0) return
  searched.value = true
  await matching.findModes(request)
}

function openScale(item: ModeMatch) {
  router.push({
    path: '/playground',
    query: {
      kind: 'scale',
      modeId: item.modeId,
      tonic: String(60 + item.tonicPitchClass),
      span: '5'
    }
  })
}

function openChords(item: ModeMatch) {
  router.push({
    path: '/modes/chords',
    query: {
      modeId: item.modeId,
      tonic: String(60 + item.tonicPitchClass)
    }
  })
}

onMounted(async () => {
  await chordsStoreInstance.load()
  if (!rows.value[0].chordId) {
    rows.value[0].chordId = chordsStoreInstance.chords[0]?.id ?? null
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

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.row-index {
  align-self: center;
  width: 1.4rem;
  color: var(--color-muted);
  text-align: right;
}

.row-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 170px;
}

.row-control.grow {
  flex: 1;
}

.row-control > span {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.remove-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-danger);
  cursor: pointer;
}

.remove-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.secondary-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  min-height: 42px;
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: default;
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

.match-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.match-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.8rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.match-main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  margin-right: auto;
  min-width: 0;
}

.match-main strong {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
  overflow-wrap: anywhere;
}

.tonic {
  font-size: 1.05em;
  font-weight: 100;
  color: var(--color-overlay)
}

.formula {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
